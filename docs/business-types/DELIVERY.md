# Delivery Feature - BizHub POS

This document outlines the Delivery Management feature, a shared module that can be enabled across multiple business types in BizHub POS.

---

## Overview

The Delivery feature allows businesses to register delivery drivers with their vehicles and personal information, assign delivery orders, and track deliveries from dispatch to completion. It is designed as a **shared feature** that can be toggled on/off per business type via `available_features` / `business_features`.

---

## 1. Business Type Applicability

| Business Type | Use Case | Priority |
|---------------|----------|----------|
| **Restaurant** | Food delivery (dine-out orders) | High |
| **Pharmacy** | Prescription delivery to patients | High |
| **Grocery** | Grocery/household item delivery | High |
| **Retail** | Product shipping & local delivery | Medium |
| **Pet Care** | Pet supply/food delivery | Low |
| **Auto Repair** | Parts delivery or vehicle pickup/drop-off | Low |

---

## 2. Driver Management

### Driver Registration
- **Personal Info**: Full name, phone, email, address, date of birth
- **Identification**: Government ID number, driver's license number & expiry
- **Vehicle Info**: Make, model, year, color, license plate, insurance details
- **Status**: Available, On Delivery, Off Duty, Inactive
- **Authentication**: Drivers sign in with a dedicated `DeliveryDriver` role for a mobile-friendly view

### Driver Profiles
- Photo upload for identification
- Rating/performance metrics
- Delivery history & earnings
- Zone/area assignment
- Work schedule & availability windows

---

## 3. Delivery Order Lifecycle

### Order Flow

```
Order Created (type: delivery)
    → Pending Assignment
        → Assigned to Driver
            → Picked Up
                → In Transit
                    → Delivered
                        → Confirmed (customer signature/acknowledgment)
```

### Status Definitions

| Status | Description |
|--------|-------------|
| `pending_assignment` | Delivery order awaiting driver assignment |
| `assigned` | Driver has been assigned, en route to pickup |
| `picked_up` | Driver has collected the order from the business |
| `in_transit` | Driver is en route to the customer |
| `delivered` | Order has been dropped off |
| `confirmed` | Customer has confirmed receipt |
| `failed` | Delivery attempt failed (with reason) |
| `returned` | Order returned to business |

---

## 4. Delivery Zones

- Define geographic delivery zones per branch
- Set delivery fees per zone (flat rate or distance-based)
- Estimated delivery times per zone
- Zone-based driver assignment for efficiency
- Max delivery radius configuration

---

## 5. Data Model (Proposed)

### `delivery_drivers`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| business_id | UUID | FK → custom_businesses |
| branch_id | UUID | FK → branches |
| profile_id | UUID | FK → profiles (optional, for auth-linked drivers) |
| first_name | TEXT | Driver's first name |
| last_name | TEXT | Driver's last name |
| phone | TEXT | Contact number |
| email | TEXT | Email address |
| license_number | TEXT | Driver's license number |
| license_expiry | DATE | License expiration date |
| vehicle_make | TEXT | Vehicle manufacturer |
| vehicle_model | TEXT | Vehicle model |
| vehicle_year | INT | Vehicle year |
| vehicle_color | TEXT | Vehicle color |
| vehicle_plate | TEXT | License plate number |
| insurance_number | TEXT | Vehicle insurance policy |
| insurance_expiry | DATE | Insurance expiration date |
| photo_url | TEXT | Driver photo |
| status | TEXT | available, on_delivery, off_duty, inactive |
| rating | NUMERIC | Average delivery rating |
| total_deliveries | INT | Lifetime delivery count |
| created_at | TIMESTAMPTZ | Record creation |
| updated_at | TIMESTAMPTZ | Last update |

### `delivery_orders`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| business_id | UUID | FK → custom_businesses |
| branch_id | UUID | FK → branches |
| driver_id | UUID | FK → delivery_drivers (nullable until assigned) |
| source_type | TEXT | Which module originated the order (restaurant_order, prescription, retail_order) |
| source_id | UUID | FK → the originating record (order_id, prescription_id, etc.) |
| customer_name | TEXT | Recipient name |
| customer_phone | TEXT | Recipient phone |
| delivery_address | TEXT | Full delivery address |
| delivery_notes | TEXT | Special instructions |
| delivery_fee | NUMERIC | Charge for delivery |
| estimated_time_minutes | INT | Estimated delivery time |
| status | TEXT | See lifecycle above |
| assigned_at | TIMESTAMPTZ | When driver was assigned |
| picked_up_at | TIMESTAMPTZ | When order was picked up |
| delivered_at | TIMESTAMPTZ | When order was delivered |
| failed_reason | TEXT | Reason if delivery failed |
| customer_signature_url | TEXT | Proof of delivery |
| created_at | TIMESTAMPTZ | Record creation |
| updated_at | TIMESTAMPTZ | Last update |

### `delivery_zones`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| business_id | UUID | FK → custom_businesses |
| branch_id | UUID | FK → branches |
| zone_name | TEXT | Zone label (e.g., "Downtown", "Zone A") |
| delivery_fee | NUMERIC | Fee for this zone |
| estimated_minutes | INT | Average delivery time |
| max_radius_km | NUMERIC | Maximum distance |
| is_active | BOOLEAN | Zone availability |
| created_at | TIMESTAMPTZ | Record creation |

---

## 6. Integration Points by Business Type

### Restaurant
- Orders with `order_type = 'delivery'` automatically create a `delivery_orders` record
- `source_type = 'restaurant_order'`, `source_id = orders.id`
- Driver assignment from the Orders page or a dedicated Delivery Dashboard

### Pharmacy
- Prescriptions marked for delivery create a `delivery_orders` record after dispensing
- `source_type = 'prescription'`, `source_id = prescriptions.id`
- Requires special handling: temperature-sensitive medications, signature required, ID verification on delivery

### Grocery
- Grocery orders placed for delivery
- `source_type = 'grocery_order'`
- Supports batched deliveries (multiple orders per trip)

### Retail
- Product orders with delivery option
- `source_type = 'retail_order'`
- Package tracking and proof of delivery

---

## 7. Role & Permissions

### New Role: `DeliveryDriver`
- **View**: Assigned delivery orders only
- **Update**: Order status (picked_up, in_transit, delivered, failed)
- **No Access**: Financial data, inventory, employee management, other business operations

### Manager/Admin Permissions
- Assign/reassign drivers to orders
- View all delivery orders and driver statuses
- Manage driver profiles (CRUD)
- Configure delivery zones and fees
- View delivery analytics

---

## 8. UI Components (Planned)

| Component | Description |
|-----------|-------------|
| `DeliveryDashboard` | Overview of active deliveries, driver statuses, pending assignments |
| `DriverManagement` | CRUD interface for driver profiles and vehicles |
| `DeliveryOrderCard` | Card showing delivery status, driver info, ETA |
| `DriverAssignDialog` | Dialog to assign/reassign a driver to an order |
| `DeliveryZoneSettings` | Configure zones, fees, and radius per branch |
| `DriverMobileView` | Simplified mobile-first view for drivers to manage their active deliveries |

---

## 9. Analytics

- **Delivery Volume**: Orders per day/week/month
- **Average Delivery Time**: From assignment to delivered
- **Driver Performance**: Deliveries per driver, ratings, on-time percentage
- **Zone Heatmap**: Delivery density by zone
- **Failed Deliveries**: Failure rate and common reasons
- **Revenue**: Delivery fee income

---

## 10. Feature Registration

The delivery feature should be registered in `available_features` as:

| Field | Value |
|-------|-------|
| id | `delivery-management` |
| name | Delivery Management |
| description | Driver registration, order delivery tracking, and zone management |
| icon | Truck |
| category | operations |

Then linked via `business_type_features` to applicable business types (Restaurant, Pharmacy, Grocery, Retail).

Route mapping in `useBusinessFeatures.ts`:
```typescript
'delivery-management': ['/delivery', '/delivery-drivers', '/delivery-zones']
```

---

## 11. Implementation Phases

### Phase 1: Core Infrastructure
- Database tables (delivery_drivers, delivery_orders, delivery_zones)
- RLS policies for business-level data isolation
- DeliveryDriver role in app_role enum

### Phase 2: Driver Management UI
- Driver CRUD (registration, profiles, vehicle info)
- Driver status management
- Driver list and search

### Phase 3: Delivery Order Flow
- Order-to-delivery linking for Restaurant orders
- Driver assignment dialog
- Delivery status tracking UI
- Delivery dashboard

### Phase 4: Cross-Business Integration
- Pharmacy prescription delivery
- Grocery order delivery
- Retail product delivery

### Phase 5: Advanced Features
- Delivery zone configuration
- Driver mobile view
- Delivery analytics dashboard
- Customer notifications (SMS/push for delivery status)
- Proof of delivery (photo/signature capture)
