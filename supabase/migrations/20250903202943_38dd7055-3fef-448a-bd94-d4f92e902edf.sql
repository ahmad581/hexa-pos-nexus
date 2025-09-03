-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM (
  'SuperManager',
  'Manager', 
  'Cashier',
  'HallManager',
  'HrManager',
  'CallCenterEmp',
  'Employee'
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  branch_id TEXT REFERENCES public.branches(id),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role, branch_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  );
$$;

-- Create function to check if user has role in specific branch
CREATE OR REPLACE FUNCTION public.has_role_in_branch(_user_id UUID, _role app_role, _branch_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (branch_id = _branch_id OR branch_id IS NULL)
      AND is_active = true
  );
$$;

-- Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
  ORDER BY 
    CASE role
      WHEN 'SuperManager' THEN 1
      WHEN 'Manager' THEN 2
      WHEN 'HrManager' THEN 3
      WHEN 'HallManager' THEN 4
      WHEN 'CallCenterEmp' THEN 5
      WHEN 'Cashier' THEN 6
      WHEN 'Employee' THEN 7
    END
  LIMIT 1;
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "SuperManagers can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'SuperManager'));

CREATE POLICY "Managers can view roles in their branch"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'Manager') AND
  branch_id IN (
    SELECT branch_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'Manager' AND is_active = true
  )
);

CREATE POLICY "SuperManagers can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'SuperManager'));

CREATE POLICY "Managers can assign roles in their branch"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'Manager') AND
  branch_id IN (
    SELECT branch_id FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'Manager' AND is_active = true
  )
);

-- Update profiles table to work with new role system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS primary_role app_role,
ADD COLUMN IF NOT EXISTS role_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update profiles when user_roles change
CREATE OR REPLACE FUNCTION public.update_profile_primary_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the primary_role in profiles table
  UPDATE public.profiles 
  SET 
    primary_role = public.get_user_primary_role(COALESCE(NEW.user_id, OLD.user_id)),
    role_updated_at = now()
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_profile_role_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_primary_role();

-- Migrate existing data from profiles.role to user_roles
INSERT INTO public.user_roles (user_id, role, branch_id, assigned_at)
SELECT 
  user_id,
  CASE 
    WHEN is_super_admin = true THEN 'SuperManager'::app_role
    WHEN role = 'manager' THEN 'Manager'::app_role
    WHEN role = 'admin' THEN 'Manager'::app_role
    ELSE 'Employee'::app_role
  END,
  branch_id,
  created_at
FROM public.profiles
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role, branch_id) DO NOTHING;

-- Update primary_role in profiles based on user_roles
UPDATE public.profiles 
SET primary_role = public.get_user_primary_role(user_id)
WHERE user_id IS NOT NULL;