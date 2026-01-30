-- Call Center Phone Numbers for Businesses
CREATE TABLE public.call_center_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL UNIQUE,
  twilio_sid TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Employee Extensions for Call Center Employees
CREATE TABLE public.employee_extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  extension_number TEXT NOT NULL,
  twilio_sid TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id, extension_number)
);

-- Call Queue for incoming calls
CREATE TABLE public.call_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  call_center_number_id UUID REFERENCES public.call_center_numbers(id) ON DELETE SET NULL,
  caller_phone TEXT NOT NULL,
  caller_name TEXT,
  caller_address TEXT,
  twilio_call_sid TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'queued', 'answered', 'on_hold', 'transferred', 'completed', 'missed', 'abandoned')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  call_type TEXT DEFAULT 'general' CHECK (call_type IN ('sales', 'support', 'appointment', 'complaint', 'general', 'internal')),
  answered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  answered_at TIMESTAMP WITH TIME ZONE,
  transferred_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  transferred_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  queue_position INTEGER,
  wait_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Call History/Logs
CREATE TABLE public.call_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  call_queue_id UUID REFERENCES public.call_queue(id) ON DELETE SET NULL,
  caller_phone TEXT NOT NULL,
  caller_name TEXT,
  callee_phone TEXT,
  call_type TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound', 'outbound', 'internal')),
  status TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  handled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_center_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_center_numbers
CREATE POLICY "Super admins can manage call center numbers"
ON public.call_center_numbers FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Business owners can view their call center numbers"
ON public.call_center_numbers FOR SELECT
USING (business_id IN (
  SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
) OR business_id IN (
  SELECT business_id FROM public.profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
));

-- RLS Policies for employee_extensions
CREATE POLICY "Super admins can manage employee extensions"
ON public.employee_extensions FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view extensions in their business"
ON public.employee_extensions FOR SELECT
USING (business_id IN (
  SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
) OR business_id IN (
  SELECT business_id FROM public.profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
));

CREATE POLICY "Users can update their own extension"
ON public.employee_extensions FOR UPDATE
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for call_queue
CREATE POLICY "Super admins can manage call queue"
ON public.call_queue FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Call center employees can view their business calls"
ON public.call_queue FOR SELECT
USING (business_id IN (
  SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
) OR business_id IN (
  SELECT business_id FROM public.profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
));

CREATE POLICY "Call center employees can update calls"
ON public.call_queue FOR UPDATE
USING (business_id IN (
  SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
) OR business_id IN (
  SELECT business_id FROM public.profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
));

CREATE POLICY "Call center employees can insert calls"
ON public.call_queue FOR INSERT
WITH CHECK (business_id IN (
  SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
) OR business_id IN (
  SELECT business_id FROM public.profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
) OR is_super_admin(auth.uid()));

-- RLS Policies for call_history
CREATE POLICY "Super admins can manage call history"
ON public.call_history FOR ALL
USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view their business call history"
ON public.call_history FOR SELECT
USING (business_id IN (
  SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
) OR business_id IN (
  SELECT business_id FROM public.profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
));

CREATE POLICY "Users can insert call history"
ON public.call_history FOR INSERT
WITH CHECK (business_id IN (
  SELECT id FROM public.custom_businesses WHERE user_id = auth.uid()
) OR business_id IN (
  SELECT business_id FROM public.profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL
) OR is_super_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_call_center_numbers_updated_at
  BEFORE UPDATE ON public.call_center_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_extensions_updated_at
  BEFORE UPDATE ON public.employee_extensions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_call_queue_updated_at
  BEFORE UPDATE ON public.call_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for call_queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_queue;