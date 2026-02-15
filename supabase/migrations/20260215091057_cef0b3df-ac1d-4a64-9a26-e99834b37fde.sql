
-- Gym Classes table
CREATE TABLE public.gym_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id text NOT NULL,
  business_id uuid REFERENCES public.custom_businesses(id),
  name text NOT NULL,
  class_type text NOT NULL,
  instructor_name text,
  description text,
  day_of_week text NOT NULL,
  start_time time NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  capacity integer NOT NULL DEFAULT 20,
  registered_count integer NOT NULL DEFAULT 0,
  location text,
  status text NOT NULL DEFAULT 'scheduled',
  recurring boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on gym_classes"
ON public.gym_classes FOR ALL
USING (true) WITH CHECK (true);

CREATE TRIGGER update_gym_classes_updated_at
BEFORE UPDATE ON public.gym_classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gym Check-Ins table
CREATE TABLE public.gym_check_ins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id text NOT NULL,
  business_id uuid REFERENCES public.custom_businesses(id),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in_time timestamp with time zone NOT NULL DEFAULT now(),
  check_out_time timestamp with time zone,
  check_in_method text NOT NULL DEFAULT 'manual',
  zone text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on gym_check_ins"
ON public.gym_check_ins FOR ALL
USING (true) WITH CHECK (true);

-- Gym Class Registrations table
CREATE TABLE public.gym_class_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid NOT NULL REFERENCES public.gym_classes(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'registered',
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  attended boolean DEFAULT false,
  UNIQUE(class_id, member_id)
);

ALTER TABLE public.gym_class_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on gym_class_registrations"
ON public.gym_class_registrations FOR ALL
USING (true) WITH CHECK (true);

-- Gym Equipment table
CREATE TABLE public.gym_equipment (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id text NOT NULL,
  business_id uuid REFERENCES public.custom_businesses(id),
  name text NOT NULL,
  category text NOT NULL,
  brand text,
  model text,
  serial_number text,
  purchase_date date,
  warranty_expiry date,
  zone text,
  status text NOT NULL DEFAULT 'operational',
  condition text NOT NULL DEFAULT 'good',
  last_maintenance date,
  next_maintenance date,
  maintenance_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on gym_equipment"
ON public.gym_equipment FOR ALL
USING (true) WITH CHECK (true);

CREATE TRIGGER update_gym_equipment_updated_at
BEFORE UPDATE ON public.gym_equipment
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add feature IDs for new gym features
INSERT INTO public.available_features (id, name, description, category, icon)
VALUES 
  ('class-management', 'Class Management', 'Manage group fitness classes and schedules', 'operations', 'Calendar'),
  ('check-in-system', 'Check-In System', 'Member check-in and visit tracking', 'operations', 'ScanLine'),
  ('equipment-management', 'Equipment Management', 'Track gym equipment and maintenance', 'operations', 'Dumbbell')
ON CONFLICT (id) DO NOTHING;

-- Link new features to gym business type
INSERT INTO public.business_type_features (business_type_id, feature_id, is_default)
VALUES 
  ('gym', 'class-management', true),
  ('gym', 'check-in-system', true),
  ('gym', 'equipment-management', true)
ON CONFLICT DO NOTHING;
