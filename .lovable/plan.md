

# Notification System Implementation Plan

## Overview

This plan implements a comprehensive real-time notification system for Managers and SuperManagers. The system will track and notify about critical business events including loan requests, backup status, settings changes, inventory alerts, and suspicious order activity.

## Architecture

```text
+------------------+     +------------------+     +------------------+
|   Event Sources  | --> |  notifications   | --> |   Real-time      |
|   (DB Triggers)  |     |     (table)      |     |   Subscription   |
+------------------+     +------------------+     +------------------+
         |                       |                        |
         v                       v                        v
  - Loan requests          Stores all            - useNotifications hook
  - Backup events          notifications         - Header Bell icon
  - Settings changes       with metadata         - Notification panel
  - Stock alerts
  - Order anomalies
```

## Database Changes

### 1. New `notifications` Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| business_id | uuid | Business reference |
| branch_id | text | Optional branch reference |
| type | text | Notification category |
| title | text | Short notification title |
| message | text | Detailed message |
| metadata | jsonb | Additional context data |
| severity | text | info/warning/critical |
| is_read | boolean | Read status |
| created_by | uuid | User who triggered the event |
| created_at | timestamp | Creation time |

### 2. New `notification_recipients` Table

Links notifications to specific users (Managers/SuperManagers)

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| notification_id | uuid | References notifications |
| user_id | uuid | Recipient user id |
| is_read | boolean | Per-user read status |
| read_at | timestamp | When user read it |

### 3. Database Triggers

Triggers will be created to automatically generate notifications:

- **Loan Request Trigger**: On INSERT to `employee_loans` with status='pending'
- **Settings Change Trigger**: On UPDATE to `branch_settings`
- **Stock Alert Trigger**: On UPDATE to `inventory_items` when status changes to 'Out of Stock', 'Low Stock', or 'Expired'
- **Inventory Request Trigger**: On INSERT to `inventory_requests`
- **Backup Status Trigger**: On INSERT to `backup_history`

### 4. Order Anomaly Detection Function

A database function to track order modifications per user per time window:
- Counts updates/deletes by a cashier in last hour
- Triggers notification if threshold exceeded (configurable, e.g., 10 modifications in 1 hour)

## Frontend Components

### 1. `useNotifications` Hook
Location: `src/hooks/useNotifications.ts`

Responsibilities:
- Fetch unread notification count
- Fetch notification list with pagination
- Real-time subscription for new notifications
- Mark notifications as read
- Filter by type/severity

### 2. Updated Header Component
Location: `src/components/Header.tsx`

Changes:
- Replace hardcoded "3" badge with dynamic unread count
- Add click handler to open notification panel
- Integrate useNotifications hook

### 3. Notification Panel Component
Location: `src/components/notifications/NotificationPanel.tsx`

Features:
- Slide-out panel (Sheet) or Popover dropdown
- List of recent notifications grouped by date
- Type icons (bell for general, alert for warnings, etc.)
- Click to mark as read
- "Mark all as read" button
- Link to relevant page (e.g., click loan notification opens Employees page)

### 4. Notification Item Component
Location: `src/components/notifications/NotificationItem.tsx`

Displays:
- Icon based on notification type
- Title and truncated message
- Time ago formatting
- Severity indicator (color-coded)
- Unread indicator

### 5. Notification Types

| Type | Trigger Event | Severity |
|------|---------------|----------|
| loan_request | New loan application | warning |
| backup_completed | Backup finished | info |
| backup_failed | Backup error | critical |
| settings_changed | Settings modified | info |
| stock_out | Item out of stock | critical |
| stock_low | Item below min stock | warning |
| stock_expiring | Item expiring soon | warning |
| stock_expired | Item expired | critical |
| inventory_request | New stock request | info |
| order_anomaly | Excessive order modifications | critical |

## Integration Points

### 1. Loan Management
Modify `useEmployeeLoans.ts` - already inserts to employee_loans, trigger handles notification

### 2. Backup System
Modify `generate-backup` edge function - already inserts to backup_history, trigger handles notification

### 3. Settings Context
Modify `SettingsContext.tsx` - add notification creation after successful save

### 4. Inventory Hook
Modify `useInventory.ts` - inventory_items status updates handled by trigger

### 5. Order Context
Add tracking for order modifications - create audit log entries that trigger anomaly detection

## Security

### RLS Policies for notifications table:
- SELECT: Users can see notifications where they are a recipient AND have Manager/SuperManager role
- INSERT: Only system/triggers can insert (using service role functions)
- UPDATE: Users can mark their own notifications as read
- DELETE: Only SuperManagers can delete old notifications

### RLS Policies for notification_recipients:
- SELECT: Users can see their own recipient records
- UPDATE: Users can mark their own as read

## File Changes Summary

### New Files:
1. `src/hooks/useNotifications.ts` - Notification fetching and real-time subscription
2. `src/components/notifications/NotificationPanel.tsx` - Main notification UI panel
3. `src/components/notifications/NotificationItem.tsx` - Individual notification display
4. `src/components/notifications/index.ts` - Exports

### Modified Files:
1. `src/components/Header.tsx` - Integrate notification panel and dynamic badge
2. `src/contexts/SettingsContext.tsx` - Trigger notification on settings save
3. `src/contexts/OrderContext.tsx` - Add order modification tracking

### Database Migrations:
1. Create notifications table
2. Create notification_recipients table  
3. Create database function for getting manager/supermanager users
4. Create trigger functions for each notification type
5. Create triggers on relevant tables
6. Create RLS policies
7. Create order modification tracking table and anomaly detection function

## Technical Details

### Real-time Subscription Pattern
```typescript
// Subscribe to new notifications for current user
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notification_recipients',
    filter: `user_id=eq.${userId}`
  }, handleNewNotification)
  .subscribe()
```

### Notification Creation Helper (Database Function)
```sql
CREATE FUNCTION create_notification(
  _business_id uuid,
  _branch_id text,
  _type text,
  _title text,
  _message text,
  _severity text,
  _metadata jsonb
) RETURNS uuid
```

This function will:
1. Insert into notifications table
2. Find all Managers/SuperManagers for that business
3. Create notification_recipients entries for each

### Expiry Date Check
A scheduled job (pg_cron) can check daily for items expiring within 7 days and create notifications.

## Implementation Order

1. **Phase 1: Database Setup**
   - Create notifications and notification_recipients tables
   - Create helper functions
   - Set up RLS policies

2. **Phase 2: Core Frontend**
   - Create useNotifications hook
   - Create NotificationPanel and NotificationItem components
   - Update Header component

3. **Phase 3: Event Triggers**
   - Loan request trigger
   - Backup status trigger
   - Stock alert triggers
   - Settings change integration

4. **Phase 4: Order Anomaly Detection**
   - Create order audit tracking
   - Implement anomaly detection function
   - Create notification trigger for anomalies

5. **Phase 5: Scheduled Checks**
   - Set up pg_cron for expiry date checks
   - Daily low stock reports (optional)

