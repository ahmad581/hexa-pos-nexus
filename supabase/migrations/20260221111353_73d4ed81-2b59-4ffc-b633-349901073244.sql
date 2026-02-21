
-- Salon POS transactions table
CREATE TABLE public.salon_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID,
  appointment_id UUID REFERENCES public.appointments(id),
  client_name TEXT NOT NULL,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  tip_amount NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_status TEXT NOT NULL DEFAULT 'completed',
  stylist_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.salon_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on salon_transactions"
ON public.salon_transactions FOR ALL USING (true) WITH CHECK (true);

-- Salon packages/memberships table
CREATE TABLE public.salon_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  package_type TEXT NOT NULL DEFAULT 'bundle',
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_sessions INTEGER DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  validity_days INTEGER DEFAULT 90,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.salon_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on salon_packages"
ON public.salon_packages FOR ALL USING (true) WITH CHECK (true);

-- Client package subscriptions
CREATE TABLE public.salon_client_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID,
  client_id UUID REFERENCES public.salon_clients(id),
  package_id UUID REFERENCES public.salon_packages(id),
  sessions_remaining INTEGER NOT NULL DEFAULT 0,
  sessions_used INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.salon_client_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on salon_client_packages"
ON public.salon_client_packages FOR ALL USING (true) WITH CHECK (true);

-- Add reminder columns to appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_salon_transactions_updated_at
BEFORE UPDATE ON public.salon_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salon_packages_updated_at
BEFORE UPDATE ON public.salon_packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salon_client_packages_updated_at
BEFORE UPDATE ON public.salon_client_packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
