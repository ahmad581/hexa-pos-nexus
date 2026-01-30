-- ============================================
-- PHASE 3: Notification Triggers for Events
-- ============================================

-- 1. Trigger for new loan requests
CREATE OR REPLACE FUNCTION public.notify_loan_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business_id uuid;
  _employee_name text;
BEGIN
  -- Only notify on pending status (new requests)
  IF NEW.status = 'pending' THEN
    -- Get employee name and business_id from branch
    SELECT 
      e.first_name || ' ' || e.last_name,
      b.business_id
    INTO _employee_name, _business_id
    FROM public.employees e
    JOIN public.branches b ON e.branch_id = b.id
    WHERE e.id = NEW.employee_id;
    
    IF _business_id IS NOT NULL THEN
      PERFORM public.create_notification(
        _business_id,
        NEW.branch_id,
        'loan_request',
        'New Loan Request',
        format('%s has requested a loan of $%s', _employee_name, NEW.loan_amount),
        'warning',
        jsonb_build_object(
          'employee_id', NEW.employee_id,
          'loan_id', NEW.id,
          'amount', NEW.loan_amount,
          'period_months', NEW.payment_period_months
        ),
        NULL
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_loan_request
AFTER INSERT ON public.employee_loans
FOR EACH ROW
EXECUTE FUNCTION public.notify_loan_request();

-- 2. Trigger for backup status
CREATE OR REPLACE FUNCTION public.notify_backup_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business_id uuid;
  _severity text;
  _title text;
  _message text;
BEGIN
  -- Get business_id from branch
  SELECT business_id INTO _business_id
  FROM public.branches
  WHERE id = NEW.branch_id;
  
  IF _business_id IS NOT NULL THEN
    IF NEW.status = 'completed' THEN
      _severity := 'info';
      _title := 'Backup Completed';
      _message := format('Backup completed successfully (%s)', NEW.backup_type);
    ELSIF NEW.status = 'failed' THEN
      _severity := 'critical';
      _title := 'Backup Failed';
      _message := format('Backup failed for %s backup', NEW.backup_type);
    ELSE
      RETURN NEW;
    END IF;
    
    PERFORM public.create_notification(
      _business_id,
      NEW.branch_id,
      CASE WHEN NEW.status = 'completed' THEN 'backup_completed' ELSE 'backup_failed' END,
      _title,
      _message,
      _severity,
      jsonb_build_object(
        'backup_id', NEW.id,
        'backup_type', NEW.backup_type,
        'file_path', NEW.file_path,
        'file_size', NEW.file_size
      ),
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_backup_status
AFTER INSERT ON public.backup_history
FOR EACH ROW
EXECUTE FUNCTION public.notify_backup_status();

-- 3. Trigger for inventory status changes
CREATE OR REPLACE FUNCTION public.notify_inventory_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_type text;
  _severity text;
  _title text;
  _message text;
BEGIN
  -- Only notify when status changes to a critical state
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'Out of Stock' THEN
        _notification_type := 'stock_out';
        _severity := 'critical';
        _title := 'Item Out of Stock';
        _message := format('%s is now out of stock', NEW.name);
      WHEN 'Low Stock' THEN
        _notification_type := 'stock_low';
        _severity := 'warning';
        _title := 'Low Stock Alert';
        _message := format('%s is running low (%s units remaining)', NEW.name, NEW.current_stock);
      WHEN 'Expired' THEN
        _notification_type := 'stock_expired';
        _severity := 'critical';
        _title := 'Item Expired';
        _message := format('%s has expired', NEW.name);
      ELSE
        RETURN NEW;
    END CASE;
    
    IF NEW.business_id IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.business_id,
        NEW.branch_id,
        _notification_type,
        _title,
        _message,
        _severity,
        jsonb_build_object(
          'item_id', NEW.id,
          'item_name', NEW.name,
          'sku', NEW.sku,
          'current_stock', NEW.current_stock,
          'min_stock', NEW.min_stock,
          'warehouse_id', NEW.warehouse_id
        ),
        NULL
      );
    END IF;
  END IF;
  
  -- Check for expiring items (within 7 days)
  IF NEW.expiry_date IS NOT NULL 
     AND NEW.expiry_date > now() 
     AND NEW.expiry_date <= (now() + interval '7 days')
     AND (OLD.expiry_date IS NULL OR OLD.expiry_date > (now() + interval '7 days'))
  THEN
    IF NEW.business_id IS NOT NULL THEN
      PERFORM public.create_notification(
        NEW.business_id,
        NEW.branch_id,
        'stock_expiring',
        'Item Expiring Soon',
        format('%s will expire on %s', NEW.name, to_char(NEW.expiry_date, 'YYYY-MM-DD')),
        'warning',
        jsonb_build_object(
          'item_id', NEW.id,
          'item_name', NEW.name,
          'expiry_date', NEW.expiry_date
        ),
        NULL
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_inventory_status
AFTER UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.notify_inventory_status();

-- 4. Trigger for new inventory requests
CREATE OR REPLACE FUNCTION public.notify_inventory_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _item_name text;
BEGIN
  -- Get item name
  SELECT name INTO _item_name
  FROM public.inventory_items
  WHERE id = NEW.inventory_item_id;
  
  IF NEW.business_id IS NOT NULL THEN
    PERFORM public.create_notification(
      NEW.business_id,
      NEW.branch_id,
      'inventory_request',
      'New Stock Request',
      format('Request for %s units of %s', NEW.requested_quantity, COALESCE(_item_name, 'unknown item')),
      'info',
      jsonb_build_object(
        'request_id', NEW.id,
        'item_id', NEW.inventory_item_id,
        'item_name', _item_name,
        'quantity', NEW.requested_quantity,
        'warehouse_id', NEW.warehouse_id
      ),
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_inventory_request
AFTER INSERT ON public.inventory_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_inventory_request();

-- 5. Order anomaly detection - create audit table first
CREATE TABLE IF NOT EXISTS public.order_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  branch_id text NOT NULL,
  business_id uuid,
  action_type text NOT NULL CHECK (action_type IN ('update', 'delete')),
  performed_by text,
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  old_data jsonb,
  new_data jsonb
);

CREATE INDEX idx_order_audit_performed_at ON public.order_audit_log(performed_at DESC);
CREATE INDEX idx_order_audit_performed_by ON public.order_audit_log(performed_by);

ALTER TABLE public.order_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view order audit logs"
ON public.order_audit_log
FOR SELECT
USING (
  is_super_admin(auth.uid())
  OR has_role(auth.uid(), 'Manager'::app_role)
  OR has_role(auth.uid(), 'SuperManager'::app_role)
);

-- Function to check for order anomalies
CREATE OR REPLACE FUNCTION public.check_order_anomaly()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _modification_count integer;
  _business_id uuid;
  _threshold integer := 10; -- configurable threshold
BEGIN
  -- Get business_id from branch
  SELECT business_id INTO _business_id
  FROM public.branches
  WHERE id = NEW.branch_id;
  
  -- Count modifications by this user in the last hour
  SELECT COUNT(*) INTO _modification_count
  FROM public.order_audit_log
  WHERE performed_by = NEW.performed_by
    AND performed_at > (now() - interval '1 hour')
    AND branch_id = NEW.branch_id;
  
  -- Check if threshold exceeded (including this new entry)
  IF _modification_count >= _threshold AND _business_id IS NOT NULL THEN
    -- Check if we already notified recently (within last hour)
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications
      WHERE business_id = _business_id
        AND type = 'order_anomaly'
        AND created_at > (now() - interval '1 hour')
        AND metadata->>'performed_by' = NEW.performed_by
    ) THEN
      PERFORM public.create_notification(
        _business_id,
        NEW.branch_id,
        'order_anomaly',
        'Unusual Order Activity Detected',
        format('User has modified %s orders in the last hour', _modification_count),
        'critical',
        jsonb_build_object(
          'performed_by', NEW.performed_by,
          'modification_count', _modification_count,
          'time_window', '1 hour'
        ),
        NULL
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_check_order_anomaly
AFTER INSERT ON public.order_audit_log
FOR EACH ROW
EXECUTE FUNCTION public.check_order_anomaly();

-- 6. Trigger to log order modifications
CREATE OR REPLACE FUNCTION public.log_order_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _business_id uuid;
BEGIN
  -- Get business_id from branch
  SELECT business_id INTO _business_id
  FROM public.branches
  WHERE id = COALESCE(NEW.branch_id, OLD.branch_id);
  
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.order_audit_log (
      order_id, branch_id, business_id, action_type, 
      performed_by, old_data, new_data
    ) VALUES (
      NEW.id, NEW.branch_id, _business_id, 'update',
      current_setting('request.jwt.claims', true)::json->>'email',
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.order_audit_log (
      order_id, branch_id, business_id, action_type,
      performed_by, old_data
    ) VALUES (
      OLD.id, OLD.branch_id, _business_id, 'delete',
      current_setting('request.jwt.claims', true)::json->>'email',
      to_jsonb(OLD)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_log_order_modification
AFTER UPDATE OR DELETE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_modification();