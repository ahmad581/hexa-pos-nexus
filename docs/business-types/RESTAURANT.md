# Restaurant Business Type - BizHub POS

This document explains how BizHub POS operates for restaurant businesses, including all specific features and workflows.

---

## Overview

The restaurant module is designed for food service establishments including restaurants, cafes, bistros, and fast-food outlets. It provides comprehensive tools for managing orders, menus, tables, and kitchen operations.

### Terminology
| Standard Term | Restaurant Term |
|--------------|-----------------|
| Branch | Restaurant / Location |
| Unit | Table |
| Customer | Guest / Diner |
| Service | Dish / Menu Item |

---

## 1. Order Management

### Overview
Complete order lifecycle management from creation to completion.

### Features

#### Order Creation
- **Table Orders**: Create orders linked to specific tables
- **Takeaway Orders**: Process pickup and delivery orders
- **Dine-in Orders**: Traditional sit-down service orders
- **Split Bills**: Divide orders among multiple guests

#### Order Processing
- **Real-time Updates**: Live order status tracking
- **Kitchen Display**: Orders automatically sent to kitchen
- **Modification Support**: Edit orders before completion
- **Special Instructions**: Add notes for dietary requirements or preferences

#### Order Status Flow
1. **Pending** - Order received, awaiting confirmation
2. **Confirmed** - Order accepted and sent to kitchen
3. **Preparing** - Kitchen is preparing the order
4. **Ready** - Order ready for service
5. **Served** - Order delivered to guest
6. **Completed** - Payment received, order closed
7. **Cancelled** - Order cancelled (with reason tracking)

#### Order Items
- **Menu Integration**: Select items from digital menu
- **Quantity Management**: Adjust item quantities
- **Price Calculation**: Automatic total with taxes
- **Discounts**: Apply percentage or fixed discounts

### Analytics
- Daily/weekly/monthly order volumes
- Average order value
- Peak ordering times
- Popular items analysis
- Order completion rates

---

## 2. Menu Management

### Overview
Digital menu creation and management with real-time availability updates.

### Features

#### Menu Items
- **Item Details**: Name, description, price, preparation time
- **Categories**: Organize items (Appetizers, Main Course, Desserts, Beverages)
- **Images**: Visual menu with item photos
- **Availability Toggle**: Mark items as available/unavailable

#### Item Configuration
- **Ingredients List**: Track what goes into each dish
- **Allergen Information**: Mark allergens (nuts, dairy, gluten, etc.)
- **Printer Assignment**: Route items to specific kitchen printers
- **Preparation Time**: Estimated cooking/prep time in minutes

#### Menu Categories
- Create unlimited categories
- Drag-and-drop ordering
- Category-based filtering
- Active/inactive category status

#### Pricing
- Base prices per item
- Size variations (if applicable)
- Modifier pricing (add-ons)
- Tax-inclusive/exclusive options

### Menu Design Options
- **Classic View**: Traditional list-based menu
- **Modern View**: Card-based visual menu
- **Simple View**: Minimalist text-only menu

### Analytics
- Best-selling items
- Revenue by category
- Menu item profitability
- Seasonal trends

---

## 3. Table Management

### Overview
Visual floor plan and table status management for dine-in service.

### Features

#### Table Configuration
- **Table Setup**: Define table numbers, capacity, and location
- **Floor Plans**: Visual restaurant layout (future enhancement)
- **Table Status**: Track occupied, available, reserved, cleaning status

#### Table Status Types
| Status | Description | Color Code |
|--------|-------------|------------|
| Available | Ready for guests | Green |
| Occupied | Currently in use | Red |
| Reserved | Booked for future | Blue |
| Cleaning | Being prepared | Yellow |

#### Reservations
- **Booking Management**: Accept table reservations
- **Time Slots**: Define reservation duration
- **Guest Information**: Store contact details for bookings
- **Waitlist**: Manage walk-in guests during busy periods

#### Table Operations
- **Assign Server**: Link tables to specific staff members
- **Merge Tables**: Combine tables for larger parties
- **Transfer Table**: Move guests between tables
- **Quick Status**: One-click status updates

### Analytics
- Table turnover rates
- Average dining duration
- Peak occupancy times
- Reservation no-show rates

---

## 4. Inventory Management (Restaurant-Specific)

### Specialized Features
- **Ingredient Tracking**: Monitor raw ingredients vs finished goods
- **Recipe Costing**: Calculate dish costs based on ingredients
- **Waste Tracking**: Log food waste for analysis
- **Perishable Alerts**: Expiry date monitoring for food items

### Common Inventory Items
- Raw ingredients (meats, vegetables, dairy)
- Beverages (alcoholic and non-alcoholic)
- Packaging materials
- Cleaning supplies
- Kitchen consumables

---

## 5. Kitchen Operations

### Kitchen Display System (KDS) Integration
- Orders appear on kitchen screens automatically
- Priority flagging for rush orders
- Timer tracking for preparation
- Completion marking by kitchen staff

### Printer Routing
- **Kitchen Printers**: Food items to kitchen
- **Bar Printers**: Beverage orders to bar
- **Receipt Printers**: Bills to cashier station
- **Multiple Printer Support**: Different printers per category

---

## 6. Employee Roles (Restaurant-Specific)

| Role | Responsibilities |
|------|-----------------|
| Restaurant Manager | Full restaurant operations |
| Shift Supervisor | Daily operations oversight |
| Head Chef | Kitchen management |
| Server/Waiter | Guest service, order taking |
| Cashier | Payment processing |
| Host/Hostess | Reservations, seating |
| Kitchen Staff | Food preparation |
| Busser | Table clearing, cleaning |

---

## 7. Workflow Example

### Typical Dine-in Order Flow

1. **Guest Arrival**
   - Host checks table availability
   - Assigns table, updates status to "Occupied"

2. **Order Taking**
   - Server creates new order linked to table
   - Adds menu items with any modifications
   - Submits order to kitchen

3. **Kitchen Processing**
   - Order appears on kitchen display
   - Chef prepares dishes
   - Marks items as ready

4. **Service**
   - Server receives "ready" notification
   - Delivers food to table
   - Updates order status to "Served"

5. **Payment**
   - Guest requests bill
   - Server generates receipt
   - Processes payment (cash/card)
   - Order marked "Completed"

6. **Turnover**
   - Table status updated to "Cleaning"
   - Busser clears table
   - Status updated to "Available"

---

## 8. Integration Points

### Shared Features Used
- ✅ Employee Management (staff scheduling, time tracking)
- ✅ Inventory Management (ingredient tracking)
- ✅ Call Center (phone orders, reservations)
- ✅ Analytics & Reporting
- ✅ Branch Management (multi-location restaurants)

### Third-Party Integrations (Future)
- Delivery platforms (Uber Eats, DoorDash)
- Reservation systems (OpenTable)
- Payment processors
- Accounting software

---

## 9. Best Practices

### Menu Management
- Update availability in real-time
- Use high-quality images
- Keep descriptions concise but appetizing
- Regularly review pricing vs costs

### Order Management
- Train staff on proper order modification
- Use special instructions for dietary needs
- Monitor kitchen preparation times
- Review cancelled orders for patterns

### Table Management
- Regular status updates prevent double-booking
- Use reservations for busy periods
- Track average dining times by meal type
- Maintain accurate floor plan
