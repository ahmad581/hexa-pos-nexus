-- Create loan settings table for business/branch configuration
CREATE TABLE public.loan_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  max_loan_amount NUMERIC NOT NULL DEFAULT 50000,
  min_loan_amount NUMERIC NOT NULL DEFAULT 1000,
  max_payment_period_months INTEGER NOT NULL DEFAULT 24,
  min_payment_period_months INTEGER NOT NULL DEFAULT 1,
  max_monthly_payment_percentage NUMERIC NOT NULL DEFAULT 30,
  interest_rate_percentage NUMERIC NOT NULL DEFAULT 0,
  require_approval BOOLEAN NOT NULL DEFAULT true,
  min_employment_months INTEGER NOT NULL DEFAULT 3,
  max_active_loans INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee loans table
CREATE TABLE public.employee_loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL,
  loan_amount NUMERIC NOT NULL,
  payment_period_months INTEGER NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_repayment NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  start_date DATE,
  end_date DATE,
  remaining_amount NUMERIC,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  next_payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loan payments table to track individual payments
CREATE TABLE public.loan_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.employee_loans(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL,
  payment_amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'salary_deduction',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loan_settings
CREATE POLICY "Allow all operations on loan_settings" 
ON public.loan_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for employee_loans
CREATE POLICY "Allow all operations on employee_loans" 
ON public.employee_loans 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for loan_payments
CREATE POLICY "Allow all operations on loan_payments" 
ON public.loan_payments 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_employee_loans_employee_id ON public.employee_loans(employee_id);
CREATE INDEX idx_employee_loans_branch_id ON public.employee_loans(branch_id);
CREATE INDEX idx_employee_loans_status ON public.employee_loans(status);
CREATE INDEX idx_loan_payments_loan_id ON public.loan_payments(loan_id);
CREATE INDEX idx_loan_settings_branch_id ON public.loan_settings(branch_id);

-- Trigger for updated_at
CREATE TRIGGER update_loan_settings_updated_at
BEFORE UPDATE ON public.loan_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_loans_updated_at
BEFORE UPDATE ON public.employee_loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();