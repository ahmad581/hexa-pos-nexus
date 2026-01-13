-- Drop existing SELECT policies for business_features
DROP POLICY IF EXISTS "Users can view their business features" ON public.business_features;
DROP POLICY IF EXISTS "Users can view business features or super admin can view all" ON public.business_features;

-- Create new SELECT policy that allows employees to read features for their business
CREATE POLICY "Anyone can view features for their business"
ON public.business_features
FOR SELECT
USING (
  -- Super admin
  is_super_admin(auth.uid())
  -- Business owner
  OR EXISTS (
    SELECT 1 FROM custom_businesses 
    WHERE custom_businesses.id = business_features.business_id 
    AND custom_businesses.user_id = auth.uid()
  )
  -- Employees who belong to the business (via profiles)
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.business_id = business_features.business_id
  )
);