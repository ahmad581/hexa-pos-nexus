-- Remove recursive policies on user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;

-- Function: check current user's primary role via JWT email (avoids referencing user_roles)
CREATE OR REPLACE FUNCTION public.current_user_has_primary_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.email = (current_setting('request.jwt.claims')::json ->> 'email')
      AND p.primary_role = _role
      AND COALESCE(p.is_active, true)
  );
$$;

-- Policy: Admins (SystemMaster, SuperManager) and super admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.current_user_has_primary_role('SystemMaster'::app_role)
  OR public.current_user_has_primary_role('SuperManager'::app_role)
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  public.current_user_has_primary_role('SystemMaster'::app_role)
  OR public.current_user_has_primary_role('SuperManager'::app_role)
  OR public.is_super_admin(auth.uid())
);