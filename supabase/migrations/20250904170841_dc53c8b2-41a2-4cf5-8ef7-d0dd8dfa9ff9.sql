-- Update the get_user_primary_role function to include SystemMaster at the top
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
  ORDER BY 
    CASE role
      WHEN 'SystemMaster' THEN 0
      WHEN 'SuperManager' THEN 1
      WHEN 'Manager' THEN 2
      WHEN 'HrManager' THEN 3
      WHEN 'HallManager' THEN 4
      WHEN 'CallCenterEmp' THEN 5
      WHEN 'Cashier' THEN 6
      WHEN 'Employee' THEN 7
    END
  LIMIT 1;
$function$;

-- Add SystemMaster role to the specific email account
-- First, we need to find or create a profile for this email
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Try to find existing profile with this email
    SELECT user_id INTO target_user_id 
    FROM public.profiles 
    WHERE email = 'ahmadalodat530@gmail.com';
    
    -- If no profile exists, create one
    IF target_user_id IS NULL THEN
        target_user_id := gen_random_uuid();
        INSERT INTO public.profiles (id, user_id, email, first_name, last_name, branch_id, is_active)
        VALUES (gen_random_uuid(), target_user_id, 'ahmadalodat530@gmail.com', 'Ahmad', 'Aloudat', 'system-branch', true);
    END IF;
    
    -- Insert SystemMaster role for this user
    INSERT INTO public.user_roles (user_id, role, branch_id, is_active, assigned_at)
    VALUES (target_user_id, 'SystemMaster', NULL, true, now())
    ON CONFLICT (user_id, role, COALESCE(branch_id, '')) DO NOTHING;
END $$;