-- Create pharmacy_patients table for patient profiles
CREATE TABLE public.pharmacy_patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  allergies TEXT[],
  conditions TEXT[],
  insurance_provider TEXT,
  insurance_id TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pharmacy_patients
ALTER TABLE public.pharmacy_patients ENABLE ROW LEVEL SECURITY;

-- RLS policy for pharmacy_patients
CREATE POLICY "Allow all operations on pharmacy_patients"
ON public.pharmacy_patients
FOR ALL
USING (true)
WITH CHECK (true);

-- Add new columns to prescriptions table
ALTER TABLE public.prescriptions 
  ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES public.pharmacy_patients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS prescription_type TEXT DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS refills_remaining INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refills_total INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_controlled_substance BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS schedule TEXT,
  ADD COLUMN IF NOT EXISTS verified_by UUID,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS dispensed_by UUID,
  ADD COLUMN IF NOT EXISTS dispensed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS copay_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS insurance_billed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.custom_businesses(id) ON DELETE CASCADE;

-- Create pharmacy_checkout table for tracking prescription pickups
CREATE TABLE public.pharmacy_checkout (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.pharmacy_patients(id) ON DELETE SET NULL,
  prescription_ids UUID[] NOT NULL DEFAULT '{}',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  insurance_covered DECIMAL(10,2) NOT NULL DEFAULT 0,
  copay DECIMAL(10,2) NOT NULL DEFAULT 0,
  otc_items_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  counseling_acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pharmacy_checkout
ALTER TABLE public.pharmacy_checkout ENABLE ROW LEVEL SECURITY;

-- RLS policy for pharmacy_checkout
CREATE POLICY "Allow all operations on pharmacy_checkout"
ON public.pharmacy_checkout
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at on pharmacy_patients
CREATE TRIGGER update_pharmacy_patients_updated_at
BEFORE UPDATE ON public.pharmacy_patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_pharmacy_patients_branch_id ON public.pharmacy_patients(branch_id);
CREATE INDEX idx_pharmacy_patients_business_id ON public.pharmacy_patients(business_id);
CREATE INDEX idx_pharmacy_patients_phone ON public.pharmacy_patients(phone);
CREATE INDEX idx_pharmacy_checkout_branch_id ON public.pharmacy_checkout(branch_id);
CREATE INDEX idx_pharmacy_checkout_patient_id ON public.pharmacy_checkout(patient_id);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_business_id ON public.prescriptions(business_id);