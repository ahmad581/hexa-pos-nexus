-- ============================================
-- PHASE 1: Notification System Database Setup
-- ============================================

-- 1. Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.custom_businesses(id) ON DELETE CASCADE,
  branch_id text,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Create notification_recipients table (per-user read status)
CREATE TABLE public.notification_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- 3. Create indexes for performance
CREATE INDEX idx_notifications_business_id ON public.notifications(business_id);
CREATE INDEX idx_notifications_branch_id ON public.notifications(branch_id);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notification_recipients_user_id ON public.notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_is_read ON public.notification_recipients(is_read) WHERE is_read = false;

-- 4. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- 5. Security definer function to check if user is manager for a business
CREATE OR REPLACE FUNCTION public.is_manager_for_business(_user_id uuid, _business_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = _user_id
      AND p.business_id = _business_id
      AND p.is_active = true
      AND (
        p.primary_role IN ('Manager', 'SuperManager')
        OR p.is_super_admin = true
      )
  )
$$;

-- 6. Function to get manager/supermanager user_ids for a business
CREATE OR REPLACE FUNCTION public.get_business_managers(_business_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id
  FROM public.profiles p
  WHERE p.business_id = _business_id
    AND p.is_active = true
    AND p.user_id IS NOT NULL
    AND (
      p.primary_role IN ('Manager', 'SuperManager')
      OR p.is_super_admin = true
    )
$$;

-- 7. Main function to create a notification and notify all managers
CREATE OR REPLACE FUNCTION public.create_notification(
  _business_id uuid,
  _branch_id text,
  _type text,
  _title text,
  _message text,
  _severity text DEFAULT 'info',
  _metadata jsonb DEFAULT '{}'::jsonb,
  _created_by uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_id uuid;
  _manager_id uuid;
BEGIN
  -- Insert the notification
  INSERT INTO public.notifications (
    business_id, branch_id, type, title, message, severity, metadata, created_by
  ) VALUES (
    _business_id, _branch_id, _type, _title, _message, _severity, _metadata, _created_by
  )
  RETURNING id INTO _notification_id;
  
  -- Create recipient entries for all managers of this business
  FOR _manager_id IN SELECT * FROM public.get_business_managers(_business_id)
  LOOP
    INSERT INTO public.notification_recipients (notification_id, user_id)
    VALUES (_notification_id, _manager_id)
    ON CONFLICT (notification_id, user_id) DO NOTHING;
  END LOOP;
  
  RETURN _notification_id;
END;
$$;

-- 8. RLS Policies for notifications table
-- Users can view notifications for their business if they're a manager
CREATE POLICY "Managers can view business notifications"
ON public.notifications
FOR SELECT
USING (
  public.is_manager_for_business(auth.uid(), business_id)
  OR is_super_admin(auth.uid())
);

-- Only system can insert (via security definer functions)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (false); -- No direct inserts allowed, use create_notification function

-- SuperManagers can delete old notifications
CREATE POLICY "SuperManagers can delete notifications"
ON public.notifications
FOR DELETE
USING (
  has_role(auth.uid(), 'SuperManager'::app_role)
  OR is_super_admin(auth.uid())
);

-- 9. RLS Policies for notification_recipients table
-- Users can view their own recipient records
CREATE POLICY "Users can view own notification recipients"
ON public.notification_recipients
FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own records (mark as read)
CREATE POLICY "Users can mark own notifications as read"
ON public.notification_recipients
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- System insert only
CREATE POLICY "System can insert notification recipients"
ON public.notification_recipients
FOR INSERT
WITH CHECK (false);

-- 10. Enable realtime for notification_recipients
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_recipients;