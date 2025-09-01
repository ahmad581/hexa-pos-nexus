-- Add is_super_admin column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin boolean DEFAULT false;

-- Update the existing profile to be super admin
UPDATE public.profiles 
SET is_super_admin = true, role = 'super_admin'
WHERE email = 'restaurant@bizhub.com';