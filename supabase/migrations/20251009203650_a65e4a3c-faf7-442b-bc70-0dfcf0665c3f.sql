-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Create a simple policy for users to view their own roles (no recursion)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for managing roles using the security definer function
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'SystemMaster'::app_role) 
  OR public.has_role(auth.uid(), 'SuperManager'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'SystemMaster'::app_role) 
  OR public.has_role(auth.uid(), 'SuperManager'::app_role)
);