
-- Membership Plans table: fully editable pricing by business owner
CREATE TABLE public.gym_membership_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID REFERENCES public.custom_businesses(id),
  name TEXT NOT NULL,
  description TEXT,
  duration_type TEXT NOT NULL DEFAULT 'monthly', -- daily, weekly, monthly, quarterly, annual
  duration_days INTEGER NOT NULL DEFAULT 30,
  price NUMERIC NOT NULL DEFAULT 0,
  signup_fee NUMERIC NOT NULL DEFAULT 0,
  access_level TEXT NOT NULL DEFAULT 'basic', -- basic, premium, vip, class-only, off-peak
  includes_classes BOOLEAN NOT NULL DEFAULT false,
  includes_personal_training BOOLEAN NOT NULL DEFAULT false,
  guest_passes_per_month INTEGER NOT NULL DEFAULT 0,
  freeze_allowed BOOLEAN NOT NULL DEFAULT true,
  max_freeze_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on gym_membership_plans" ON public.gym_membership_plans FOR ALL USING (true) WITH CHECK (true);

-- Trainers table
CREATE TABLE public.gym_trainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID REFERENCES public.custom_businesses(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specializations TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  session_rate NUMERIC NOT NULL DEFAULT 0,
  bio TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive, on_leave
  hire_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on gym_trainers" ON public.gym_trainers FOR ALL USING (true) WITH CHECK (true);

-- PT Sessions table
CREATE TABLE public.gym_pt_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID REFERENCES public.custom_businesses(id),
  trainer_id UUID NOT NULL REFERENCES public.gym_trainers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  price NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_pt_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on gym_pt_sessions" ON public.gym_pt_sessions FOR ALL USING (true) WITH CHECK (true);

-- Register new features
INSERT INTO public.available_features (id, name, category, description, icon) VALUES
  ('membership-plans', 'Membership Plans', 'operations', 'Manage membership types and pricing', 'CreditCard'),
  ('trainer-management', 'Trainer Management', 'operations', 'Manage trainers and PT sessions', 'UserCheck'),
  ('visit-history', 'Visit History', 'analytics', 'Historical check-in analytics', 'History')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.business_type_features (business_type_id, feature_id, is_default) VALUES
  ('gym', 'membership-plans', true),
  ('gym', 'trainer-management', true),
  ('gym', 'visit-history', true)
ON CONFLICT DO NOTHING;
