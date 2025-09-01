-- Create super admin system
ALTER TABLE public.profiles 
ADD COLUMN is_super_admin boolean DEFAULT false;

-- Create a super admin user profile
INSERT INTO public.profiles (
  id, 
  user_id, 
  email, 
  first_name, 
  last_name, 
  branch_id, 
  role, 
  is_super_admin, 
  is_active
) VALUES (
  gen_random_uuid(),
  '0a827a20-ad05-44bf-af80-080e78833bf6', -- The user ID from auth logs
  'restaurant@bizhub.com',
  'System',
  'Admin',
  'main-branch',
  'super_admin',
  true,
  true
) ON CONFLICT (user_id) DO UPDATE SET
  is_super_admin = true,
  role = 'super_admin';

-- Update RLS policies for custom_businesses to allow super admin access
DROP POLICY IF EXISTS "Users can view their own businesses" ON public.custom_businesses;
CREATE POLICY "Users can view their businesses or super admin can view all" 
ON public.custom_businesses 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_super_admin = true
  )
);

DROP POLICY IF EXISTS "Users can create their own businesses" ON public.custom_businesses;
CREATE POLICY "Users can create businesses or super admin can create any" 
ON public.custom_businesses 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_super_admin = true
  )
);

DROP POLICY IF EXISTS "Users can update their own businesses" ON public.custom_businesses;
CREATE POLICY "Users can update their businesses or super admin can update any" 
ON public.custom_businesses 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_super_admin = true
  )
);

DROP POLICY IF EXISTS "Users can delete their own businesses" ON public.custom_businesses;
CREATE POLICY "Users can delete their businesses or super admin can delete any" 
ON public.custom_businesses 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_super_admin = true
  )
);

-- Update business_features policies for super admin
DROP POLICY IF EXISTS "Users can manage their business features" ON public.business_features;
DROP POLICY IF EXISTS "Users can view their business features" ON public.business_features;

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
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_super_admin = true
  )
);

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
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.is_super_admin = true
  )
);