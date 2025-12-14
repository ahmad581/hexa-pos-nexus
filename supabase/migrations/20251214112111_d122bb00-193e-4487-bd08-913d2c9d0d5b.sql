-- Step 1: Create roles table
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text,
  hierarchy_level integer NOT NULL DEFAULT 100,
  color_class text DEFAULT 'bg-gray-500',
  is_system_role boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Step 2: Create business_type_roles table
CREATE TABLE public.business_type_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type_id text NOT NULL REFERENCES public.business_types(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(business_type_id, role_id)
);

-- Step 3: Create role_permissions table
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_key text NOT NULL,
  is_granted boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role_id, permission_key)
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_type_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles (anyone can view, only system admins can modify)
CREATE POLICY "Anyone can view roles" ON public.roles FOR SELECT USING (true);
CREATE POLICY "System admins can manage roles" ON public.roles FOR ALL USING (is_super_admin(auth.uid()));

-- RLS Policies for business_type_roles
CREATE POLICY "Anyone can view business type roles" ON public.business_type_roles FOR SELECT USING (true);
CREATE POLICY "System admins can manage business type roles" ON public.business_type_roles FOR ALL USING (is_super_admin(auth.uid()));

-- RLS Policies for role_permissions
CREATE POLICY "Anyone can view role permissions" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "System admins can manage role permissions" ON public.role_permissions FOR ALL USING (is_super_admin(auth.uid()));

-- Step 4: Seed roles from existing app_role enum
INSERT INTO public.roles (name, display_name, description, icon, hierarchy_level, color_class, is_system_role) VALUES
  ('SystemMaster', 'System Master', 'Full system access with all privileges', 'Crown', 0, 'bg-purple-600', true),
  ('SuperManager', 'Super Manager', 'Business-wide management access', 'Shield', 1, 'bg-blue-600', true),
  ('Manager', 'Manager', 'Branch management access', 'UserCog', 2, 'bg-green-600', false),
  ('HrManager', 'HR Manager', 'Human resources management', 'Users', 3, 'bg-yellow-600', false),
  ('HallManager', 'Hall Manager', 'Front-of-house management', 'Store', 4, 'bg-orange-600', false),
  ('CallCenterEmp', 'Call Center', 'Call center operations', 'Phone', 5, 'bg-cyan-600', false),
  ('Cashier', 'Cashier', 'Point of sale operations', 'Calculator', 6, 'bg-pink-600', false),
  ('Employee', 'Employee', 'Basic employee access', 'User', 7, 'bg-gray-500', false);

-- Step 5: Seed permissions for each role
-- SystemMaster - all permissions
INSERT INTO public.role_permissions (role_id, permission_key) 
SELECT r.id, p.key FROM public.roles r, 
  (VALUES 
    ('access_business_management'), ('manage_users'), ('view_analytics'), 
    ('manage_inventory'), ('access_menu'), ('handle_orders'), 
    ('access_tables'), ('handle_calls'), ('access_employees'),
    ('manage_roles'), ('manage_business_types'), ('view_all_branches')
  ) AS p(key)
WHERE r.name = 'SystemMaster';

-- SuperManager - most permissions except system-level
INSERT INTO public.role_permissions (role_id, permission_key) 
SELECT r.id, p.key FROM public.roles r, 
  (VALUES 
    ('manage_users'), ('view_analytics'), ('manage_inventory'), 
    ('access_menu'), ('handle_orders'), ('access_tables'), 
    ('handle_calls'), ('access_employees'), ('manage_roles'), ('view_all_branches')
  ) AS p(key)
WHERE r.name = 'SuperManager';

-- Manager
INSERT INTO public.role_permissions (role_id, permission_key) 
SELECT r.id, p.key FROM public.roles r, 
  (VALUES 
    ('manage_users'), ('manage_inventory'), ('access_menu'), 
    ('handle_orders'), ('access_tables'), ('handle_calls'), ('access_employees')
  ) AS p(key)
WHERE r.name = 'Manager';

-- HrManager
INSERT INTO public.role_permissions (role_id, permission_key) 
SELECT r.id, p.key FROM public.roles r, 
  (VALUES ('manage_users'), ('access_employees')) AS p(key)
WHERE r.name = 'HrManager';

-- HallManager
INSERT INTO public.role_permissions (role_id, permission_key) 
SELECT r.id, p.key FROM public.roles r, 
  (VALUES ('manage_inventory'), ('access_menu'), ('access_tables')) AS p(key)
WHERE r.name = 'HallManager';

-- CallCenterEmp
INSERT INTO public.role_permissions (role_id, permission_key) 
SELECT r.id, p.key FROM public.roles r, 
  (VALUES ('access_menu'), ('handle_orders'), ('access_tables'), ('handle_calls')) AS p(key)
WHERE r.name = 'CallCenterEmp';

-- Cashier
INSERT INTO public.role_permissions (role_id, permission_key) 
SELECT r.id, p.key FROM public.roles r, 
  (VALUES ('access_menu'), ('handle_orders'), ('access_tables')) AS p(key)
WHERE r.name = 'Cashier';

-- Employee - minimal permissions
INSERT INTO public.role_permissions (role_id, permission_key) 
SELECT r.id, p.key FROM public.roles r, 
  (VALUES ('check_in_out')) AS p(key)
WHERE r.name = 'Employee';

-- Step 6: Create security definer function to check permissions
CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id uuid, _permission_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role = r.name::app_role
    JOIN public.role_permissions rp ON rp.role_id = r.id
    WHERE ur.user_id = _user_id
      AND ur.is_active = true
      AND rp.permission_key = _permission_key
      AND rp.is_granted = true
  )
$$;

-- Step 7: Create function to get role details
CREATE OR REPLACE FUNCTION public.get_role_by_name(_role_name text)
RETURNS TABLE(
  id uuid,
  name text,
  display_name text,
  description text,
  icon text,
  hierarchy_level integer,
  color_class text,
  is_system_role boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.name, r.display_name, r.description, r.icon, r.hierarchy_level, r.color_class, r.is_system_role
  FROM public.roles r
  WHERE r.name = _role_name AND r.is_active = true
$$;

-- Step 8: Seed default roles for existing business types
INSERT INTO public.business_type_roles (business_type_id, role_id, is_default)
SELECT bt.id, r.id, true
FROM public.business_types bt
CROSS JOIN public.roles r
WHERE r.name IN ('SuperManager', 'Manager', 'Employee')
ON CONFLICT (business_type_id, role_id) DO NOTHING;

-- Add restaurant-specific roles
INSERT INTO public.business_type_roles (business_type_id, role_id, is_default)
SELECT bt.id, r.id, false
FROM public.business_types bt
CROSS JOIN public.roles r
WHERE bt.id = 'restaurant' AND r.name IN ('HallManager', 'Cashier', 'CallCenterEmp')
ON CONFLICT (business_type_id, role_id) DO NOTHING;

-- Add retail-specific roles
INSERT INTO public.business_type_roles (business_type_id, role_id, is_default)
SELECT bt.id, r.id, false
FROM public.business_types bt
CROSS JOIN public.roles r
WHERE bt.id = 'retail' AND r.name IN ('Cashier')
ON CONFLICT (business_type_id, role_id) DO NOTHING;