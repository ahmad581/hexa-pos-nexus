-- Create branches table first
CREATE TABLE public.branches (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  business_type text NOT NULL,
  manager_name text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create policy for branches
CREATE POLICY "Allow all operations on branches" 
ON public.branches 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Insert sample branches for different businesses
INSERT INTO branches (id, name, address, phone, business_type, manager_name, is_active) VALUES
-- Restaurant branches
('rest-mall-001', 'Mall Branch', '123 Shopping Mall, Food Court Level 2', '+1-555-0101', 'restaurant', 'John Smith', true),
('rest-downtown-001', 'Downtown Branch', '456 Main Street, Downtown', '+1-555-0102', 'restaurant', 'Sarah Johnson', true),

-- Hotel branches  
('hotel-central-001', 'Central Hotel', '789 City Center Avenue', '+1-555-0201', 'hotel', 'Michael Brown', true),
('hotel-beach-001', 'Beach Resort', '321 Ocean Drive', '+1-555-0202', 'hotel', 'Emily Davis', true),

-- Salon branches
('salon-uptown-001', 'Uptown Salon', '654 Fashion District', '+1-555-0301', 'hair-salon', 'Jessica Wilson', true),
('salon-mall-001', 'Mall Salon', '987 Shopping Plaza, Level 1', '+1-555-0302', 'hair-salon', 'David Miller', true),

-- Medical clinic branches
('clinic-downtown-001', 'Downtown Clinic', '147 Medical Center Drive', '+1-555-0401', 'medical-clinic', 'Dr. Lisa Garcia', true),
('clinic-north-001', 'North Branch Clinic', '258 North Avenue', '+1-555-0402', 'medical-clinic', 'Dr. Robert Taylor', true),

-- Retail store branches
('retail-mall-001', 'Mall Store', '369 Shopping Center, Unit 15', '+1-555-0501', 'retail-store', 'Amanda White', true),
('retail-outlet-001', 'Outlet Store', '741 Outlet Mall, Store 42', '+1-555-0502', 'retail-store', 'Chris Anderson', true),

-- Pharmacy branches
('pharmacy-main-001', 'Main Pharmacy', '852 Health Plaza', '+1-555-0601', 'pharmacy', 'Dr. Jennifer Lee', true),
('pharmacy-west-001', 'West Side Pharmacy', '963 West Boulevard', '+1-555-0602', 'pharmacy', 'Dr. Kevin Martinez', true);

-- Add new employee profiles (avoiding duplicates)
INSERT INTO profiles (email, first_name, last_name, branch_id, role, is_active) VALUES
-- Restaurant additional employees
('restaurant.server@bizhub.com', 'Maria', 'Rodriguez', 'rest-mall-001', 'employee', true),
('restaurant.chef@bizhub.com', 'James', 'Wilson', 'rest-downtown-001', 'employee', true),

-- Hotel additional employees  
('hotel.front@bizhub.com', 'Daniel', 'Kumar', 'hotel-central-001', 'employee', true),
('hotel.beach@bizhub.com', 'Isabella', 'Lopez', 'hotel-beach-001', 'employee', true),

-- Salon additional employees
('salon.stylist@bizhub.com', 'Marcus', 'Jackson', 'salon-uptown-001', 'employee', true),
('salon.mall@bizhub.com', 'Olivia', 'Turner', 'salon-mall-001', 'employee', true),

-- Medical clinic additional employees
('clinic.nurse@bizhub.com', 'Nurse Tom', 'Davis', 'clinic-downtown-001', 'employee', true),
('clinic.north@bizhub.com', 'Dr. Sarah', 'Wilson', 'clinic-north-001', 'employee', true),

-- Retail additional employees
('retail.sales@bizhub.com', 'Ashley', 'Moore', 'retail-mall-001', 'employee', true),
('retail.outlet@bizhub.com', 'Tyler', 'Clark', 'retail-outlet-001', 'employee', true),

-- Pharmacy additional employees
('pharmacy.tech@bizhub.com', 'Kevin', 'Wright', 'pharmacy-main-001', 'employee', true),
('pharmacy.west@bizhub.com', 'Dr. Anna', 'Hall', 'pharmacy-west-001', 'employee', true),

-- Grocery additional employees
('grocery.cashier@bizhub.com', 'Emma', 'Martinez', 'rest-mall-001', 'employee', true),

-- Gym additional employees  
('gym.trainer@bizhub.com', 'Zoe', 'Campbell', 'hotel-central-001', 'employee', true),

-- Auto repair additional employees
('autorepair.tech@bizhub.com', 'Tony', 'Roberts', 'retail-mall-001', 'employee', true),

-- Pet care additional employees
('petcare.vet@bizhub.com', 'Alex', 'Kim', 'clinic-downtown-001', 'employee', true);

-- Update existing profiles with proper branch assignments
UPDATE profiles SET 
  first_name = 'Alex', 
  last_name = 'Thompson', 
  branch_id = 'rest-mall-001',
  role = 'manager'
WHERE email = 'restaurant@bizhub.com';

UPDATE profiles SET 
  first_name = 'Sophie', 
  last_name = 'Chen', 
  branch_id = 'hotel-central-001',
  role = 'manager'
WHERE email = 'hotel@bizhub.com';

UPDATE profiles SET 
  first_name = 'Rachel', 
  last_name = 'Green', 
  branch_id = 'salon-uptown-001',
  role = 'manager'
WHERE email = 'salon@bizhub.com';

UPDATE profiles SET 
  first_name = 'Dr. Emma', 
  last_name = 'Johnson', 
  branch_id = 'clinic-downtown-001',
  role = 'manager'
WHERE email = 'clinic@bizhub.com';

UPDATE profiles SET 
  first_name = 'Mike', 
  last_name = 'Brown', 
  branch_id = 'retail-mall-001',
  role = 'manager'
WHERE email = 'retail@bizhub.com';

UPDATE profiles SET 
  first_name = 'Dr. Lisa', 
  last_name = 'Adams', 
  branch_id = 'pharmacy-main-001',
  role = 'manager'
WHERE email = 'pharmacy@bizhub.com';

UPDATE profiles SET 
  first_name = 'Sam', 
  last_name = 'Taylor', 
  branch_id = 'rest-mall-001',
  role = 'manager'
WHERE email = 'grocery@bizhub.com';

UPDATE profiles SET 
  first_name = 'Jake', 
  last_name = 'Phillips', 
  branch_id = 'hotel-central-001',
  role = 'manager'
WHERE email = 'gym@bizhub.com';

UPDATE profiles SET 
  first_name = 'Carlos', 
  last_name = 'Gonzalez', 
  branch_id = 'retail-mall-001',
  role = 'manager'
WHERE email = 'autorepair@bizhub.com';

UPDATE profiles SET 
  first_name = 'Dr. Maya', 
  last_name = 'Patel', 
  branch_id = 'clinic-downtown-001',
  role = 'manager'
WHERE email = 'petcare@bizhub.com';

-- Add trigger for updated_at
CREATE TRIGGER update_branches_updated_at
BEFORE UPDATE ON public.branches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();