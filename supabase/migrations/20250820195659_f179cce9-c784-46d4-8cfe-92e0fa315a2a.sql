-- Create available features table
CREATE TABLE public.available_features (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  category text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create custom businesses table
CREATE TABLE public.custom_businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  business_type text NOT NULL,
  icon text,
  category text NOT NULL,
  terminology jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create business features junction table
CREATE TABLE public.business_features (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  feature_id text REFERENCES public.available_features(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(business_id, feature_id)
);

-- Enable RLS
ALTER TABLE public.available_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_features ENABLE ROW LEVEL SECURITY;

-- RLS policies for available_features (public read)
CREATE POLICY "Anyone can view available features" 
ON public.available_features 
FOR SELECT 
USING (true);

-- RLS policies for custom_businesses
CREATE POLICY "Users can view their own businesses" 
ON public.custom_businesses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own businesses" 
ON public.custom_businesses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own businesses" 
ON public.custom_businesses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own businesses" 
ON public.custom_businesses 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for business_features
CREATE POLICY "Users can view their business features" 
ON public.business_features 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.custom_businesses 
  WHERE id = business_features.business_id AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their business features" 
ON public.business_features 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.custom_businesses 
  WHERE id = business_features.business_id AND user_id = auth.uid()
));

-- Insert available features
INSERT INTO public.available_features (id, name, description, icon, category) VALUES
('menu-management', 'Menu Management', 'Manage menu items and categories', '📋', 'Food & Beverage'),
('table-reservations', 'Table Reservations', 'Handle table bookings and reservations', '🪑', 'Food & Beverage'),
('delivery', 'Delivery', 'Manage delivery orders and tracking', '🚚', 'Food & Beverage'),
('pos', 'Point of Sale', 'Process payments and transactions', '💳', 'Sales'),
('room-booking', 'Room Booking', 'Manage room reservations', '🏨', 'Hospitality'),
('guest-management', 'Guest Management', 'Track guest information and stays', '👥', 'Hospitality'),
('billing', 'Billing & Invoicing', 'Generate bills and invoices', '🧾', 'Finance'),
('concierge', 'Concierge Services', 'Manage concierge requests', '🛎️', 'Hospitality'),
('appointment-booking', 'Appointment Booking', 'Schedule and manage appointments', '📅', 'Scheduling'),
('service-management', 'Service Management', 'Manage services offered', '⚙️', 'Operations'),
('staff-scheduling', 'Staff Scheduling', 'Schedule staff and manage shifts', '👨‍💼', 'HR'),
('patient-management', 'Patient Management', 'Track patient records and history', '🏥', 'Healthcare'),
('inventory-management', 'Inventory Management', 'Track stock and inventory', '📦', 'Operations'),
('customer-loyalty', 'Customer Loyalty', 'Manage loyalty programs', '⭐', 'Marketing'),
('sales-tracking', 'Sales Tracking', 'Track sales and revenue', '📊', 'Analytics'),
('prescription-management', 'Prescription Management', 'Handle prescriptions and medications', '💊', 'Healthcare'),
('inventory-tracking', 'Inventory Tracking', 'Advanced inventory tracking', '📋', 'Operations'),
('customer-records', 'Customer Records', 'Maintain customer information', '📁', 'Customer Service'),
('fresh-produce-tracking', 'Fresh Produce Tracking', 'Track perishable items', '🥬', 'Operations'),
('supplier-management', 'Supplier Management', 'Manage suppliers and vendors', '🏭', 'Operations'),
('membership-management', 'Membership Management', 'Handle memberships and subscriptions', '🏋️', 'Membership'),
('class-scheduling', 'Class Scheduling', 'Schedule classes and sessions', '📅', 'Scheduling'),
('equipment-tracking', 'Equipment Tracking', 'Track equipment and maintenance', '🏋️‍♂️', 'Operations'),
('trainer-management', 'Trainer Management', 'Manage trainers and instructors', '👨‍🏫', 'HR'),
('service-scheduling', 'Service Scheduling', 'Schedule services and repairs', '🔧', 'Scheduling'),
('parts-inventory', 'Parts Inventory', 'Manage parts and components', '🔩', 'Operations'),
('customer-vehicles', 'Customer Vehicles', 'Track customer vehicle information', '🚗', 'Customer Service'),
('pet-records', 'Pet Records', 'Maintain pet health records', '🐾', 'Healthcare');

-- Add updated_at trigger
CREATE TRIGGER update_custom_businesses_updated_at
  BEFORE UPDATE ON public.custom_businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();