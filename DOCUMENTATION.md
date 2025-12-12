# BizHub POS System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Authentication & Login](#authentication--login)
3. [User Roles & Permissions](#user-roles--permissions)
4. [System Master Dashboard](#system-master-dashboard)
5. [Client Management](#client-management)
6. [Business Types](#business-types)
7. [Features System](#features-system)
8. [Branch Management](#branch-management)
9. [Database Schema](#database-schema)
10. [Security](#security)

---

## System Overview

BizHub POS is a multi-tenant business management platform that supports various business types including restaurants, retail stores, salons, pharmacies, gyms, hotels, and more. The system is built with:

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL database, Authentication, Edge Functions)
- **State Management**: TanStack Query, React Context

### Key Features

- Multi-business support with isolated data
- Role-based access control (RBAC)
- Branch management for multi-location businesses
- Customizable feature sets per business
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

| Priority | Role | Description |
|----------|------|-------------|
| 0 | SystemMaster | Full system access, manages all clients |
| 1 | SuperManager | Full access to their business |
| 2 | Manager | Branch-level management |
| 3 | HrManager | Employee management, HR functions |
| 4 | HallManager | Floor/hall operations management |
| 5 | CallCenterEmp | Call center operations |
| 6 | Cashier | Point of sale operations |
| 7 | Employee | Basic employee access |

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

The system supports multiple business types, each with tailored features:

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

### Multi-Branch Features

- Each branch can have its own manager
- Employees can be assigned to specific branches
- Reports can be filtered by branch
- Inventory can be tracked per branch

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

### Authentication Security

1. **Password Requirements**: Handled by Supabase Auth
2. **Session Management**: JWT tokens with auto-refresh
3. **Email Verification**: Can be enabled in Supabase settings

### Best Practices

1. **Never store roles in localStorage** - Always fetch from database
2. **Use server-side role validation** - Don't trust client-side checks
3. **Implement proper RLS policies** - Data access is controlled at database level
4. **Use SECURITY DEFINER functions** - Prevents RLS recursion issues

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

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial release |

---

*Last updated: December 2024*
