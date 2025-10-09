-- Update the existing profile with the correct user_id
UPDATE public.profiles 
SET user_id = '4ed524a4-8c63-44f6-92b3-32799b5ee85a'
WHERE email = 'ahmadalodat530@gmail.com';

-- Insert the SystemMaster role in user_roles table
INSERT INTO public.user_roles (user_id, role, is_active, assigned_at)
VALUES ('4ed524a4-8c63-44f6-92b3-32799b5ee85a', 'SystemMaster'::app_role, true, now())
ON CONFLICT DO NOTHING;