
-- =====================================================
-- SALON MODULE: Extend stylists + add services/clients
-- =====================================================

-- 1. Extend existing stylists table with missing columns
ALTER TABLE public.stylists
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.custom_businesses(id),
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT NOT NULL DEFAULT 'junior',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 5.0,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT '{}';

-- Backfill first_name/last_name from name column if they are null
UPDATE public.stylists SET first_name = split_part(name, ' ', 1), last_name = NULLIF(split_part(name, ' ', 2), '') WHERE first_name IS NULL;

-- Make first_name NOT NULL after backfill
ALTER TABLE public.stylists ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE public.stylists ALTER COLUMN first_name SET DEFAULT '';
ALTER TABLE public.stylists ALTER COLUMN last_name SET DEFAULT '';

-- Enable RLS if not already
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists to avoid conflict
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'stylists' AND policyname = 'Allow all operations on stylists') THEN
    CREATE POLICY "Allow all operations on stylists" ON public.stylists FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 2. Salon services catalog
CREATE TABLE public.salon_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID REFERENCES public.custom_businesses(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Hair',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on salon_services" ON public.salon_services FOR ALL USING (true) WITH CHECK (true);

-- 3. Salon clients
CREATE TABLE public.salon_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID REFERENCES public.custom_businesses(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  preferred_stylist_id UUID REFERENCES public.stylists(id),
  allergies TEXT,
  notes TEXT,
  visit_count INTEGER DEFAULT 0,
  last_visit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.salon_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on salon_clients" ON public.salon_clients FOR ALL USING (true) WITH CHECK (true);

-- 4. Add business_id to existing appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.custom_businesses(id);

-- 5. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_salon_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_stylists_updated_at ON public.stylists;
CREATE TRIGGER update_stylists_updated_at
  BEFORE UPDATE ON public.stylists
  FOR EACH ROW EXECUTE FUNCTION public.update_salon_updated_at();

CREATE TRIGGER update_salon_services_updated_at
  BEFORE UPDATE ON public.salon_services
  FOR EACH ROW EXECUTE FUNCTION public.update_salon_updated_at();

CREATE TRIGGER update_salon_clients_updated_at
  BEFORE UPDATE ON public.salon_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_salon_updated_at();
