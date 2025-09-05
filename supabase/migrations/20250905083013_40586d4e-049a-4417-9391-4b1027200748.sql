-- Update the existing profile to have SystemMaster role
UPDATE profiles 
SET primary_role = 'SystemMaster'
WHERE email = 'ahmadalodat530@gmail.com' AND is_super_admin = true;