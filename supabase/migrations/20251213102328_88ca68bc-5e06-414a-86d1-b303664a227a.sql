-- Create business_types table
CREATE TABLE public.business_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  terminology JSONB NOT NULL DEFAULT '{
    "branch": "Branch",
    "branches": "Branches",
    "unit": "Unit",
    "units": "Units",
    "customer": "Customer",
    "customers": "Customers",
    "service": "Service",
    "services": "Services"
  }'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_type_features junction table
CREATE TABLE public.business_type_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type_id TEXT NOT NULL REFERENCES public.business_types(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL REFERENCES public.available_features(id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_type_id, feature_id)
);

-- Enable RLS
ALTER TABLE public.business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_type_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_types (read-only for all authenticated, manage for super admin)
CREATE POLICY "Anyone can view business types" ON public.business_types
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage business types" ON public.business_types
  FOR ALL USING (is_super_admin(auth.uid()));

-- RLS Policies for business_type_features
CREATE POLICY "Anyone can view business type features" ON public.business_type_features
  FOR SELECT USING (true);

CREATE POLICY "Super admins can manage business type features" ON public.business_type_features
  FOR ALL USING (is_super_admin(auth.uid()));

-- Insert existing business types
INSERT INTO public.business_types (id, name, icon, category, terminology) VALUES
('restaurant', 'Restaurant', '🍽️', 'Food & Beverage', '{"branch": "Branch", "branches": "Branches", "unit": "Table", "units": "Tables", "customer": "Customer", "customers": "Customers", "service": "Menu Item", "services": "Menu Items"}'),
('hotel', 'Hotel', '🏨', 'Hospitality', '{"branch": "Property", "branches": "Properties", "unit": "Room", "units": "Rooms", "customer": "Guest", "customers": "Guests", "service": "Service", "services": "Services"}'),
('hair-salon', 'Hair Salon', '💇', 'Beauty & Wellness', '{"branch": "Salon", "branches": "Salons", "unit": "Chair", "units": "Chairs", "customer": "Client", "customers": "Clients", "service": "Service", "services": "Services"}'),
('medical-clinic', 'Medical Clinic', '🏥', 'Healthcare', '{"branch": "Clinic", "branches": "Clinics", "unit": "Room", "units": "Rooms", "customer": "Patient", "customers": "Patients", "service": "Treatment", "services": "Treatments"}'),
('retail-store', 'Retail Store', '🛍️', 'Retail', '{"branch": "Store", "branches": "Stores", "unit": "Counter", "units": "Counters", "customer": "Customer", "customers": "Customers", "service": "Product", "services": "Products"}'),
('pharmacy', 'Pharmacy', '💊', 'Healthcare', '{"branch": "Pharmacy", "branches": "Pharmacies", "unit": "Counter", "units": "Counters", "customer": "Patient", "customers": "Patients", "service": "Prescription", "services": "Prescriptions"}'),
('grocery', 'Grocery Store', '🛒', 'Retail', '{"branch": "Store", "branches": "Stores", "unit": "Checkout", "units": "Checkouts", "customer": "Customer", "customers": "Customers", "service": "Product", "services": "Products"}'),
('gym', 'Gym & Fitness', '💪', 'Health & Fitness', '{"branch": "Location", "branches": "Locations", "unit": "Station", "units": "Stations", "customer": "Member", "customers": "Members", "service": "Class", "services": "Classes"}'),
('auto-repair', 'Auto Repair', '🔧', 'Automotive', '{"branch": "Shop", "branches": "Shops", "unit": "Bay", "units": "Bays", "customer": "Customer", "customers": "Customers", "service": "Service", "services": "Services"}'),
('pet-care', 'Pet Care', '🐾', 'Pet Services', '{"branch": "Clinic", "branches": "Clinics", "unit": "Room", "units": "Rooms", "customer": "Pet Owner", "customers": "Pet Owners", "service": "Service", "services": "Services"}');

-- Map features to business types
INSERT INTO public.business_type_features (business_type_id, feature_id) VALUES
-- Restaurant
('restaurant', 'menu-management'),
('restaurant', 'table-management'),
('restaurant', 'order-management'),
('restaurant', 'inventory-management'),
('restaurant', 'employee-management'),
('restaurant', 'analytics-reporting'),
('restaurant', 'call-center'),
-- Hotel
('hotel', 'room-management'),
('hotel', 'hotel-services'),
('hotel', 'employee-management'),
('hotel', 'analytics-reporting'),
('hotel', 'call-center'),
-- Hair Salon
('hair-salon', 'appointment-scheduling'),
('hair-salon', 'stylist-management'),
('hair-salon', 'employee-management'),
('hair-salon', 'analytics-reporting'),
-- Retail Store
('retail-store', 'product-management'),
('retail-store', 'inventory-management'),
('retail-store', 'employee-management'),
('retail-store', 'analytics-reporting'),
-- Pharmacy
('pharmacy', 'prescription-management'),
('pharmacy', 'inventory-management'),
('pharmacy', 'employee-management'),
('pharmacy', 'analytics-reporting'),
-- Grocery
('grocery', 'inventory-management'),
('grocery', 'employee-management'),
('grocery', 'analytics-reporting'),
-- Gym
('gym', 'member-management'),
('gym', 'employee-management'),
('gym', 'analytics-reporting'),
-- Auto Repair
('auto-repair', 'service-management'),
('auto-repair', 'inventory-management'),
('auto-repair', 'employee-management'),
('auto-repair', 'analytics-reporting'),
-- Pet Care
('pet-care', 'appointment-scheduling'),
('pet-care', 'service-management'),
('pet-care', 'employee-management'),
('pet-care', 'analytics-reporting'),
-- Medical Clinic
('medical-clinic', 'appointment-scheduling'),
('medical-clinic', 'employee-management'),
('medical-clinic', 'analytics-reporting');