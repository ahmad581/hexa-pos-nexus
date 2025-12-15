import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEmployeeLoans, EmployeeLoan } from '@/hooks/useEmployeeLoans';
import { 
  Settings, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  Calendar,
  User
} from 'lucide-react';
import { LoanSettingsDialog } from './LoanSettingsDialog';
import { LoanApplicationDialog } from './LoanApplicationDialog';
import { format } from 'date-fns';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  salary?: number;
  hourly_rate?: number;
}

interface LoanManagementProps {
  branchId: string;
  employees: Employee[];
}

export const LoanManagement = ({ branchId, employees }: LoanManagementProps) => {
  const { loans, isLoadingLoans, loanSettings, approveLoan, rejectLoan } = useEmployeeLoans(branchId);
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<EmployeeLoan | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600"><DollarSign className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = (loan: EmployeeLoan) => {
    approveLoan.mutate({
      loanId: loan.id,
      approvedBy: 'Manager', // In a real app, get the current user's name
    });
  };

  const handleReject = () => {
    if (!selectedLoan) return;
    rejectLoan.mutate({
      loanId: selectedLoan.id,
      reason: rejectReason,
    });
    setRejectDialogOpen(false);
    setSelectedLoan(null);
    setRejectReason('');
  };

  const openRejectDialog = (loan: EmployeeLoan) => {
    setSelectedLoan(loan);
    setRejectDialogOpen(true);
  };

  const pendingLoans = loans?.filter(l => l.status === 'pending') || [];
  const activeLoans = loans?.filter(l => l.status === 'approved') || [];
  const historicalLoans = loans?.filter(l => ['rejected', 'completed'].includes(l.status)) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Loans</h2>
          <p className="text-muted-foreground">Manage employee loan applications and settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setApplicationOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {loanSettings && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{loanSettings.max_loan_amount}</div>
              <p className="text-xs text-muted-foreground">Max Loan Amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{loanSettings.max_payment_period_months} mo</div>
              <p className="text-xs text-muted-foreground">Max Payment Period</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{loanSettings.interest_rate_percentage}%</div>
              <p className="text-xs text-muted-foreground">Interest Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{loanSettings.max_monthly_payment_percentage}%</div>
              <p className="text-xs text-muted-foreground">Max Monthly Deduction</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingLoans.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeLoans.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            History ({historicalLoans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Loan Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLoans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending loan applications</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Monthly Payment</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {getEmployeeName(loan.employee_id)}
                          </div>
                        </TableCell>
                        <TableCell>{loan.loan_amount.toFixed(2)}</TableCell>
                        <TableCell>{loan.payment_period_months} months</TableCell>
                        <TableCell>{loan.monthly_payment.toFixed(2)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{loan.reason || '-'}</TableCell>
                        <TableCell>{format(new Date(loan.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(loan)}
                              disabled={approveLoan.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => openRejectDialog(loan)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {activeLoans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active loans</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Monthly Payment</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">
                          {getEmployeeName(loan.employee_id)}
                        </TableCell>
                        <TableCell>{loan.loan_amount.toFixed(2)}</TableCell>
                        <TableCell>{loan.monthly_payment.toFixed(2)}</TableCell>
                        <TableCell>{(loan.remaining_amount || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {loan.start_date ? format(new Date(loan.start_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {loan.end_date ? format(new Date(loan.end_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Loan History</CardTitle>
            </CardHeader>
            <CardContent>
              {historicalLoans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No loan history</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicalLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-medium">
                          {getEmployeeName(loan.employee_id)}
                        </TableCell>
                        <TableCell>{loan.loan_amount.toFixed(2)}</TableCell>
                        <TableCell>{loan.payment_period_months} months</TableCell>
                        <TableCell>{loan.paid_amount.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(loan.status)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {loan.rejected_reason || loan.reason || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LoanSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        branchId={branchId}
      />

      <LoanApplicationDialog
        open={applicationOpen}
        onOpenChange={setApplicationOpen}
        branchId={branchId}
        employees={employees}
      />

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Loan Application</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Reason for rejection</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter the reason for rejecting this loan..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectLoan.isPending}>
              Reject Loan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
