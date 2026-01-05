-- Fix the profiles RLS policy that contains 'OR true' bypass
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create proper RLS policy that checks actual user email or allows admins
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  email = current_setting('request.jwt.claims', true)::json->>'email'
  OR user_id = auth.uid()
  OR public.is_super_admin(auth.uid())
  OR public.has_role(auth.uid(), 'SystemMaster')
  OR public.has_role(auth.uid(), 'SuperManager')
);