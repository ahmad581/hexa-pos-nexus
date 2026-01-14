-- Create branch_settings table to store settings per branch
CREATE TABLE public.branch_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id text NOT NULL UNIQUE,
  menu_design text NOT NULL DEFAULT 'modern',
  language text NOT NULL DEFAULT 'en',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  CONSTRAINT branch_settings_menu_design_check CHECK (menu_design IN ('modern', 'simple')),
  CONSTRAINT branch_settings_language_check CHECK (language IN ('en', 'ar'))
);

-- Enable RLS
ALTER TABLE public.branch_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view branch settings (employees need to read their branch settings)
CREATE POLICY "Anyone can view branch settings"
ON public.branch_settings
FOR SELECT
USING (true);

-- Only managers and above can update branch settings
CREATE POLICY "Managers can manage branch settings"
ON public.branch_settings
FOR ALL
USING (
  is_super_admin(auth.uid())
  OR has_role(auth.uid(), 'SystemMaster')
  OR has_role(auth.uid(), 'SuperManager')
  OR has_role(auth.uid(), 'Manager')
)
WITH CHECK (
  is_super_admin(auth.uid())
  OR has_role(auth.uid(), 'SystemMaster')
  OR has_role(auth.uid(), 'SuperManager')
  OR has_role(auth.uid(), 'Manager')
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_branch_settings_updated_at
BEFORE UPDATE ON public.branch_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();