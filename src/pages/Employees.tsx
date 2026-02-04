import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, Search, DollarSign, Clock, QrCode, Fingerprint, LogIn, LogOut, Calendar, Upload, FileText, Scan, X, Mail, Calculator, Wallet, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import { QRScanner } from "@/components/QRScanner";
import { BiometricAuth } from "@/components/BiometricAuth";
import { useTranslation } from "@/contexts/TranslationContext";
import { EmployeeDocumentsManager } from "@/components/EmployeeDocumentsManager";
import { SalaryCalculator } from "@/components/SalaryCalculator";
import { LoanManagement } from "@/components/loans/LoanManagement";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useRoles, getRoleHierarchy } from "@/hooks/useRoles";
import { useEmployees, DatabaseEmployee } from "@/hooks/useEmployees";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useQueryClient } from '@tanstack/react-query';
import { useCurrency } from "@/hooks/useCurrency";

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  monthlySalary: number;
  branch_id: string;
}

interface SalaryFormData {
  monthlySalary: number;
  hourlyRate: number;
}

export const Employees = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<DatabaseEmployee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showBiometric, setShowBiometric] = useState<{show: boolean, employeeId: string, mode: 'register' | 'authenticate'}>({show: false, employeeId: '', mode: 'register'});
  const [showQRGenerator, setShowQRGenerator] = useState<{show: boolean, employee: DatabaseEmployee | null}>({show: false, employee: null});
  const [showDocuments, setShowDocuments] = useState<{show: boolean, employee: DatabaseEmployee | null}>({show: false, employee: null});
  const [showSalaryCalculator, setShowSalaryCalculator] = useState(false);
  const [showLoanManagement, setShowLoanManagement] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const { selectedBranch, branches, setSelectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const { data: allRoles = [] } = useRoles();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();
  
  // Use the new hook to fetch employees from Supabase
  const {
    employees,
    isLoading,
    todaySessions,
    dailySummaries,
    isEmployeeCheckedIn,
    getCurrentSession,
    checkIn,
    checkOut,
    updateEmployee,
    deleteEmployee,
  } = useEmployees(selectedBranch?.id);

  // Filter roles to only show roles below the current user's hierarchy level
  const availableRoles = useMemo(() => {
    const currentUserRole = userProfile?.primary_role || 'Employee';
    const currentUserHierarchy = getRoleHierarchy(currentUserRole, allRoles);
    
    return allRoles
      .filter(role => role.hierarchy_level > currentUserHierarchy)
      .map(role => ({
        value: role.name,
        label: role.display_name
      }));
  }, [allRoles, userProfile]);

  const form = useForm<EmployeeFormData>();
  const salaryForm = useForm<SalaryFormData>();

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) ||
        employee.position?.toLowerCase().includes(search) ||
        employee.email?.toLowerCase().includes(search) ||
        employee.phone?.toLowerCase().includes(search);
    });
  }, [employees, searchTerm]);

  // Get display name for an employee
  const getEmployeeName = (employee: DatabaseEmployee) => {
    return `${employee.first_name} ${employee.last_name}`.trim();
  };

  // Calculate hourly rate from salary
  const calculateHourlyRate = (employee: DatabaseEmployee) => {
    if (employee.hourly_rate) return employee.hourly_rate;
    if (employee.salary) return employee.salary / (22 * 8); // Assume 22 days, 8 hours
    return 0;
  };

  // Get today's summary for an employee
  const getTodaySummary = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dailySummaries.find(s => s.employee_id === employeeId && s.work_date === today);
  };

  const toggleEmployeeExpansion = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  const handleCheckIn = (employeeId: string) => {
    if (!selectedBranch?.id) return;
    checkIn.mutate({ employeeId, branchId: selectedBranch.id });
  };

  const handleCheckOut = (employeeId: string) => {
    const session = getCurrentSession(employeeId);
    if (!session) return;
    checkOut.mutate({ sessionId: session.id });
  };

  const handleAddEmployee = async (data: EmployeeFormData) => {
    if (!userProfile?.business_id) {
      toast({ title: "Error", description: "No business found. Please contact support.", variant: "destructive" });
      return;
    }

    if (!data.password || data.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setIsAddingEmployee(true);
    try {
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0] || data.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data: result, error } = await supabase.functions.invoke('create-employee', {
        body: {
          email: data.email,
          password: data.password,
          first_name: firstName,
          last_name: lastName,
          role: data.role || 'Employee',
          business_id: userProfile.business_id,
          branch_id: data.branch_id || selectedBranch?.id || null,
          salary: data.monthlySalary || null,
          phone: data.phone || null,
        }
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      setIsAddDialogOpen(false);
      form.reset();
      // Invalidate queries to refetch employees
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: t('employeesPage.employeeAdded'), description: `${data.email} can now login with their password.` });
    } catch (error: any) {
      console.error('Error creating employee:', error);
      toast({ title: "Error", description: error.message || "Failed to create employee", variant: "destructive" });
    } finally {
      setIsAddingEmployee(false);
    }
  };

  const handleEditEmployee = (data: EmployeeFormData) => {
    if (!selectedEmployee) return;

    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0] || data.name;
    const lastName = nameParts.slice(1).join(' ') || '';

    updateEmployee.mutate({
      id: selectedEmployee.id,
      first_name: firstName,
      last_name: lastName,
      email: data.email,
      phone: data.phone,
      position: data.role,
      salary: data.monthlySalary,
    });

    setIsDialogOpen(false);
    setSelectedEmployee(null);
    form.reset();
  };

  const handleDeleteEmployee = (employeeId: string) => {
    deleteEmployee.mutate(employeeId);
  };

  const handleSalaryUpdate = (data: SalaryFormData) => {
    if (!selectedEmployee) return;

    updateEmployee.mutate({
      id: selectedEmployee.id,
      salary: data.monthlySalary,
      hourly_rate: data.hourlyRate,
    });

    setIsSalaryDialogOpen(false);
    setSelectedEmployee(null);
    salaryForm.reset();
  };

  const openEditDialog = (employee: DatabaseEmployee) => {
    setSelectedEmployee(employee);
    form.setValue("name", getEmployeeName(employee));
    form.setValue("email", employee.email || '');
    form.setValue("role", employee.position);
    form.setValue("phone", employee.phone || '');
    form.setValue("monthlySalary", employee.salary || 0);
    setIsDialogOpen(true);
  };

  const openSalaryDialog = (employee: DatabaseEmployee) => {
    setSelectedEmployee(employee);
    salaryForm.setValue("monthlySalary", employee.salary || 0);
    salaryForm.setValue("hourlyRate", employee.hourly_rate || 0);
    setIsSalaryDialogOpen(true);
  };

  const handleQRScan = (employeeData: any) => {
    const employee = employees.find(emp => emp.id === employeeData.employeeId);
    if (employee) {
      if (isEmployeeCheckedIn(employee.id)) {
        handleCheckOut(employee.id);
      } else {
        handleCheckIn(employee.id);
      }
    } else {
      toast({ 
        title: 'Employee not found',
        description: 'Invalid QR code or employee not registered',
        variant: 'destructive'
      });
    }
    setShowQRScanner(false);
  };

  const handleBiometricAuth = (employeeId: string) => {
    if (showBiometric.mode === 'authenticate') {
      if (isEmployeeCheckedIn(employeeId)) {
        handleCheckOut(employeeId);
      } else {
        handleCheckIn(employeeId);
      }
    }
    setShowBiometric({show: false, employeeId: '', mode: 'register'});
  };

  // Get employee summaries for salary calculator
  const employeeSalaryData = useMemo(() => {
    return employees.map(emp => ({
      id: Number(emp.employee_number) || 0,
      name: getEmployeeName(emp),
      email: emp.email || '',
      documents: [],
      role: emp.position,
      status: emp.is_active ? "Active" as const : "Inactive" as const,
      phone: emp.phone || '',
      hireDate: emp.hire_date,
      monthlySalary: emp.salary || 0,
      workingDaysPerMonth: 22,
      workingHoursPerDay: 8,
      actualHoursWorked: dailySummaries
        .filter(s => s.employee_id === emp.id)
        .reduce((sum, s) => sum + (s.total_hours || 0), 0),
      currentMonthHours: 176,
      isCheckedIn: isEmployeeCheckedIn(emp.id),
      qrCode: `QR-${emp.id.slice(0, 8)}`,
      fingerprintId: `FP-${emp.id.slice(0, 8)}`,
      dailyHours: getTodaySummary(emp.id)?.total_hours || 0,
      todayEarnings: getTodaySummary(emp.id)?.total_earnings || 0,
      workDays: [],
      biometricRegistered: false,
    }));
  }, [employees, dailySummaries]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-card border-border p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('employeesPage.title')}</h1>
        <div className="flex gap-3">
          <Button 
            variant={showLoanManagement ? "default" : "outline"}
            onClick={() => { setShowLoanManagement(!showLoanManagement); if (!showLoanManagement) setShowSalaryCalculator(false); }}
            className={showLoanManagement ? "bg-primary" : "border-amber-600 text-amber-600 hover:bg-amber-600/10"}
          >
            <Wallet size={20} className="mr-2" />
            Loans
          </Button>
          <Button 
            variant={showSalaryCalculator ? "default" : "outline"}
            onClick={() => { setShowSalaryCalculator(!showSalaryCalculator); if (!showSalaryCalculator) setShowLoanManagement(false); }}
            className={showSalaryCalculator ? "bg-primary" : "border-primary text-primary hover:bg-primary/10"}
          >
            <Calculator size={20} className="mr-2" />
            Salary Calculator
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => setShowQRScanner(true)}
          >
            <Scan size={20} className="mr-2" />
            {t('employeesPage.scanQR')}
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus size={20} className="mr-2" />
            {t('employeesPage.addEmployee')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 max-w-md min-w-[240px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder={t('employeesPage.searchEmployees')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>

        <Select
          value={selectedBranch?.id ?? undefined}
          onValueChange={(value) => {
            const branch = branches.find((b) => b.id === value);
            if (branch) setSelectedBranch(branch);
          }}
        >
          <SelectTrigger className="w-56 bg-muted border-border text-foreground">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches
              .filter((b) => b.isActive)
              .map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {selectedBranch && (
          <Badge variant="outline" className="text-sm">
            Branch: {selectedBranch.name}
          </Badge>
        )}
      </div>

      {/* Loan Management */}
      {showLoanManagement && (
        selectedBranch ? (
          <LoanManagement 
            branchId={selectedBranch.id} 
            employees={employees.map(e => ({
              id: e.id,
              first_name: e.first_name,
              last_name: e.last_name,
              salary: e.salary ?? undefined,
              hourly_rate: e.hourly_rate ?? undefined,
            }))} 
          />
        ) : (
          <Card className="bg-card border-border p-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-muted-foreground">Please select a branch to manage loans.</p>
              <Select onValueChange={(value) => {
                const branch = branches.find(b => b.id === value);
                if (branch) setSelectedBranch(branch);
              }}>
                <SelectTrigger className="w-64 bg-muted border-border text-foreground">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        )
      )}

      {/* Salary Calculator */}
      {showSalaryCalculator && (
        <SalaryCalculator employees={employeeSalaryData} />
      )}

      {/* Employee list */}
      {filteredEmployees.length === 0 ? (
        <Card className="bg-card border-border p-8 text-center">
          <p className="text-muted-foreground mb-4">
            {employees.length === 0 
              ? "No employees found for this branch. Add your first employee!" 
              : "No employees match your search."}
          </p>
          {employees.length === 0 && (
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" />
              Add Employee
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEmployees.map((employee) => {
            const isCheckedIn = isEmployeeCheckedIn(employee.id);
            const currentSession = getCurrentSession(employee.id);
            const todaySummary = getTodaySummary(employee.id);
            const hourlyRate = calculateHourlyRate(employee);

            return (
              <Card key={employee.id} className="bg-card border-border p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{getEmployeeName(employee)}</h3>
                      <Badge className={employee.is_active ? "bg-green-600" : "bg-red-600"}>
                        {employee.is_active ? t('employees.statusActive') : t('employees.statusInactive')}
                      </Badge>
                      <Badge className={isCheckedIn ? "bg-blue-600" : "bg-secondary"}>
                        {isCheckedIn ? t('employees.checkedIn') : t('employees.checkedOut')}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-muted-foreground mb-4">
                      <div>
                        <p><strong>{t('employees.role')}:</strong> {employee.position}</p>
                        <p><strong>{t('employees.phone')}:</strong> {employee.phone || 'Not set'}</p>
                        <p className="flex items-center gap-1">
                          <Mail size={14} />
                          <strong>Email:</strong> {employee.email || 'Not set'}
                        </p>
                        <p><strong>{t('employees.hireDate')}:</strong> {format(new Date(employee.hire_date), 'MMM d, yyyy')}</p>
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDocuments({ show: true, employee })}
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                          >
                            <FileText size={14} className="mr-1" />
                            Manage Documents
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p><strong>Monthly Salary:</strong> {formatCurrency(employee.salary || 0)}</p>
                        <p><strong>Hourly Rate:</strong> {formatCurrency(hourlyRate)}</p>
                        <p><strong>Employee #:</strong> {employee.employee_number}</p>
                        <p><strong>Department:</strong> {employee.department || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Check In/Out Section */}
                    <div className="bg-muted p-4 rounded-lg mb-4">
                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">{t('employees.checkInTime')}</p>
                          <p className="text-foreground font-semibold">
                            {currentSession 
                              ? format(new Date(currentSession.check_in_time), 'hh:mm a')
                              : t('employees.notCheckedIn')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('employees.checkOutTime')}</p>
                          <p className="text-foreground font-semibold">
                            {currentSession?.check_out_time 
                              ? format(new Date(currentSession.check_out_time), 'hh:mm a')
                              : t('employees.notCheckedOut')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('employees.dailyHours')}</p>
                          <p className="text-foreground font-semibold">{(todaySummary?.total_hours || 0).toFixed(2)}h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t('employees.todaysEarnings')}</p>
                          <p className="text-green-400 font-semibold">{formatCurrency(todaySummary?.total_earnings || 0)}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleCheckIn(employee.id)}
                          disabled={isCheckedIn || checkIn.isPending}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <LogIn size={14} className="mr-1" />
                          {t('employeesPage.checkIn')}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleCheckOut(employee.id)}
                          disabled={!isCheckedIn || checkOut.isPending}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          <LogOut size={14} className="mr-1" />
                          {t('employeesPage.checkOut')}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setShowBiometric({show: true, employeeId: employee.id, mode: 'authenticate'})}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Fingerprint size={14} className="mr-1" />
                          {t('employees.biometricAuth')}
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setShowQRGenerator({show: true, employee})}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <QrCode size={14} className="mr-1" />
                          {t('employees.showQR')}
                        </Button>
                      </div>
                    </div>

                    {/* Work History */}
                    <Collapsible 
                      open={expandedEmployees.has(employee.id)} 
                      onOpenChange={() => toggleEmployeeExpansion(employee.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full mb-4"
                        >
                          <Calendar size={16} className="mr-2" />
                          {expandedEmployees.has(employee.id) ? t('common.close') : t('common.view')} {t('employeesPage.workingDays')}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mb-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="text-foreground font-semibold mb-3">Work History</h4>
                          {dailySummaries.filter(s => s.employee_id === employee.id).length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow className="border-border">
                                  <TableHead className="text-muted-foreground">Date</TableHead>
                                  <TableHead className="text-muted-foreground">Sessions</TableHead>
                                  <TableHead className="text-muted-foreground">Total Hours</TableHead>
                                  <TableHead className="text-muted-foreground">Total Earnings</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {dailySummaries
                                  .filter(s => s.employee_id === employee.id)
                                  .slice(0, 10)
                                  .map((summary) => (
                                    <TableRow key={summary.id} className="border-border">
                                      <TableCell className="text-foreground">
                                        {format(new Date(summary.work_date), 'MMM d, yyyy')}
                                      </TableCell>
                                      <TableCell className="text-foreground">
                                        {summary.session_count || 1} session(s)
                                      </TableCell>
                                      <TableCell className="text-foreground">{(summary.total_hours || 0).toFixed(2)}h</TableCell>
                                      <TableCell className="text-green-400 font-semibold">
                                        {formatCurrency(summary.total_earnings || 0)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <p className="text-muted-foreground text-center py-4">No work history recorded</p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Salary Summary */}
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Monthly Salary</p>
                          <p className="text-foreground font-semibold">${(employee.salary || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Hours (This Month)</p>
                          <p className="text-foreground font-semibold">
                            {dailySummaries
                              .filter(s => s.employee_id === employee.id)
                              .reduce((sum, s) => sum + (s.total_hours || 0), 0)
                              .toFixed(2)}h
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Earnings</p>
                          <p className="text-green-400 font-semibold">
                            ${dailySummaries
                              .filter(s => s.employee_id === employee.id)
                              .reduce((sum, s) => sum + (s.total_earnings || 0), 0)
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openSalaryDialog(employee)}
                    >
                      <DollarSign size={16} className="mr-1" />
                      {t('employees.salary')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(employee)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t('employeesPage.addEmployee')}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddEmployee)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">{t('employees.name')}</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-muted border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="employee@example.com" className="bg-muted border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input 
                          {...field} 
                          type="password" 
                          placeholder="Min. 6 characters" 
                          className="bg-muted border-border text-foreground pl-10" 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">{t('employees.role')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'Employee'}>
                      <FormControl>
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Branch</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || selectedBranch?.id}>
                      <FormControl>
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">{t('employees.phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-muted border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">{t('employeesPage.monthlySalary')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-muted border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isAddingEmployee}>
                  {isAddingEmployee ? "Creating..." : t('employeesPage.addEmployee')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isAddingEmployee}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit Employee - {selectedEmployee ? getEmployeeName(selectedEmployee) : ''}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditEmployee)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-muted border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="bg-muted border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Role/Position</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-muted border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-muted border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Monthly Salary ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-muted border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={updateEmployee.isPending}>
                  {updateEmployee.isPending ? "Updating..." : "Update Employee"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Salary Configuration Dialog */}
      <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Configure Salary - {selectedEmployee ? getEmployeeName(selectedEmployee) : ''}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...salaryForm}>
            <form onSubmit={salaryForm.handleSubmit(handleSalaryUpdate)} className="space-y-4">
              <FormField
                control={salaryForm.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Monthly Salary ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-muted border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={salaryForm.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-muted border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={updateEmployee.isPending}>
                  {updateEmployee.isPending ? "Updating..." : "Update Salary"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsSalaryDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <QRScanner 
              onScanResult={handleQRScan}
              onClose={() => setShowQRScanner(false)}
            />
          </div>
        </div>
      )}

      {/* Biometric Auth Modal */}
      {showBiometric.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <BiometricAuth 
              employeeId={showBiometric.employeeId}
              employeeName={employees.find(emp => emp.id === showBiometric.employeeId) 
                ? getEmployeeName(employees.find(emp => emp.id === showBiometric.employeeId)!) 
                : ''}
              mode={showBiometric.mode}
              onAuthSuccess={() => handleBiometricAuth(showBiometric.employeeId)}
              onClose={() => setShowBiometric({show: false, employeeId: '', mode: 'register'})}
            />
          </div>
        </div>
      )}

      {/* QR Generator Modal */}
      {showQRGenerator.show && showQRGenerator.employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">Employee QR Code</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowQRGenerator({show: false, employee: null})}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </Button>
            </div>
            <QRCodeGenerator 
              employeeId={showQRGenerator.employee.id}
              employeeName={getEmployeeName(showQRGenerator.employee)}
              qrCodeData={`QR-${showQRGenerator.employee.id}`}
            />
          </div>
        </div>
      )}

      {/* Documents Manager Modal */}
      {showDocuments.show && showDocuments.employee && (
        <EmployeeDocumentsManager
          employeeId={showDocuments.employee.id}
          branchId={selectedBranch?.id || showDocuments.employee.branch_id}
          isOpen={showDocuments.show}
          onClose={() => setShowDocuments({ show: false, employee: null })}
          employeeName={getEmployeeName(showDocuments.employee)}
        />
      )}
    </div>
  );
};
