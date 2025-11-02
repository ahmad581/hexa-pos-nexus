-- Add business_id to branches table to link branches to businesses
ALTER TABLE public.branches 
ADD COLUMN business_id uuid REFERENCES public.custom_businesses(id) ON DELETE CASCADE;

-- Add business_id to profiles table to link users to businesses
ALTER TABLE public.profiles 
ADD COLUMN business_id uuid REFERENCES public.custom_businesses(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_branches_business_id ON public.branches(business_id);
CREATE INDEX idx_profiles_business_id ON public.profiles(business_id);

-- Drop existing permissive RLS policies on branches
DROP POLICY IF EXISTS "Allow all operations on branches" ON public.branches;

-- Create new RLS policies for branches with business hierarchy
CREATE POLICY "Users can view branches in their business"
ON public.branches
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Users can manage branches in their business"
ON public.branches
FOR ALL
USING (
  business_id IN (
    SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  business_id IN (
    SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
);

-- Update user_roles RLS to validate branch belongs to user's business
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles in their business"
ON public.user_roles
FOR ALL
USING (
  (
    current_user_has_primary_role('SystemMaster'::app_role) 
    OR current_user_has_primary_role('SuperManager'::app_role) 
    OR public.is_super_admin(auth.uid())
  )
  AND (
    branch_id IS NULL 
    OR branch_id IN (
      SELECT b.id FROM public.branches b
      JOIN public.custom_businesses cb ON b.business_id = cb.id
      WHERE cb.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  (
    current_user_has_primary_role('SystemMaster'::app_role) 
    OR current_user_has_primary_role('SuperManager'::app_role) 
    OR public.is_super_admin(auth.uid())
  )
  AND (
    branch_id IS NULL 
    OR branch_id IN (
      SELECT b.id FROM public.branches b
      JOIN public.custom_businesses cb ON b.business_id = cb.id
      WHERE cb.user_id = auth.uid()
    )
  )
);