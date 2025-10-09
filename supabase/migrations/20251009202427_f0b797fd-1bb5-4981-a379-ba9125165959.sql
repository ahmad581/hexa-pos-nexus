-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Managers can assign roles in their branch" ON public.user_roles;
DROP POLICY IF EXISTS "Managers can view roles in their branch" ON public.user_roles;
DROP POLICY IF EXISTS "SuperManagers can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "SuperManagers can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create a simple policy that allows authenticated users to read their own roles
-- This prevents recursion since it doesn't call has_role()
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow service role (used by SECURITY DEFINER functions) to bypass RLS
CREATE POLICY "Service role can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  -- Allow if user is SystemMaster (direct check without recursion)
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'SystemMaster'::app_role
    AND ur.is_active = true
    LIMIT 1
  )
  OR
  -- Allow if user is SuperManager (direct check without recursion)
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'SuperManager'::app_role
    AND ur.is_active = true
    LIMIT 1
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'SystemMaster'::app_role
    AND ur.is_active = true
    LIMIT 1
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'SuperManager'::app_role
    AND ur.is_active = true
    LIMIT 1
  )
);