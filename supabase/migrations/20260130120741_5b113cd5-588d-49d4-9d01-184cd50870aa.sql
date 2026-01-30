-- Extend branch_settings table with all settings fields
ALTER TABLE public.branch_settings
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'EST',
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 8.25,
ADD COLUMN IF NOT EXISTS auto_backup BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS analytics_tracking BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS receipt_footer TEXT DEFAULT 'Thank you for your visit!',
ADD COLUMN IF NOT EXISTS printers JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain printers structure
COMMENT ON COLUMN public.branch_settings.printers IS 'Array of printer configurations: [{name, type, connection_type, ip_address, port, use_for_receipts, use_for_kitchen, use_for_reports, is_default}]';