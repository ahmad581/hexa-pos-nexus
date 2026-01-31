import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmployeeLoans } from '@/hooks/useEmployeeLoans';
import { Calculator, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  salary?: number;
  hourly_rate?: number;
}

interface LoanApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branchId: string;
  employees: Employee[];
  selectedEmployeeId?: string;
}

export const LoanApplicationDialog = ({
  open,
  onOpenChange,
  branchId,
  employees,
  selectedEmployeeId,
}: LoanApplicationDialogProps) => {
  const { loanSettings, applyForLoan, calculateLoan } = useEmployeeLoans(branchId);

  const [employeeId, setEmployeeId] = useState(selectedEmployeeId || '');
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [paymentPeriod, setPaymentPeriod] = useState<number>(1);
  const [reason, setReason] = useState('');
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    if (selectedEmployeeId) {
      setEmployeeId(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.id === employeeId);
  }, [employees, employeeId]);

  const monthlySalary = useMemo(() => {
    if (!selectedEmployee) return 0;
    if (selectedEmployee.salary) return selectedEmployee.salary;
    if (selectedEmployee.hourly_rate) return selectedEmployee.hourly_rate * 160; // Assume 160 hours/month
    return 0;
  }, [selectedEmployee]);

  const calculation = useMemo(() => {
    if (!loanAmount || !paymentPeriod) return null;
    return calculateLoan(
      loanAmount,
      paymentPeriod,
      loanSettings?.interest_rate_percentage || 0
    );
  }, [loanAmount, paymentPeriod, loanSettings, calculateLoan]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!loanSettings?.is_active) {
      errors.push('Loan applications are currently disabled');
    }
    if (loanSettings) {
      if (loanAmount < loanSettings.min_loan_amount) {
        errors.push(`Minimum loan amount is ${loanSettings.min_loan_amount}`);
      }
      if (loanAmount > loanSettings.max_loan_amount) {
        errors.push(`Maximum loan amount is ${loanSettings.max_loan_amount}`);
      }
      if (paymentPeriod < loanSettings.min_payment_period_months) {
        errors.push(`Minimum payment period is ${loanSettings.min_payment_period_months} months`);
      }
      if (paymentPeriod > loanSettings.max_payment_period_months) {
        errors.push(`Maximum payment period is ${loanSettings.max_payment_period_months} months`);
      }
      if (calculation && monthlySalary > 0) {
        const maxMonthlyPayment = (monthlySalary * loanSettings.max_monthly_payment_percentage) / 100;
        if (calculation.monthlyPayment > maxMonthlyPayment) {
          errors.push(`Monthly payment exceeds ${loanSettings.max_monthly_payment_percentage}% of salary (max: ${formatCurrency(maxMonthlyPayment)})`);
        }
      }
    }
    return errors;
  }, [loanAmount, paymentPeriod, loanSettings, calculation, monthlySalary]);

  const handleSubmit = () => {
    if (!employeeId || !calculation || validationErrors.length > 0) return;

    applyForLoan.mutate({
      employee_id: employeeId,
      branch_id: branchId,
      loan_amount: calculation.loanAmount,
      payment_period_months: calculation.paymentPeriodMonths,
      monthly_payment: calculation.monthlyPayment,
      total_repayment: calculation.totalRepayment,
      interest_rate: calculation.interestRate,
      reason: reason || null,
      status: loanSettings?.require_approval ? 'pending' : 'approved',
      remaining_amount: calculation.totalRepayment,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setEmployeeId(selectedEmployeeId || '');
    setLoanAmount(0);
    setPaymentPeriod(1);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Apply for Loan
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label>Select Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loan Amount</Label>
              <Input
                type="number"
                value={loanAmount || ''}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                placeholder={`${loanSettings?.min_loan_amount || 0} - ${loanSettings?.max_loan_amount || 0}`}
              />
              {loanSettings && (
                <p className="text-xs text-muted-foreground">
                  Min: {loanSettings.min_loan_amount} | Max: {loanSettings.max_loan_amount}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Payment Period (months)</Label>
              <Input
                type="number"
                value={paymentPeriod || ''}
                onChange={(e) => setPaymentPeriod(Number(e.target.value))}
                placeholder={`${loanSettings?.min_payment_period_months || 1} - ${loanSettings?.max_payment_period_months || 24}`}
              />
              {loanSettings && (
                <p className="text-xs text-muted-foreground">
                  Min: {loanSettings.min_payment_period_months} | Max: {loanSettings.max_payment_period_months} months
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason for Loan (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the purpose of this loan..."
            />
          </div>

          {calculation && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Loan Calculation Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Loan Amount</p>
                    <p className="text-lg font-semibold">{calculation.loanAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Period</p>
                    <p className="text-lg font-semibold">{calculation.paymentPeriodMonths} months</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="text-lg font-semibold">{calculation.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Interest</p>
                    <p className="text-lg font-semibold">{calculation.totalInterest.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-muted-foreground">Monthly Payment (Salary Deduction)</p>
                        <p className="text-2xl font-bold text-primary">{calculation.monthlyPayment.toFixed(2)}</p>
                        {monthlySalary > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ({((calculation.monthlyPayment / monthlySalary) * 100).toFixed(1)}% of salary)
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Total Repayment</p>
                        <p className="text-xl font-semibold">{calculation.totalRepayment.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validationErrors.length === 0 && calculation && employeeId && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {loanSettings?.require_approval
                  ? 'This loan application will require manager approval.'
                  : 'This loan will be automatically approved.'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!employeeId || !calculation || validationErrors.length > 0 || applyForLoan.isPending}
          >
            <Clock className="h-4 w-4 mr-2" />
            Submit Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
