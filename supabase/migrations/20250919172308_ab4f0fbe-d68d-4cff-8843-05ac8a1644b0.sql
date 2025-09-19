-- Grant SystemMaster access to ahmadalodat530@gmail.com
-- Insert profile record for the SystemMaster user
INSERT INTO public.profiles (
  user_id,
  email, 
  first_name,
  last_name,
  branch_id,
  primary_role,
  is_super_admin
) 
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  'ahmadalodat530@gmail.com',
  'Ahmad', 
  'System Master',
  'main',
  'SystemMaster'::app_role,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'ahmadalodat530@gmail.com'
);

-- Update existing profile if it exists
UPDATE public.profiles SET
  primary_role = 'SystemMaster'::app_role,
  is_super_admin = true,
  user_id = '00000000-0000-0000-0000-000000000001'::uuid,
  updated_at = now()
WHERE email = 'ahmadalodat530@gmail.com';

-- Insert SystemMaster role in user_roles table
INSERT INTO public.user_roles (
  user_id,
  role,
  branch_id,
  is_active,
  assigned_by
) 
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid,
  'SystemMaster'::app_role,
  'main',
  true,
  '00000000-0000-0000-0000-000000000001'::uuid
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid 
  AND role = 'SystemMaster'::app_role
);