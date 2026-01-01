-- Drop existing policies on branches
DROP POLICY IF EXISTS "Users can manage branches in their business" ON public.branches;
DROP POLICY IF EXISTS "Users can view branches in their business" ON public.branches;

-- Create updated policies that allow users associated with a business to view its branches
CREATE POLICY "Users can view branches in their business" 
ON public.branches 
FOR SELECT 
USING (
  -- Business owner can see branches
  (business_id IN (
    SELECT id FROM custom_businesses WHERE user_id = auth.uid()
  ))
  -- Users whose profile is associated with this business can see branches
  OR (business_id IN (
    SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
  ))
  -- Super admins can see all
  OR is_super_admin(auth.uid())
);

-- Management policy (create/update/delete) - only owners and super admins
CREATE POLICY "Users can manage branches in their business" 
ON public.branches 
FOR ALL 
USING (
  (business_id IN (
    SELECT id FROM custom_businesses WHERE user_id = auth.uid()
  ))
  OR is_super_admin(auth.uid())
)
WITH CHECK (
  (business_id IN (
    SELECT id FROM custom_businesses WHERE user_id = auth.uid()
  ))
  OR is_super_admin(auth.uid())
);