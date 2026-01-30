-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('branch-backups', 'branch-backups', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the backup bucket
CREATE POLICY "Managers can view their branch backups"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'branch-backups' 
  AND (
    is_super_admin(auth.uid()) 
    OR has_role(auth.uid(), 'SystemMaster'::app_role)
    OR has_role(auth.uid(), 'SuperManager'::app_role)
    OR has_role(auth.uid(), 'Manager'::app_role)
  )
);

CREATE POLICY "System can upload backups"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'branch-backups'
  AND (
    is_super_admin(auth.uid()) 
    OR has_role(auth.uid(), 'SystemMaster'::app_role)
    OR has_role(auth.uid(), 'SuperManager'::app_role)
    OR has_role(auth.uid(), 'Manager'::app_role)
  )
);

CREATE POLICY "Managers can delete old backups"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'branch-backups'
  AND (
    is_super_admin(auth.uid()) 
    OR has_role(auth.uid(), 'SystemMaster'::app_role)
    OR has_role(auth.uid(), 'SuperManager'::app_role)
    OR has_role(auth.uid(), 'Manager'::app_role)
  )
);

-- Create table to track backup history
CREATE TABLE IF NOT EXISTS public.backup_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'manual', -- 'manual' or 'automatic'
  file_path TEXT NOT NULL,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS on backup_history
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for backup_history
CREATE POLICY "Managers can view backup history"
ON public.backup_history FOR SELECT
USING (
  is_super_admin(auth.uid()) 
  OR has_role(auth.uid(), 'SystemMaster'::app_role)
  OR has_role(auth.uid(), 'SuperManager'::app_role)
  OR has_role(auth.uid(), 'Manager'::app_role)
);

CREATE POLICY "Managers can insert backup history"
ON public.backup_history FOR INSERT
WITH CHECK (
  is_super_admin(auth.uid()) 
  OR has_role(auth.uid(), 'SystemMaster'::app_role)
  OR has_role(auth.uid(), 'SuperManager'::app_role)
  OR has_role(auth.uid(), 'Manager'::app_role)
);