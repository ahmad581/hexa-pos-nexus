# BizHub POS System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Authentication & Login](#authentication--login)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Roles Management System](#roles-management-system)
5. [System Master Dashboard](#system-master-dashboard)
6. [Client Management](#client-management)
7. [Business Types](#business-types)
8. [Features System](#features-system)
9. [Branch Management](#branch-management)
10. [Employee Management](#employee-management)
11. [Employee Loans System](#employee-loans-system)
12. [Call Center System](#call-center-system)
13. [Data Backup & Recovery](#data-backup--recovery)
14. [Database Schema](#database-schema)
15. [Security](#security)

---

## System Overview

BizHub POS is a multi-tenant business management platform that supports various business types including restaurants, retail stores, salons, pharmacies, gyms, hotels, and more. The system is built with:

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL database, Authentication, Edge Functions)
- **State Management**: TanStack Query, React Context

### Key Features

- Multi-business support with isolated data
- Role-based access control (RBAC) with granular permissions
- Branch management for multi-location businesses
- Customizable feature sets per business
- Employee loan management with configurable settings
- Real-time data synchronization

---

## Authentication & Login

### Login Methods

#### 1. Standard Login
Users can log in using email and password credentials.

**URL**: `/login`

```
Email: user@example.com
Password: ********
```

#### 2. System Master Login
System administrators access a separate login dialog for elevated privileges.

**Access**: Click "SystemMaster Login" button on the login page.

**Requirements**:
- Valid Supabase authentication credentials
- `primary_role` must be set to `SystemMaster` in the `profiles` table

#### 3. Demo Accounts
For testing purposes, the following demo accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Super Manager | manager@demo.com | demo123 |
| Manager | branch.manager@demo.com | demo123 |
| Cashier | cashier@demo.com | demo123 |
| Hall Manager | hall@demo.com | demo123 |
| HR Manager | hr@demo.com | demo123 |
| Call Center | callcenter@demo.com | demo123 |
| Employee | employee@demo.com | demo123 |

### Authentication Flow

```
1. User enters credentials
2. Supabase validates credentials
3. On success:
   - Session is established
   - User profile is fetched from `profiles` table
   - User roles are fetched from `user_roles` table
   - User is redirected based on role:
     - SystemMaster → /system-master
     - Others → /dashboard
4. On failure:
   - Error message displayed
   - User remains on login page
```

### Session Management

- Sessions are managed by Supabase Auth
- Auto-refresh of tokens is enabled
- Session persists across browser refreshes (localStorage)

---

## User Roles & Permissions

### Role Hierarchy

| Priority | Role | Description | Hierarchy Level |
|----------|------|-------------|-----------------|
| 0 | SystemMaster | Full system access, manages all clients | 0 |
| 1 | SuperManager | Full access to their business | 1 |
| 2 | Manager | Branch-level management | 2 |
| 3 | HrManager | Employee management, HR functions | 3 |
| 4 | HallManager | Floor/hall operations management | 4 |
| 5 | CallCenterEmp | Call center operations | 5 |
| 6 | Cashier | Point of sale operations | 6 |
| 7 | Employee | Basic employee access | 7 |

### Role Permissions Matrix

| Permission | SystemMaster | SuperManager | Manager | HrManager | HallManager | Cashier | Employee |
|------------|:------------:|:------------:|:-------:|:---------:|:-----------:|:-------:|:--------:|
| Access System Dashboard | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Clients | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage All Businesses | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View System Analytics | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Business | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Branches | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Employees | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Loans | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configure Loan Settings | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Approve/Reject Loans | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Analytics | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Orders | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Process Payments | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| View Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Role Assignment

Roles are stored in the `user_roles` table with the following structure:

```sql
user_roles (
  id: UUID (Primary Key)
  user_id: UUID (References auth.users)
  role: app_role (Enum)
  branch_id: TEXT (Optional, for branch-specific roles)
  is_active: BOOLEAN
  assigned_by: UUID
  assigned_at: TIMESTAMP
)
```

**Note**: A user can have multiple roles, but the `primary_role` in the `profiles` table is determined by the highest-priority active role.

---

## Roles Management System

### Roles Table

The system now includes a dedicated `roles` table for flexible role configuration:

```sql
roles (
  id: UUID (Primary Key)
  name: TEXT (Unique role identifier, e.g., 'Manager')
  display_name: TEXT (Human-readable name)
  description: TEXT
  icon: TEXT (Icon identifier)
  hierarchy_level: INTEGER (Lower = higher priority)
  color_class: TEXT (Tailwind color class for badges)
  is_system_role: BOOLEAN (Cannot be deleted if true)
  is_active: BOOLEAN
)
```

### Role Permissions Table

Granular permissions are managed via the `role_permissions` table:

```sql
role_permissions (
  id: UUID (Primary Key)
  role_id: UUID (References roles)
  permission_key: TEXT (e.g., 'manage_employees', 'view_analytics')
  is_granted: BOOLEAN
)
```

### Business Type Roles

Different business types can have different available roles:

```sql
business_type_roles (
  id: UUID (Primary Key)
  business_type_id: TEXT (References business_types)
  role_id: UUID (References roles)
  is_default: BOOLEAN
)
```

### Available Permission Keys

| Permission Key | Description |
|---------------|-------------|
| `access_system_dashboard` | Access the System Master dashboard |
| `manage_users` | Create/edit/delete users |
| `assign_roles` | Assign roles to users |
| `manage_business` | Configure business settings |
| `manage_branches` | Create/edit branches |
| `manage_employees` | Manage employee records |
| `manage_loans` | Handle employee loans |
| `configure_loan_settings` | Configure loan parameters |
| `approve_loans` | Approve/reject loan applications |
| `view_analytics` | View reports and analytics |
| `manage_orders` | Handle orders |
| `process_payments` | Process transactions |
| `manage_inventory` | Manage stock levels |
| `manage_menu` | Edit menu items |

### Role Hooks

The system provides React hooks for role management:

```typescript
// Fetch all active roles
const { data: roles } = useRoles();

// Fetch roles for a specific business type
const { data: businessTypeRoles } = useBusinessTypeRoles(businessTypeId);

// Get role permissions
const { data: permissions } = useRolePermissions(roleId);

// Check user permissions
const { hasPermission, permissions } = useHasPermission();

// Comprehensive role checking
const { 
  checkRole, 
  isSystemMaster, 
  canManageEmployees,
  canManageLoans 
} = useRole();
```

---

## System Master Dashboard

### Access Requirements

- Must be authenticated as a SystemMaster
- Email must match `am@gmail.com` OR have `primary_role = 'SystemMaster'`

### Dashboard Tabs

#### 1. Client Management

View and manage all clients (businesses) in the system.

**Features**:
- View all clients with status indicators
- Filter by status, business type, or search
- Add new clients
- View client details
- Enable/disable client features
- Access client's business management

**Client Card Information**:
- Business name and type
- Owner name and email
- Number of branches
- Number of enabled features
- Active/Inactive status

#### 2. System Analytics

Aggregated statistics across all businesses.

**Metrics Displayed**:
- Total Businesses
- Active Businesses
- Total Branches
- Total Employees
- Orders This Month
- Revenue This Month

#### 3. Role Management

Manage user roles across the entire system.

**Features**:
- View all users with their roles
- Assign new roles to users
- Select business and branch for role assignment
- Filter users by role or search
- View all system roles with hierarchy levels
- Manage role permissions
- Configure business type roles

---

## Client Management

### Creating a New Client

1. Navigate to System Master Dashboard
2. Click "Add Client" button
3. Fill in the required information:
   - **Business Name**: Name of the business
   - **Owner Name**: Full name of the business owner
   - **Owner Email**: Email for the owner's account
   - **Password**: Initial password for the account
   - **Business Type**: Select from available types
4. Select features to enable for the business
5. Click "Create Client"

### What Happens When Creating a Client

```
1. New user created in Supabase Auth
2. Business record created in `custom_businesses`
3. Profile record created in `profiles` with SuperManager role
4. Role record created in `user_roles`
5. Selected features enabled in `business_features`
```

### Client Features Management

For each client, you can:
- **View Features**: See all available features with enabled/disabled status
- **Toggle Features**: Enable or disable individual features
- **Bulk Operations**: Enable/disable multiple features at once

---

## Business Types

The system supports multiple business types, each with tailored features and roles:

### Supported Business Types

| Type ID | Name | Category | Icon |
|---------|------|----------|------|
| restaurant | Restaurant | Food & Beverage | UtensilsCrossed |
| cafe | Café | Food & Beverage | Coffee |
| bakery | Bakery | Food & Beverage | Croissant |
| salon | Salon | Services | Scissors |
| spa | Spa | Services | Sparkles |
| hotel | Hotel | Hospitality | Building |
| retail | Retail Store | Retail | Store |
| grocery | Grocery Store | Retail | ShoppingBasket |
| pharmacy | Pharmacy | Healthcare | Pill |
| gym | Gym/Fitness | Health & Fitness | Dumbbell |
| pet-care | Pet Care | Services | PawPrint |
| auto-repair | Auto Repair | Services | Wrench |

### Business Types Table

```sql
business_types (
  id: TEXT (Primary Key)
  name: TEXT
  icon: TEXT
  category: TEXT
  terminology: JSONB (Custom terminology for the business type)
  is_active: BOOLEAN
)
```

### Business Type Features

Each business type has relevant features automatically filtered:

**Restaurant Features**:
- Menu Management
- Table Management
- Order Management
- Kitchen Display
- Reservations

**Retail Features**:
- Product Management
- Inventory
- POS
- Barcode Scanning

**Salon Features**:
- Appointments
- Stylist Management
- Services
- Client Management

---

## Features System

### Available Features Table

Features are stored in the `available_features` table:

```sql
available_features (
  id: TEXT (Primary Key, e.g., 'menu-management')
  name: TEXT (Display name)
  description: TEXT
  category: TEXT (e.g., 'Operations', 'Management')
  icon: TEXT (Icon name)
)
```

### Business Features Assignment

Features are assigned to businesses via the `business_features` table:

```sql
business_features (
  id: UUID (Primary Key)
  business_id: UUID (References custom_businesses)
  feature_id: TEXT (References available_features)
  is_enabled: BOOLEAN
)
```

### Business Type Features

Default features per business type are managed via:

```sql
business_type_features (
  id: UUID (Primary Key)
  business_type_id: TEXT (References business_types)
  feature_id: TEXT (References available_features)
  is_default: BOOLEAN
)
```

### Feature Categories

| Category | Description |
|----------|-------------|
| Operations | Core business operations (POS, Orders, Tables) |
| Management | Business management (Inventory, Employees) |
| Analytics | Reporting and insights |
| Communication | Customer communication tools |
| Scheduling | Appointments and reservations |
| Finance | Payment and accounting |

---

## Branch Management

### Creating a Branch

Branches are locations or outlets of a business.

```sql
branches (
  id: TEXT (Primary Key)
  business_id: UUID (References custom_businesses)
  name: TEXT
  address: TEXT
  phone: TEXT
  manager_name: TEXT
  business_type: TEXT
  is_active: BOOLEAN
)
```

### Branch-Specific Data

The following data is scoped to branches:
- Employees
- Orders
- Menu Items
- Tables
- Inventory
- Appointments (for service businesses)
- Loan Settings
- Employee Loans

### Multi-Branch Features

- Each branch can have its own manager
- Employees can be assigned to specific branches
- Reports can be filtered by branch
- Inventory can be tracked per branch
- Loan settings can be configured per branch

---

## Employee Management

### Employee Information

Employees are stored in the `employees` table with the following key fields:

```sql
employees (
  id: UUID (Primary Key)
  branch_id: TEXT
  employee_number: TEXT
  first_name: TEXT
  last_name: TEXT
  email: TEXT
  phone: TEXT
  position: TEXT
  department: TEXT
  hire_date: DATE
  salary: DECIMAL
  hourly_rate: DECIMAL
  address: TEXT
  emergency_contact_name: TEXT
  emergency_contact_phone: TEXT
  is_active: BOOLEAN
)
```

### Employee Documents

The system supports PDF document uploads for employee records (personal documents, legal documents, contracts, certifications, etc.).

**Storage**: Documents are stored in the `employee-documents` Supabase storage bucket.

```sql
employee_documents (
  id: UUID (Primary Key)
  employee_id: UUID (References employees)
  branch_id: TEXT
  document_name: TEXT
  document_type: TEXT (e.g., 'personal', 'legal', 'contract', 'certification')
  description: TEXT
  file_url: TEXT
  file_size: INTEGER
  mime_type: TEXT
  uploaded_by: UUID
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

**Supported Operations**:
- Upload PDF documents (max 10MB)
- View documents with signed URLs
- Download documents
- Delete documents

**Document Types**:
| Type | Description |
|------|-------------|
| personal | Personal identification documents |
| legal | Legal documents and agreements |
| contract | Employment contracts |
| certification | Professional certifications and licenses |
| other | Other documents |

### Salary Calculator

The salary calculator allows managers to calculate employee salaries for any chosen date range.

**Features**:
- Select employee from dropdown
- Choose date range (start and end date)
- Automatic calculation based on work sessions
- Displays regular hours and overtime hours (1.5x rate)
- Shows detailed breakdown of earnings

**Calculation Logic**:
```
Regular Hours: Hours worked up to 8 hours per session
Overtime Hours: Hours worked beyond 8 hours per session
Overtime Rate: 1.5x the regular hourly rate

Total Salary = (Regular Hours × Hourly Rate) + (Overtime Hours × Hourly Rate × 1.5)
```

**Work Sessions Table**:
```sql
employee_work_sessions (
  id: UUID (Primary Key)
  employee_id: UUID (References employees)
  branch_id: TEXT
  check_in_time: TIMESTAMP
  check_out_time: TIMESTAMP
  break_duration: INTEGER (minutes)
  session_type: TEXT
  location: TEXT
  notes: TEXT
)
```

**Daily Summaries Table**:
```sql
employee_daily_summaries (
  id: UUID (Primary Key)
  employee_id: UUID (References employees)
  branch_id: TEXT
  work_date: DATE
  total_hours: DECIMAL
  regular_hours: DECIMAL
  overtime_hours: DECIMAL
  break_hours: DECIMAL
  total_earnings: DECIMAL
  session_count: INTEGER
  first_check_in: TIMESTAMP
  last_check_out: TIMESTAMP
)
```

---

## Employee Loans System

### Overview

The Employee Loans System allows employees to apply for loans with configurable settings per branch. Managers can approve or reject loan applications, and the system automatically calculates monthly payments and total repayment amounts.

### Loan Settings

Each branch can configure its own loan settings:

```sql
loan_settings (
  id: UUID (Primary Key)
  branch_id: TEXT (Unique)
  min_loan_amount: DECIMAL (Default: 1000)
  max_loan_amount: DECIMAL (Default: 50000)
  min_payment_period_months: INTEGER (Default: 1)
  max_payment_period_months: INTEGER (Default: 24)
  interest_rate_percentage: DECIMAL (Default: 0)
  max_monthly_payment_percentage: DECIMAL (Default: 30, % of salary)
  require_approval: BOOLEAN (Default: true)
  min_employment_months: INTEGER (Default: 3)
  max_active_loans: INTEGER (Default: 1)
  is_active: BOOLEAN (Default: true)
  notes: TEXT
)
```

**Configurable Parameters**:
| Setting | Description | Default |
|---------|-------------|---------|
| Min Loan Amount | Minimum amount an employee can borrow | 1,000 |
| Max Loan Amount | Maximum amount an employee can borrow | 50,000 |
| Min Payment Period | Minimum repayment duration in months | 1 |
| Max Payment Period | Maximum repayment duration in months | 24 |
| Interest Rate | Annual interest rate percentage | 0% |
| Max Monthly Payment | Maximum % of salary for monthly payment | 30% |
| Require Approval | Whether loans need manager approval | Yes |
| Min Employment | Minimum months employed to be eligible | 3 |
| Max Active Loans | Maximum concurrent active loans | 1 |

### Employee Loans

```sql
employee_loans (
  id: UUID (Primary Key)
  employee_id: UUID (References employees)
  branch_id: TEXT
  loan_amount: DECIMAL
  payment_period_months: INTEGER
  interest_rate: DECIMAL
  monthly_payment: DECIMAL
  total_repayment: DECIMAL
  paid_amount: DECIMAL (Default: 0)
  remaining_amount: DECIMAL (Computed)
  status: TEXT (Default: 'pending')
  reason: TEXT (Why the employee needs the loan)
  approved_by: TEXT
  approved_at: TIMESTAMP
  rejected_reason: TEXT
  start_date: DATE
  end_date: DATE
  next_payment_date: DATE
)
```

**Loan Statuses**:
| Status | Description |
|--------|-------------|
| pending | Awaiting approval |
| approved | Approved, repayment in progress |
| rejected | Application was rejected |
| completed | Fully repaid |
| cancelled | Cancelled before completion |

### Loan Payments

```sql
loan_payments (
  id: UUID (Primary Key)
  loan_id: UUID (References employee_loans)
  employee_id: UUID (References employees)
  branch_id: TEXT
  payment_amount: DECIMAL
  payment_date: DATE
  payment_method: TEXT (Default: 'salary_deduction')
  notes: TEXT
)
```

### Loan Application Flow

1. **Employee Applies**:
   - Selects loan amount within allowed range
   - Chooses payment period in months
   - Sees calculated monthly payment and total repayment
   - Provides reason for the loan
   - Confirms and submits application

2. **Calculation Preview**:
   ```
   Monthly Payment = (Loan Amount × (1 + Interest Rate)) / Payment Period
   Total Repayment = Monthly Payment × Payment Period
   ```

3. **Manager Reviews**:
   - Views pending loan applications
   - Sees employee details and salary
   - Checks loan amount vs. monthly payment affordability
   - Approves or rejects with optional reason

4. **After Approval**:
   - Start date is set
   - End date is calculated (start + payment period)
   - Next payment date is set (start + 1 month)
   - Status changes to 'approved'

5. **Repayment**:
   - Payments can be recorded manually or deducted from salary
   - Remaining amount is updated
   - Status changes to 'completed' when fully paid

### Loan Hooks

```typescript
// Get loan settings for a branch
const { data: settings, isLoading } = useLoanSettings(branchId);

// Get loans for a branch (with optional employee filter)
const { data: loans } = useEmployeeLoans(branchId, employeeId);

// Mutations
const { updateLoanSettings } = useUpdateLoanSettings();
const { applyForLoan } = useApplyForLoan();
const { approveLoan } = useApproveLoan();
const { rejectLoan } = useRejectLoan();
```

### UI Components

- **LoanSettingsDialog**: Configure loan parameters for a branch
- **LoanApplicationDialog**: Employee loan application form with real-time calculations
- **LoanManagement**: Dashboard for viewing and managing loans (pending, active, history)

---

## Call Center System

### Overview

The Call Center system provides a centralized phone management solution integrated with Twilio. It supports business-level phone numbers, individual employee extensions, real-time call notifications, and comprehensive call history management.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INCOMING CALL                            │
│                         │                                   │
│                         ▼                                   │
│              ┌──────────────────┐                          │
│              │  Twilio Number   │                          │
│              │ (Business Line)  │                          │
│              └────────┬─────────┘                          │
│                       │                                     │
│                       ▼                                     │
│         ┌─────────────────────────┐                        │
│         │   twilio-webhook Edge   │                        │
│         │       Function          │                        │
│         └───────────┬─────────────┘                        │
│                     │                                       │
│          ┌──────────┼──────────┐                           │
│          ▼          ▼          ▼                           │
│     ┌─────────┐ ┌────────┐ ┌────────┐                     │
│     │ call_   │ │ call_  │ │ Realtime│                    │
│     │ queue   │ │history │ │ Events │                     │
│     └─────────┘ └────────┘ └────────┘                     │
│                                │                           │
│                                ▼                           │
│                    ┌──────────────────┐                   │
│                    │  Agent UI/Toast  │                   │
│                    │   Notification   │                   │
│                    └──────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### Database Tables

#### call_center_numbers
Stores business-level phone numbers assigned by SystemMaster.

```sql
call_center_numbers (
  id: UUID (Primary Key)
  business_id: UUID (References custom_businesses)
  phone_number: TEXT (The Twilio phone number)
  twilio_sid: TEXT (Twilio SID for the number)
  is_active: BOOLEAN (Default: true)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

#### employee_extensions
Stores individual employee extensions for internal calling and call routing.

```sql
employee_extensions (
  id: UUID (Primary Key)
  profile_id: UUID (References profiles)
  business_id: UUID (References custom_businesses)
  extension_number: TEXT (e.g., '101', '102')
  twilio_sid: TEXT (Optional)
  is_available: BOOLEAN (Agent availability status)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

#### call_queue
Manages the lifecycle of incoming calls in real-time.

```sql
call_queue (
  id: UUID (Primary Key)
  business_id: UUID (References custom_businesses)
  call_center_number_id: UUID (References call_center_numbers)
  caller_phone: TEXT
  caller_name: TEXT
  caller_address: TEXT
  twilio_call_sid: TEXT
  status: TEXT (See statuses below)
  priority: TEXT ('low', 'medium', 'high', 'urgent')
  call_type: TEXT ('sales', 'support', 'appointment', 'complaint', 'general', 'internal')
  answered_by: UUID (References profiles)
  answered_at: TIMESTAMP
  transferred_to: UUID (References profiles)
  transferred_at: TIMESTAMP
  completed_at: TIMESTAMP
  queue_position: INTEGER
  wait_time_seconds: INTEGER
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

**Call Statuses**:
| Status | Description |
|--------|-------------|
| ringing | Call is incoming, not yet answered |
| queued | Call is in queue waiting for an agent |
| answered | Call is currently being handled by an agent |
| on_hold | Call is on hold |
| transferred | Call has been transferred to another agent |
| completed | Call has ended successfully |
| missed | Call was not answered |
| abandoned | Caller hung up before being answered |

#### call_history
Comprehensive logging of all call data.

```sql
call_history (
  id: UUID (Primary Key)
  business_id: UUID (References custom_businesses)
  call_queue_id: UUID (References call_queue)
  caller_phone: TEXT
  caller_name: TEXT
  callee_phone: TEXT
  call_type: TEXT
  direction: TEXT ('inbound', 'outbound', 'internal')
  status: TEXT
  duration_seconds: INTEGER
  recording_url: TEXT
  recording_duration_seconds: INTEGER
  handled_by: UUID (References profiles)
  notes: TEXT
  outcome: TEXT
  created_at: TIMESTAMP
)
```

### Twilio Edge Function

The `twilio-webhook` edge function handles all Twilio interactions:

**Endpoints**:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/incoming` | POST | Handles incoming call webhooks from Twilio |
| `/wait` | POST | Provides wait music/message while in queue |
| `/status` | POST | Handles call status updates (ringing, answered, completed) |
| `/recording` | POST | Handles recording callbacks |
| `/answer` | POST | Agent answers a call |
| `/hold` | POST | Agent puts call on hold |
| `/transfer` | POST | Agent transfers call to another agent |
| `/end` | POST | Agent ends a call |

**Configuration** (supabase/config.toml):
```toml
[functions.twilio-webhook]
verify_jwt = false
```

**Required Secrets**:
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_API_KEY`: Twilio API key
- `TWILIO_API_SECRET`: Twilio API secret

### Real-time Notifications

The system uses Supabase Realtime to push call updates to all agents:

```sql
-- Enable realtime for call_queue
ALTER PUBLICATION supabase_realtime ADD TABLE call_queue;
```

**Features**:
- Instant notification when new calls arrive
- Live status updates as calls progress
- Toast notifications with audio alerts
- Real-time connection status indicator

### React Hook: useCallCenter

```typescript
const {
  // Data
  callQueue,           // Active calls in queue
  callHistory,         // Recent call history
  employeeExtensions,  // Available agents with extensions
  callCenterNumber,    // Business phone number
  stats,               // Call statistics
  
  // Loading states
  isLoading,
  realtimeEnabled,     // Real-time connection status
  
  // Actions
  answerCall,          // Answer a ringing call
  holdCall,            // Put call on hold
  transferCall,        // Transfer to another agent
  endCall,             // End current call
  updateAvailability,  // Toggle agent availability
  
  // Mutation states
  isAnswering,
  isHolding,
  isTransferring,
  isEnding,
} = useCallCenter();
```

### UI Components

#### CallCenterStats
Dashboard overview of call metrics:
- Active calls
- Ringing/queued calls
- Calls on hold
- Total calls today
- Real-time connection indicator

#### CallQueueCard
Displays individual calls with actions:
- Caller information
- Call duration timer
- Answer/Hold/Transfer/End buttons
- Priority and status badges

#### CallHistoryTable
Shows recent call logs:
- Call details and duration
- Recording playback
- Download recordings
- Search and filter

#### TransferDialog
Modal for transferring calls:
- List of available agents
- Extension numbers
- Availability status

### Setup Guide

1. **Twilio Configuration**:
   - Purchase a Twilio phone number
   - Configure webhook URLs in Twilio Console:
     - Voice URL: `https://<project>.supabase.co/functions/v1/twilio-webhook/incoming`
     - Status Callback: `https://<project>.supabase.co/functions/v1/twilio-webhook/status`

2. **SystemMaster assigns number to business**:
   - Add phone number to `call_center_numbers` table
   - Link to appropriate business

3. **Configure employee extensions**:
   - Create entries in `employee_extensions` for call center staff
   - Assign unique extension numbers

4. **Agent setup**:
   - Agents access the Call Center page
   - Toggle availability using the switch
   - Start answering calls from the queue

---

## Data Backup & Recovery

### Overview

The Data Backup system provides comprehensive backup and recovery capabilities that are context-aware based on business type. It supports both manual downloads and cloud saves to Supabase Storage.

### Features

- **Business-type aware backups**: Only exports relevant tables for each business type
- **Multiple export formats**: CSV/Excel compatible format
- **Cloud storage**: Save backups to Supabase Storage for later retrieval
- **Backup history**: Track all backups with timestamps and file sizes
- **Secure downloads**: Signed URLs for secure file access

### Database Tables

#### backup_history
Tracks all backups created for a branch.

```sql
backup_history (
  id: UUID (Primary Key)
  branch_id: TEXT
  file_path: TEXT (Path in storage bucket)
  file_size: INTEGER (Size in bytes)
  backup_type: TEXT ('manual', 'automatic')
  status: TEXT ('completed', 'failed', 'in_progress')
  created_by: UUID (References profiles)
  created_at: TIMESTAMP
)
```

### Edge Function: generate-backup

The `generate-backup` edge function handles backup generation:

**Endpoint**: `POST /functions/v1/generate-backup`

**Request Body**:
```json
{
  "branch_id": "branch-uuid",
  "backup_type": "manual",
  "save_to_storage": false
}
```

**Response** (when `save_to_storage` is false):
- Returns CSV file as downloadable blob

**Response** (when `save_to_storage` is true):
```json
{
  "success": true,
  "file_path": "branch-id/backup-2024-12-01.csv",
  "file_size": 12345
}
```

**Configuration** (supabase/config.toml):
```toml
[functions.generate-backup]
verify_jwt = false
```

### Business-Type Aware Exports

The backup system intelligently filters data based on business type:

| Business Type | Excluded Tables |
|---------------|-----------------|
| Restaurant | prescriptions, members, services (auto-repair) |
| Retail | prescriptions, members, appointments |
| Pharmacy | menu_items, tables, rooms |
| Gym | prescriptions, menu_items |
| Salon | prescriptions, members, products |
| Hotel | prescriptions, products |

### React Hook: useBackup

```typescript
const {
  // State
  isLoading,
  backupHistory,
  
  // Actions
  downloadBackup,         // Create and download backup
  fetchBackupHistory,     // Load backup history
  downloadFromStorage,    // Download existing backup from storage
} = useBackup();

// Usage examples
await downloadBackup({ 
  branchId: 'xxx', 
  saveToStorage: false,    // Direct download
  backupType: 'manual' 
});

await downloadBackup({ 
  branchId: 'xxx', 
  saveToStorage: true,     // Save to cloud
  backupType: 'automatic' 
});
```

### Storage Bucket

Backups are stored in the `branch-backups` Supabase Storage bucket:

```
branch-backups/
├── branch-id-1/
│   ├── backup-2024-12-01-manual.csv
│   ├── backup-2024-12-02-automatic.csv
│   └── ...
├── branch-id-2/
│   └── ...
```

### Backup File Format

The backup file is a multi-section CSV with the following structure:

```
=== BACKUP METADATA ===
Generated: 2024-12-01T10:30:00Z
Branch: Main Branch
Business Type: Restaurant

=== EMPLOYEES ===
id,first_name,last_name,email,position,...
...

=== ORDERS ===
id,order_number,total_amount,status,...
...

=== MENU_ITEMS ===
id,name,category,price,...
...
```

### Security

- **RLS Protection**: Backup data respects RLS policies
- **Authentication Required**: All backup operations require valid JWT
- **Business Isolation**: Users can only backup their own business data
- **Signed URLs**: Storage downloads use time-limited signed URLs

---

## Database Schema

### Core Tables

#### profiles
Stores user profile information and links to businesses.

```sql
profiles (
  id: UUID (Primary Key)
  user_id: UUID (References auth.users)
  email: TEXT (Unique)
  first_name: TEXT
  last_name: TEXT
  business_id: UUID (References custom_businesses)
  branch_id: TEXT
  primary_role: app_role
  role_updated_at: TIMESTAMP
  is_active: BOOLEAN
  is_super_admin: BOOLEAN
)
```

#### custom_businesses
Stores business/client information.

```sql
custom_businesses (
  id: UUID (Primary Key)
  user_id: UUID (Owner's user ID)
  name: TEXT
  business_type: TEXT
  category: TEXT
  icon: TEXT
  terminology: JSONB
)
```

#### user_roles
Stores role assignments for users.

```sql
user_roles (
  id: UUID (Primary Key)
  user_id: UUID
  role: app_role (Enum)
  branch_id: TEXT (Optional)
  is_active: BOOLEAN
  assigned_by: UUID
  assigned_at: TIMESTAMP
)
```

### Role Enum

```sql
app_role: ENUM (
  'SystemMaster',
  'SuperManager',
  'Manager',
  'HrManager',
  'HallManager',
  'CallCenterEmp',
  'Cashier',
  'Employee'
)
```

### Database Functions

#### has_role(user_id, role)
Checks if a user has a specific role.

```sql
has_role(_user_id UUID, _role app_role) → BOOLEAN
```

#### has_role_in_branch(user_id, role, branch_id)
Checks if a user has a role in a specific branch.

```sql
has_role_in_branch(_user_id UUID, _role app_role, _branch_id TEXT) → BOOLEAN
```

#### get_user_primary_role(user_id)
Returns the primary (highest priority) role for a user.

```sql
get_user_primary_role(_user_id UUID) → app_role
```

#### is_super_admin(user_id)
Checks if a user is a super admin.

```sql
is_super_admin(user_id UUID) → BOOLEAN
```

#### user_has_permission(user_id, permission_key)
Checks if a user has a specific permission based on their roles.

```sql
user_has_permission(_user_id UUID, _permission_key TEXT) → BOOLEAN
```

#### current_user_has_primary_role(role)
Checks if the current authenticated user has a specific primary role.

```sql
current_user_has_primary_role(_role app_role) → BOOLEAN
```

#### get_role_by_name(role_name)
Gets role details by name.

```sql
get_role_by_name(_role_name TEXT) → TABLE(id, name, display_name, description, icon, hierarchy_level, color_class, is_system_role)
```

#### calculate_session_hours(check_in, check_out, break_minutes)
Calculates hours worked for a session.

```sql
calculate_session_hours(check_in TIMESTAMP, check_out TIMESTAMP, break_minutes INTEGER) → DECIMAL
```

---

## Security

### Row-Level Security (RLS)

All tables have RLS enabled with appropriate policies:

#### Business Data Isolation
- Users can only see/modify data for their own business
- SystemMaster and SuperAdmin can access all data

#### Role-Based Access
- Role checks use `SECURITY DEFINER` functions to prevent RLS recursion
- Policies check user roles before allowing operations

#### Loan Data Security
- Employees can view their own loans
- Managers can view all loans in their branch
- Loan settings are protected and only editable by managers

### Authentication Security

1. **Password Requirements**: Handled by Supabase Auth
2. **Session Management**: JWT tokens with auto-refresh
3. **Email Verification**: Can be enabled in Supabase settings

### Best Practices

1. **Never store roles in localStorage** - Always fetch from database
2. **Use server-side role validation** - Don't trust client-side checks
3. **Implement proper RLS policies** - Data access is controlled at database level
4. **Use SECURITY DEFINER functions** - Prevents RLS recursion issues
5. **Use permission keys** - Granular access control via role_permissions table

---

## API Reference

### Edge Functions

#### create-client
Creates a new client with user account and business.

**Endpoint**: `POST /functions/v1/create-client`

**Request Body**:
```json
{
  "name": "Business Name",
  "email": "owner@example.com",
  "password": "securepassword",
  "business_type": "restaurant",
  "first_name": "Owner",
  "last_name": "Name",
  "features": ["menu-management", "orders"]
}
```

**Response**:
```json
{
  "success": true,
  "user": { "id": "...", "email": "..." },
  "business": { "id": "...", "name": "..." }
}
```

---

## Troubleshooting

### Common Issues

#### "No business selected" error
- Ensure the user has a `business_id` in their profile
- Check that the business exists in `custom_businesses`

#### Cannot see client data
- Verify RLS policies are correctly configured
- Check if user has appropriate role
- Ensure `is_super_admin` is set for admin users

#### Role assignment fails
- Confirm the assigning user has permission (SystemMaster or SuperManager)
- Check that the target user exists in auth.users
- Verify branch_id is valid if specified

#### Login redirects back to login page
- Check if user profile exists in `profiles` table
- Verify `is_active` is true
- Check browser console for auth errors

#### Loan application fails
- Check if loan settings are configured for the branch
- Verify employee meets minimum employment requirement
- Ensure loan amount is within configured limits
- Check if employee has exceeded maximum active loans

#### Cannot approve loans
- Verify user has `approve_loans` permission or Manager/HrManager role
- Check if the loan is in 'pending' status

---

## Glossary

| Term | Definition |
|------|------------|
| Client | A business entity using the BizHub system |
| Branch | A physical location or outlet of a business |
| Feature | A modular capability that can be enabled per business |
| Primary Role | The highest-priority role assigned to a user |
| RLS | Row-Level Security - database-level access control |
| RBAC | Role-Based Access Control |
| Permission Key | A string identifier for a specific permission |
| Loan Settings | Branch-specific configuration for employee loans |
| Hierarchy Level | Numeric priority of a role (lower = more privileges) |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial release |
| 1.1 | December 2024 | Added employee email field, document uploads, and salary calculator |
| 1.2 | December 2024 | Added Roles Management System with roles table, role_permissions, and business_type_roles |
| 1.3 | December 2024 | Added Employee Loans System with loan_settings, employee_loans, and loan_payments tables |
| 1.4 | January 2025 | Added Call Center System with Twilio integration, real-time notifications, call queue management, and recording playback |
| 1.5 | January 2025 | Added Data Backup & Recovery with business-type aware exports and cloud storage |

---

*Last updated: January 2025*
