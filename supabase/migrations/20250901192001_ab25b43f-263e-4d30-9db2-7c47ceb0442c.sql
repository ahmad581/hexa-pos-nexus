-- Create security definer function for admin check to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE profiles.user_id = $1),
    false
  );
$$;

-- Update RLS policies for custom_businesses with security definer function
DROP POLICY IF EXISTS "Users can view their businesses or super admin can view all" ON public.custom_businesses;
CREATE POLICY "Users can view their businesses or super admin can view all" 
ON public.custom_businesses 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  public.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can create businesses or super admin can create any" ON public.custom_businesses;
CREATE POLICY "Users can create businesses or super admin can create any" 
ON public.custom_businesses 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR 
  public.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can update their businesses or super admin can update any" ON public.custom_businesses;
CREATE POLICY "Users can update their businesses or super admin can update any" 
ON public.custom_businesses 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  public.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can delete their businesses or super admin can delete any" ON public.custom_businesses;
CREATE POLICY "Users can delete their businesses or super admin can delete any" 
ON public.custom_businesses 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR 
  public.is_super_admin(auth.uid())
);

-- Update business_features policies with security definer function
DROP POLICY IF EXISTS "Users can view business features or super admin can view all" ON public.business_features;
CREATE POLICY "Users can view business features or super admin can view all" 
ON public.business_features 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM custom_businesses 
    WHERE custom_businesses.id = business_features.business_id 
    AND custom_businesses.user_id = auth.uid()
  )
  OR 
  public.is_super_admin(auth.uid())
);

DROP POLICY IF EXISTS "Users can manage business features or super admin can manage all" ON public.business_features;
CREATE POLICY "Users can manage business features or super admin can manage all" 
ON public.business_features 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM custom_businesses 
    WHERE custom_businesses.id = business_features.business_id 
    AND custom_businesses.user_id = auth.uid()
  )
  OR 
  public.is_super_admin(auth.uid())
);