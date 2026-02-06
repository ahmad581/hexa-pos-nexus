# Salon Business Type - BizHub POS

This document explains how BizHub POS operates for salon and beauty businesses, including all specific features and workflows.

---

## Overview

The salon module is designed for beauty and personal care establishments including hair salons, nail salons, spas, barbershops, and beauty parlors. It provides comprehensive tools for managing appointments, stylists, services, and client relationships.

### Terminology
| Standard Term | Salon Term |
|--------------|------------|
| Branch | Salon / Studio |
| Unit | Station / Chair |
| Customer | Client |
| Service | Treatment / Service |

---

## 1. Appointment Scheduling

### Overview
Comprehensive booking system for managing client appointments and stylist availability.

### Features

#### Appointment Creation
- **Client Selection**: New or existing client
- **Service Selection**: Choose one or multiple services
- **Stylist Assignment**: Book with specific stylist
- **Time Slot Selection**: Available time slots based on duration

#### Appointment Details
- **Date & Time**: Specific appointment slot
- **Duration**: Auto-calculated based on services
- **Price**: Total cost of all services
- **Notes**: Special requests or preferences

#### Appointment Status Flow
1. **Scheduled** - Appointment booked
2. **Confirmed** - Client confirmed attendance
3. **In Progress** - Client arrived, service started
4. **Completed** - Service finished
5. **Cancelled** - Appointment cancelled
6. **No Show** - Client didn't arrive

#### Booking Features
- Online booking integration (future)
- Recurring appointments
- Waitlist management
- Buffer time between appointments
- Walk-in handling

### Appointment Analytics
- Booking rates by day/time
- Service popularity
- Stylist utilization
- No-show rates
- Average appointment value

---

## 2. Stylist Management

### Overview
Complete management of salon professionals and their schedules.

### Features

#### Stylist Profiles
- **Personal Information**: Name, contact details, photo
- **Specializations**: Areas of expertise
- **Certifications**: Professional qualifications
- **Experience Level**: Junior, Senior, Master

#### Schedule Management
- **Working Hours**: Define availability per stylist
- **Days Off**: Schedule vacation, sick days
- **Break Times**: Lunch and rest breaks
- **Shift Patterns**: Rotating schedules

#### Stylist Assignment
- **Service Capabilities**: Which services each stylist offers
- **Pricing Tiers**: Different rates for different stylists
- **Client Preferences**: Track client-stylist relationships

### Stylist Analytics
- Revenue per stylist
- Client retention per stylist
- Average service time
- Booking fill rate
- Client satisfaction scores

---

## 3. Service Management

### Overview
Catalog of all services offered with pricing and duration.

### Features

#### Service Catalog
- **Service Categories**: Hair, Nails, Skin, Makeup, etc.
- **Service Details**: Name, description, duration, price
- **Service Variations**: Options within services

#### Common Service Categories

**Hair Services**
- Haircuts (men's, women's, children's)
- Coloring (full, highlights, balayage)
- Treatments (keratin, deep conditioning)
- Styling (blowout, updo, braiding)

**Nail Services**
- Manicure (basic, gel, acrylic)
- Pedicure (basic, spa, gel)
- Nail art and extensions

**Skin Services**
- Facials (basic, deep cleansing, anti-aging)
- Waxing (face, body)
- Peels and treatments

**Spa Services**
- Massage (Swedish, deep tissue)
- Body treatments
- Aromatherapy

#### Pricing Configuration
- Base prices
- Stylist-level pricing
- Package deals
- Membership discounts

---

## 4. Client Management

### Overview
Complete client profile and history management for personalized service.

### Features

#### Client Profiles
- **Contact Information**: Phone, email, address
- **Preferences**: Preferred stylist, favorite products
- **Allergies/Sensitivities**: Important for treatments
- **Communication Preferences**: SMS, email reminders

#### Client History
- **Appointment History**: All past visits
- **Service History**: What was done each visit
- **Product Purchases**: Retail purchase history
- **Notes**: Stylist notes from each visit

#### Client Communication
- Appointment reminders
- Birthday messages
- Promotion notifications
- Follow-up messages

### Client Analytics
- Visit frequency
- Average spend
- Service preferences
- Retention rates

---

## 5. Inventory Management (Salon-Specific)

### Specialized Features
- **Product Tracking**: Professional and retail products
- **Usage Monitoring**: Product consumption per service
- **Retail Sales**: Track product sales to clients
- **Supplier Management**: Manage beauty supply vendors

### Common Inventory Categories

**Professional Products**
- Hair color and developer
- Treatment products
- Styling products
- Nail supplies
- Skincare products

**Retail Products**
- Shampoos and conditioners
- Styling tools
- Skincare items
- Nail care products

**Supplies**
- Towels and capes
- Disposable items
- Cleaning supplies
- Salon furniture/equipment

---

## 6. Point of Sale

### Features
- Service checkout
- Product sales
- Package sales
- Gift card sales
- Membership sales

### Payment Options
- Cash
- Card payments
- Split payments
- Tips processing
- Gift card redemption

---

## 7. Employee Roles (Salon-Specific)

| Role | Responsibilities |
|------|-----------------|
| Salon Owner | Business management |
| Salon Manager | Daily operations |
| Senior Stylist | Complex services, training |
| Stylist | Hair services |
| Nail Technician | Nail services |
| Esthetician | Skin services |
| Receptionist | Booking, check-in |
| Assistant | Support services |

---

## 8. Workflow Examples

### Appointment Booking Flow

1. **Client Contact**
   - Client calls or books online
   - Receptionist checks availability

2. **Booking Creation**
   - Select client (new or existing)
   - Choose services needed
   - Select preferred stylist
   - Pick available time slot

3. **Confirmation**
   - Appointment created
   - Confirmation sent to client
   - Added to stylist schedule

4. **Reminder**
   - Automated reminder 24h before
   - Confirmation request sent

### Service Appointment Flow

1. **Client Arrival**
   - Check-in at reception
   - Appointment status: "In Progress"
   - Offered refreshments

2. **Consultation**
   - Stylist reviews history/notes
   - Discusses client wishes
   - Confirms services

3. **Service Delivery**
   - Services performed
   - Products used tracked
   - Notes added for future

4. **Checkout**
   - Services totaled
   - Retail products added
   - Payment processed
   - Next appointment booked

5. **Follow-up**
   - Thank you message sent
   - Feedback requested
   - Next visit reminder scheduled

---

## 9. Membership & Packages

### Features

#### Membership Programs
- Monthly memberships
- Service packages
- Prepaid services
- VIP client programs

#### Package Types
- Service bundles (haircut + color)
- Multi-visit packages
- Annual memberships
- Referral rewards

---

## 10. Integration Points

### Shared Features Used
- ✅ Employee Management (stylist scheduling, commissions)
- ✅ Inventory Management (products, supplies)
- ✅ Call Center (appointment booking, inquiries)
- ✅ Analytics & Reporting
- ✅ Branch Management (multi-location salons)

### Third-Party Integrations (Future)
- Online booking platforms
- Marketing tools
- Payment processors
- Accounting software
- Social media scheduling

---

## 11. Best Practices

### Appointment Management
- Send reminders to reduce no-shows
- Build buffer time for cleanup
- Track service durations for accurate scheduling
- Maintain waitlist for cancellations

### Client Relations
- Maintain detailed client notes
- Track preferences and allergies
- Personalize communications
- Follow up after visits

### Inventory Control
- Monitor product usage per service
- Track retail sales performance
- Reorder before stockouts
- Manage supplier relationships

### Stylist Management
- Balance workload across team
- Track performance metrics
- Encourage continuing education
- Manage time off fairly
