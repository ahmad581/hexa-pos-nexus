
-- Membership payments/billing table
CREATE TABLE public.gym_membership_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  business_id UUID REFERENCES public.custom_businesses(id),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.gym_membership_plans(id),
  payment_type TEXT NOT NULL DEFAULT 'membership', -- membership, signup_fee, pt_session, class_package, other
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash', -- cash, card, bank_transfer, online
  status TEXT NOT NULL DEFAULT 'completed', -- completed, pending, failed, refunded
  notes TEXT,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_membership_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on gym_membership_payments" ON public.gym_membership_payments FOR ALL USING (true) WITH CHECK (true);

-- Membership freeze tracking
CREATE TABLE public.gym_membership_freezes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  freeze_start DATE NOT NULL DEFAULT CURRENT_DATE,
  freeze_end DATE,
  reason TEXT,
  max_days_allowed INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active', -- active, ended, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gym_membership_freezes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on gym_membership_freezes" ON public.gym_membership_freezes FOR ALL USING (true) WITH CHECK (true);

-- Add QR code column to members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS qr_code TEXT;

-- Register new features
INSERT INTO public.available_features (id, name, category, description, icon)
VALUES 
  ('billing-payments', 'Billing & Payments', 'Finance', 'Track membership payments and billing history', 'CreditCard'),
  ('member-engagement', 'Member Engagement', 'Communication', 'Member notifications, reminders, and engagement tools', 'Bell'),
  ('qr-checkin', 'QR Code Check-In', 'Operations', 'QR code based member check-in system', 'QrCode')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.business_type_features (business_type_id, feature_id, is_default)
VALUES 
  ('gym', 'billing-payments', true),
  ('gym', 'member-engagement', true),
  ('gym', 'qr-checkin', true)
ON CONFLICT DO NOTHING;
