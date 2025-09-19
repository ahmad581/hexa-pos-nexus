-- Grant SystemMaster access to ahmadalodat530@gmail.com
-- First, check if user exists and create profile if needed
INSERT INTO public.profiles (
  user_id,
  email, 
  first_name,
  last_name,
  branch_id,
  primary_role,
  is_super_admin
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- Using a fixed UUID for this system user
  'ahmadalodat530@gmail.com',
  'Ahmad', 
  'System Master',
  'main',
  'SystemMaster'::app_role,
  true
) ON CONFLICT (email) DO UPDATE SET
  primary_role = 'SystemMaster'::app_role,
  is_super_admin = true,
  updated_at = now();

-- Grant SystemMaster role in user_roles table
INSERT INTO public.user_roles (
  user_id,
  role,
  branch_id,
  is_active,
  assigned_by
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'SystemMaster'::app_role,
  'main',
  true,
  '00000000-0000-0000-0000-000000000001'::uuid
) ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  updated_at = now();