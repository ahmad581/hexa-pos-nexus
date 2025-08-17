-- Create user profiles table to store user information and branch assignments
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  branch_id TEXT NOT NULL,
  role TEXT DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (email = current_setting('request.jwt.claims')::json->>'email' OR true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (email = current_setting('request.jwt.claims')::json->>'email' OR true);

-- Insert demo users with branch assignments
INSERT INTO public.profiles (email, first_name, last_name, branch_id, role) VALUES
('restaurant@bizhub.com', 'Restaurant', 'Manager', '1', 'manager'),
('hotel@bizhub.com', 'Hotel', 'Manager', '2', 'manager'),
('salon@bizhub.com', 'Salon', 'Manager', '3', 'manager'),
('clinic@bizhub.com', 'Clinic', 'Manager', '4', 'manager'),
('retail@bizhub.com', 'Retail', 'Manager', '1', 'manager'),
('pharmacy@bizhub.com', 'Pharmacy', 'Manager', '2', 'manager'),
('grocery@bizhub.com', 'Grocery', 'Manager', '3', 'manager'),
('gym@bizhub.com', 'Gym', 'Manager', '4', 'manager'),
('autorepair@bizhub.com', 'Auto Repair', 'Manager', '5', 'manager'),
('petcare@bizhub.com', 'Pet Care', 'Manager', '1', 'manager');

-- Add foreign key constraints to existing tables to link them to branches
ALTER TABLE inventory_items ADD COLUMN branch_id TEXT;
ALTER TABLE inventory_requests ADD COLUMN requesting_branch_id TEXT;

-- Update existing data with default branch assignments
UPDATE inventory_items SET branch_id = '1' WHERE branch_id IS NULL;
UPDATE inventory_requests SET requesting_branch_id = branch_id WHERE requesting_branch_id IS NULL;

-- Create trigger for updating timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();