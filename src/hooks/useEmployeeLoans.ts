import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LoanSettings {
  id: string;
  branch_id: string;
  max_loan_amount: number;
  min_loan_amount: number;
  max_payment_period_months: number;
  min_payment_period_months: number;
  max_monthly_payment_percentage: number;
  interest_rate_percentage: number;
  require_approval: boolean;
  min_employment_months: number;
  max_active_loans: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeLoan {
  id: string;
  employee_id: string;
  branch_id: string;
  loan_amount: number;
  payment_period_months: number;
  monthly_payment: number;
  total_repayment: number;
  interest_rate: number;
  reason: string | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  start_date: string | null;
  end_date: string | null;
  remaining_amount: number | null;
  paid_amount: number;
  next_payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  employee_id: string;
  branch_id: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export const useEmployeeLoans = (branchId: string) => {
  const queryClient = useQueryClient();

  // Fetch loan settings for a branch
  const { data: loanSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['loan-settings', branchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loan_settings')
        .select('*')
        .eq('branch_id', branchId)
        .maybeSingle();

      if (error) throw error;
      return data as LoanSettings | null;
    },
    enabled: !!branchId,
  });

  // Fetch all loans for a branch
  const { data: loans, isLoading: isLoadingLoans } = useQuery({
    queryKey: ['employee-loans', branchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EmployeeLoan[];
    },
    enabled: !!branchId,
  });

  // Fetch loans for a specific employee
  const getEmployeeLoans = async (employeeId: string) => {
    const { data, error } = await supabase
      .from('employee_loans')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as EmployeeLoan[];
  };

  // Create or update loan settings
  const saveLoanSettings = useMutation({
    mutationFn: async (settings: Partial<LoanSettings> & { branch_id: string }) => {
      const { data: existing } = await supabase
        .from('loan_settings')
        .select('id')
        .eq('branch_id', settings.branch_id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('loan_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('loan_settings')
          .insert(settings)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loan-settings', branchId] });
      toast.success('Loan settings saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save loan settings: ' + error.message);
    },
  });

  // Apply for a loan
  const applyForLoan = useMutation({
    mutationFn: async (loan: Omit<EmployeeLoan, 'id' | 'created_at' | 'updated_at' | 'approved_by' | 'approved_at' | 'rejected_reason' | 'start_date' | 'end_date' | 'next_payment_date' | 'paid_amount'>) => {
      const { data, error } = await supabase
        .from('employee_loans')
        .insert({
          ...loan,
          remaining_amount: loan.total_repayment,
          paid_amount: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans', branchId] });
      toast.success('Loan application submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit loan application: ' + error.message);
    },
  });

  // Approve a loan
  const approveLoan = useMutation({
    mutationFn: async ({ loanId, approvedBy }: { loanId: string; approvedBy: string }) => {
      const startDate = new Date();
      const { data: loan } = await supabase
        .from('employee_loans')
        .select('payment_period_months')
        .eq('id', loanId)
        .single();

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (loan?.payment_period_months || 1));

      const nextPaymentDate = new Date(startDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

      const { data, error } = await supabase
        .from('employee_loans')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          next_payment_date: nextPaymentDate.toISOString().split('T')[0],
        })
        .eq('id', loanId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans', branchId] });
      toast.success('Loan approved successfully');
    },
    onError: (error) => {
      toast.error('Failed to approve loan: ' + error.message);
    },
  });

  // Reject a loan
  const rejectLoan = useMutation({
    mutationFn: async ({ loanId, reason }: { loanId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('employee_loans')
        .update({
          status: 'rejected',
          rejected_reason: reason,
        })
        .eq('id', loanId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans', branchId] });
      toast.success('Loan rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject loan: ' + error.message);
    },
  });

  // Calculate loan details
  const calculateLoan = (
    loanAmount: number,
    paymentPeriodMonths: number,
    interestRate: number = 0
  ) => {
    const totalInterest = (loanAmount * interestRate * paymentPeriodMonths) / 100 / 12;
    const totalRepayment = loanAmount + totalInterest;
    const monthlyPayment = totalRepayment / paymentPeriodMonths;

    return {
      loanAmount,
      paymentPeriodMonths,
      interestRate,
      totalInterest,
      totalRepayment,
      monthlyPayment,
    };
  };

  return {
    loanSettings,
    isLoadingSettings,
    loans,
    isLoadingLoans,
    getEmployeeLoans,
    saveLoanSettings,
    applyForLoan,
    approveLoan,
    rejectLoan,
    calculateLoan,
  };
};
