-- =====================================================
-- TELEPHONY PROVIDER ABSTRACTION SCHEMA
-- =====================================================

-- Telephony provider configurations per business
CREATE TABLE public.telephony_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES custom_businesses(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('twilio', 'sip', 'pbx', 'mock')),
  display_name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  webhook_mode TEXT CHECK (webhook_mode IN ('http', 'ami', 'both')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(business_id, provider_type, display_name)
);

-- Multiple phone numbers per business with provider association
CREATE TABLE public.business_phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES custom_businesses(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES telephony_providers(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  display_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  capabilities TEXT[] NOT NULL DEFAULT ARRAY['inbound', 'outbound'],
  external_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(business_id, phone_number)
);

-- Unified call event log for debugging and analytics
CREATE TABLE public.call_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_queue_id UUID REFERENCES call_queue(id) ON DELETE SET NULL,
  call_history_id UUID REFERENCES call_history(id) ON DELETE SET NULL,
  business_id UUID NOT NULL REFERENCES custom_businesses(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  external_call_id TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- SCHEMA MODIFICATIONS TO EXISTING TABLES
-- =====================================================

-- Add provider-agnostic columns to call_queue
ALTER TABLE public.call_queue
  ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'twilio',
  ADD COLUMN IF NOT EXISTS external_call_id TEXT,
  ADD COLUMN IF NOT EXISTS phone_number_id UUID REFERENCES business_phone_numbers(id),
  ADD COLUMN IF NOT EXISTS original_caller_id TEXT;

-- Create index for external_call_id lookups
CREATE INDEX IF NOT EXISTS idx_call_queue_external_call_id 
  ON public.call_queue(external_call_id) WHERE external_call_id IS NOT NULL;

-- Create index for provider_type
CREATE INDEX IF NOT EXISTS idx_call_queue_provider_type 
  ON public.call_queue(provider_type);

-- Add provider-agnostic columns to call_history
ALTER TABLE public.call_history
  ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'twilio',
  ADD COLUMN IF NOT EXISTS external_call_id TEXT,
  ADD COLUMN IF NOT EXISTS phone_number_id UUID REFERENCES business_phone_numbers(id),
  ADD COLUMN IF NOT EXISTS original_caller_id TEXT;

-- Create indexes for call_history
CREATE INDEX IF NOT EXISTS idx_call_history_external_call_id 
  ON public.call_history(external_call_id) WHERE external_call_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_call_history_provider_type 
  ON public.call_history(provider_type);

-- Create indexes for call_events
CREATE INDEX IF NOT EXISTS idx_call_events_business_id ON public.call_events(business_id);
CREATE INDEX IF NOT EXISTS idx_call_events_call_queue_id ON public.call_events(call_queue_id);
CREATE INDEX IF NOT EXISTS idx_call_events_external_call_id ON public.call_events(external_call_id);
CREATE INDEX IF NOT EXISTS idx_call_events_created_at ON public.call_events(created_at DESC);

-- =====================================================
-- MIGRATE EXISTING DATA
-- =====================================================

-- Migrate existing call_queue data to use new columns
UPDATE public.call_queue SET 
  provider_type = 'twilio',
  external_call_id = twilio_call_sid
WHERE twilio_call_sid IS NOT NULL AND external_call_id IS NULL;

-- Migrate existing call_center_numbers to new schema
-- First create telephony_providers entries for existing businesses with call center numbers
INSERT INTO telephony_providers (business_id, provider_type, display_name, is_active, is_default, config)
SELECT DISTINCT 
  ccn.business_id, 
  'twilio', 
  'Twilio (Primary)', 
  true, 
  true,
  '{}'::jsonb
FROM call_center_numbers ccn
WHERE ccn.business_id IS NOT NULL
ON CONFLICT (business_id, provider_type, display_name) DO NOTHING;

-- Then create business_phone_numbers entries
INSERT INTO business_phone_numbers (business_id, provider_id, phone_number, display_name, external_id, is_default, is_active)
SELECT 
  ccn.business_id,
  tp.id,
  ccn.phone_number,
  'Primary Number',
  ccn.twilio_sid,
  true,
  ccn.is_active
FROM call_center_numbers ccn
JOIN telephony_providers tp ON tp.business_id = ccn.business_id AND tp.provider_type = 'twilio'
ON CONFLICT (business_id, phone_number) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE public.telephony_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_events ENABLE ROW LEVEL SECURITY;

-- Telephony providers policies
CREATE POLICY "Users can view their business telephony providers"
  ON public.telephony_providers FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "SuperManagers can manage telephony providers"
  ON public.telephony_providers FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM profiles 
      WHERE user_id = auth.uid() AND primary_role IN ('SuperManager', 'SystemMaster')
    )
  );

-- Business phone numbers policies
CREATE POLICY "Users can view their business phone numbers"
  ON public.business_phone_numbers FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "SuperManagers can manage phone numbers"
  ON public.business_phone_numbers FOR ALL
  USING (
    business_id IN (
      SELECT business_id FROM profiles 
      WHERE user_id = auth.uid() AND primary_role IN ('SuperManager', 'SystemMaster')
    )
  );

-- Call events policies
CREATE POLICY "Users can view their business call events"
  ON public.call_events FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert call events"
  ON public.call_events FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

-- Create trigger for telephony_providers
CREATE TRIGGER update_telephony_providers_updated_at
  BEFORE UPDATE ON public.telephony_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for business_phone_numbers
CREATE TRIGGER update_business_phone_numbers_updated_at
  BEFORE UPDATE ON public.business_phone_numbers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();