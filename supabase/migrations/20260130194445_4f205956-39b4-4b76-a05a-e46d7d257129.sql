-- Create a table to track call center employee login sessions
CREATE TABLE public.call_center_login_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logout_time TIMESTAMP WITH TIME ZONE,
  session_duration_seconds INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_center_login_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.call_center_login_sessions
FOR SELECT
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions"
ON public.call_center_login_sessions
FOR INSERT
WITH CHECK (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
ON public.call_center_login_sessions
FOR UPDATE
USING (
  profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Managers can view all sessions in their business
CREATE POLICY "Managers can view business sessions"
ON public.call_center_login_sessions
FOR SELECT
USING (
  business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
  OR is_super_admin(auth.uid())
  OR has_role(auth.uid(), 'SystemMaster')
  OR has_role(auth.uid(), 'SuperManager')
  OR has_role(auth.uid(), 'Manager')
);

-- Super admins can manage all sessions
CREATE POLICY "Super admins can manage all sessions"
ON public.call_center_login_sessions
FOR ALL
USING (is_super_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_call_center_login_sessions_updated_at
BEFORE UPDATE ON public.call_center_login_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE call_center_login_sessions;