
# Pharmacy Business Type - Complete Implementation Plan

## Overview
This plan implements the missing pharmacy features as documented in `docs/business-types/PHARMACY.md`. The current implementation only has a basic Prescriptions page with hardcoded data. We will build a complete pharmacy management system with database-backed prescriptions, patient management, pharmacy inventory, and a checkout/POS system.

## Current State Analysis

**What Exists:**
- Basic `Prescriptions.tsx` page with hardcoded mock data
- `prescriptions` table in database (empty, with fields: `branch_id`, `doctor_name`, `dosage`, `medication_name`, `patient_name`, `patient_phone`, `prescription_number`, `quantity`, `status`, `instructions`, `filled_date`)
- `PrescriptionsAnalytics.tsx` component ready to display prescription data
- Pharmacy business type configured with sidebar navigation

**What's Missing (to be built):**
1. Patient Management system
2. CRUD operations for prescriptions (currently hardcoded)
3. Prescription workflow with proper status flow
4. Pharmacy-specific inventory features
5. Checkout/POS for prescription pickup
6. Proper database hooks and real-time data

---

## Implementation Tasks

### Phase 1: Database Schema Updates

**1.1 Create `pharmacy_patients` table**
Store patient profiles with medical history and insurance info.

```text
pharmacy_patients
- id (uuid, PK)
- branch_id (uuid, FK -> branches)
- business_id (uuid, FK -> custom_businesses)
- first_name (text)
- last_name (text)
- date_of_birth (date)
- phone (text)
- email (text, nullable)
- address (text, nullable)
- allergies (text[], nullable) 
- conditions (text[], nullable)
- insurance_provider (text, nullable)
- insurance_id (text, nullable)
- emergency_contact_name (text, nullable)
- emergency_contact_phone (text, nullable)
- notes (text, nullable)
- created_at, updated_at
```

**1.2 Update `prescriptions` table**
Add missing fields for complete workflow:
- Add `patient_id` (FK -> pharmacy_patients)
- Add `prescription_type` (enum: new, refill, transfer, compound, controlled)
- Add `refills_remaining` (integer)
- Add `refills_total` (integer)
- Add `is_controlled_substance` (boolean)
- Add `schedule` (text, nullable - for controlled substances)
- Add `verified_by` (uuid, nullable - pharmacist who verified)
- Add `dispensed_by` (uuid, nullable)
- Add `dispensed_at` (timestamp, nullable)
- Add `copay_amount` (decimal, nullable)
- Add `insurance_billed` (boolean)

**1.3 Create `pharmacy_checkout` table**
Track prescription pickups and payments:
```text
pharmacy_checkout
- id (uuid, PK)
- branch_id (uuid, FK)
- patient_id (uuid, FK)
- prescription_ids (uuid[])
- subtotal (decimal)
- insurance_covered (decimal)
- copay (decimal)
- otc_items_total (decimal)
- total (decimal)
- payment_method (text)
- payment_status (text)
- counseling_acknowledged (boolean)
- created_at
```

---

### Phase 2: Hooks and Data Layer

**2.1 Create `usePrescriptions.ts` hook**
```text
Location: src/hooks/usePrescriptions.ts

Functions:
- Fetch all prescriptions for branch
- Create new prescription
- Update prescription status (workflow transitions)
- Fill prescription (Pending -> Ready)
- Dispense prescription (Ready -> Dispensed)
- Cancel prescription
- Request refill
- Search prescriptions by patient/medication
```

**2.2 Create `usePharmacyPatients.ts` hook**
```text
Location: src/hooks/usePharmacyPatients.ts

Functions:
- Fetch all patients for branch
- Create new patient
- Update patient profile
- Search patients by name/phone
- Get patient prescription history
- Get patient medication list
```

**2.3 Create `usePharmacyCheckout.ts` hook**
```text
Location: src/hooks/usePharmacyCheckout.ts

Functions:
- Create checkout session
- Process payment
- Get checkout history
```

---

### Phase 3: UI Components

**3.1 Prescription Management Components**

**CreatePrescriptionDialog.tsx**
```text
Location: src/components/pharmacy/CreatePrescriptionDialog.tsx

Fields:
- Patient lookup/search (autocomplete)
- Or create new patient inline
- Doctor name and license
- Medication name, strength, form
- Dosage instructions
- Quantity, refills allowed
- Controlled substance checkbox + schedule
- Notes/instructions
```

**PrescriptionCard.tsx**
```text
Location: src/components/pharmacy/PrescriptionCard.tsx

Displays:
- Rx number, status badge
- Patient name with link to profile
- Medication, dosage, quantity
- Doctor info
- Refills remaining
- Action buttons based on status
```

**PrescriptionStatusFlow.tsx**
```text
Location: src/components/pharmacy/PrescriptionStatusFlow.tsx

Visual workflow indicator:
Received -> Verified -> Processing -> Ready -> Dispensed
```

**3.2 Patient Management Components**

**PatientDialog.tsx**
```text
Location: src/components/pharmacy/PatientDialog.tsx

Create/Edit patient with:
- Personal info section
- Medical history (allergies, conditions)
- Insurance info section
- Emergency contact
```

**PatientSearchAutocomplete.tsx**
```text
Location: src/components/pharmacy/PatientSearchAutocomplete.tsx

Search patients by name or phone with dropdown results
```

**3.3 Checkout Components**

**PharmacyCheckout.tsx**
```text
Location: src/components/pharmacy/PharmacyCheckout.tsx

- Select ready prescriptions for patient
- Show insurance/copay breakdown
- Add OTC items
- Payment processing
- Counseling acknowledgment checkbox
- Print receipt
```

---

### Phase 4: Pages

**4.1 Update Prescriptions.tsx**
```text
Location: src/pages/businesses/pharmacy/Prescriptions.tsx

Changes:
- Replace hardcoded data with usePrescriptions hook
- Add "New Prescription" button with dialog
- Add filters (status, date range, search)
- Add prescription workflow actions
- Real-time updates via query invalidation
```

**4.2 Create Patients.tsx**
```text
Location: src/pages/businesses/pharmacy/Patients.tsx

Features:
- Patient list with search
- Add new patient button
- Patient cards showing:
  - Name, DOB, phone
  - Insurance status
  - Active prescriptions count
  - Last visit date
- Click to view full profile
```

**4.3 Create PatientProfile.tsx**
```text
Location: src/pages/businesses/pharmacy/PatientProfile.tsx

Sections:
- Patient info header
- Medication history tab
- Prescription history tab
- Insurance information
- Edit profile button
```

**4.4 Create PharmacyPOS.tsx**
```text
Location: src/pages/businesses/pharmacy/PharmacyPOS.tsx

Checkout flow:
- Search/select patient
- Show ready prescriptions
- Add OTC items
- Calculate totals
- Process payment
- Counseling acknowledgment
- Complete transaction
```

---

### Phase 5: Navigation and Routing

**5.1 Update App.tsx routes**
Add new pharmacy routes:
```text
/patients -> Patients.tsx
/patient/:id -> PatientProfile.tsx
/pharmacy-pos -> PharmacyPOS.tsx
```

**5.2 Update Sidebar.tsx**
Expand pharmacy navigation items:
```text
- Prescriptions (existing)
- Patients (new)
- Checkout/POS (new)
- Inventory (link to shared inventory)
```

---

## File Creation Summary

### New Files to Create:
1. `supabase/migrations/XXXXXX_pharmacy_schema.sql` - Database migration
2. `src/hooks/usePrescriptions.ts` - Prescription data hook
3. `src/hooks/usePharmacyPatients.ts` - Patient data hook
4. `src/hooks/usePharmacyCheckout.ts` - Checkout data hook
5. `src/components/pharmacy/CreatePrescriptionDialog.tsx` - New prescription form
6. `src/components/pharmacy/PrescriptionCard.tsx` - Prescription display card
7. `src/components/pharmacy/PatientDialog.tsx` - Create/edit patient form
8. `src/components/pharmacy/PatientSearchAutocomplete.tsx` - Patient search
9. `src/components/pharmacy/PharmacyCheckout.tsx` - Checkout component
10. `src/pages/businesses/pharmacy/Patients.tsx` - Patient list page
11. `src/pages/businesses/pharmacy/PatientProfile.tsx` - Patient detail page
12. `src/pages/businesses/pharmacy/PharmacyPOS.tsx` - Checkout/POS page

### Files to Modify:
1. `src/pages/businesses/pharmacy/Prescriptions.tsx` - Use real data
2. `src/App.tsx` - Add new routes
3. `src/components/Sidebar.tsx` - Add pharmacy nav items
4. `src/integrations/supabase/types.ts` - Auto-generated after migration

---

## Technical Details

### Status Workflow
```text
received -> verified -> processing -> ready -> dispensed
                                    \-> cancelled (from any state)
```

### Controlled Substance Handling
- Require pharmacist verification flag
- Track DEA schedule (II, III, IV, V)
- Log all actions with timestamps and user IDs
- Patient ID verification step before dispensing

### Insurance Integration (Mock)
- Store insurance provider and ID on patient
- Calculate mock copay amounts
- Track if prescription was insurance billed

---

## Estimated Implementation Order

1. **Database migrations** (Phase 1) - Foundation for all features
2. **Data hooks** (Phase 2) - Enable data operations
3. **Update Prescriptions.tsx** (Phase 4.1) - Core functionality first
4. **CreatePrescriptionDialog** (Phase 3.1) - Add new prescriptions
5. **Patient management** (Phases 3.2, 4.2, 4.3) - Patient profiles
6. **Checkout/POS** (Phases 3.3, 4.4) - Complete the workflow
7. **Navigation updates** (Phase 5) - Wire everything together

This implementation will transform the pharmacy module from a static mockup into a fully functional prescription management system aligned with the documented requirements.
