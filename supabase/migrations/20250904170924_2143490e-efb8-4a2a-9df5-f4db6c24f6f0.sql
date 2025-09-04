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
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Find existing profile with this email
    SELECT user_id INTO target_user_id 
    FROM public.profiles 
    WHERE email = 'ahmadalodat530@gmail.com';
    
    -- If profile exists, assign SystemMaster role
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role, branch_id, is_active, assigned_at)
        VALUES (target_user_id, 'SystemMaster', NULL, true, now())
        ON CONFLICT (user_id, role, COALESCE(branch_id, '')) DO UPDATE SET
        is_active = true,
        assigned_at = now();
    END IF;
END $$;