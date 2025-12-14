import { useState } from "react";
import { Plus, Edit, Trash2, Search, DollarSign, Clock, QrCode, Fingerprint, LogIn, LogOut, Calendar, Upload, FileText, Scan, X, Mail, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { useBranch } from "@/contexts/BranchContext";

interface WorkSession {
  checkInTime: string;
  checkOutTime: string;
  hoursWorked: number;
  earnings: number;
}

interface WorkDay {
  date: string;
  sessions: WorkSession[];
  totalHours: number;
  totalEarnings: number;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  documents: string[]; // Array of PDF file URLs
  role: string;
  status: "Active" | "Inactive";
  phone: string;
  hireDate: string;
  monthlySalary: number;
  workingDaysPerMonth: number;
  workingHoursPerDay: number;
  actualHoursWorked: number;
  currentMonthHours: number;
  checkInTime?: string;
  checkOutTime?: string;
  isCheckedIn: boolean;
  qrCode: string;
  fingerprintId: string;
  dailyHours: number;
  todayEarnings: number;
  workDays: WorkDay[];
  biometricRegistered: boolean;
}

interface EmployeeFormData {
  name: string;
  email: string;
  role: string;
  phone: string;
  monthlySalary: number;
  workingDaysPerMonth: number;
  workingHoursPerDay: number;
}

interface SalaryFormData {
  monthlySalary: number;
  workingDaysPerMonth: number;
  workingHoursPerDay: number;
}

export const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      documents: ["contract.pdf", "id_copy.pdf"],
      role: "Manager",
      status: "Active",
      phone: "(555) 123-4567",
      hireDate: "2023-01-15",
      monthlySalary: 5000,
      workingDaysPerMonth: 22,
      workingHoursPerDay: 8,
      actualHoursWorked: 0,
      currentMonthHours: 176,
      isCheckedIn: false,
      qrCode: "QR001-JOHN-DOE",
      fingerprintId: "FP001-JD",
      dailyHours: 0,
      todayEarnings: 0,
      biometricRegistered: false,
      workDays: [
        {
          date: "2025-01-01",
          sessions: [
            {
              checkInTime: "09:00 AM",
              checkOutTime: "01:00 PM",
              hoursWorked: 4,
              earnings: 90.91
            },
            {
              checkInTime: "02:00 PM",
              checkOutTime: "05:00 PM",
              hoursWorked: 3,
              earnings: 68.18
            }
          ],
          totalHours: 7,
          totalEarnings: 159.09
        },
        {
          date: "2025-01-02",
          sessions: [
            {
              checkInTime: "09:15 AM",
              checkOutTime: "05:30 PM",
              hoursWorked: 8.25,
              earnings: 187.50
            }
          ],
          totalHours: 8.25,
          totalEarnings: 187.50
        }
      ]
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      documents: ["contract.pdf"],
      role: "Cashier",
      status: "Active",
      phone: "(555) 987-6543",
      hireDate: "2023-03-20",
      monthlySalary: 3000,
      workingDaysPerMonth: 20,
      workingHoursPerDay: 8,
      actualHoursWorked: 0,
      currentMonthHours: 160,
      isCheckedIn: true,
      checkInTime: "09:00 AM",
      qrCode: "QR002-JANE-SMITH",
      fingerprintId: "FP002-JS",
      dailyHours: 3.5,
      todayEarnings: 52.5,
      biometricRegistered: true,
      workDays: [
        {
          date: "2025-01-01",
          sessions: [
            {
              checkInTime: "08:45 AM",
              checkOutTime: "04:45 PM",
              hoursWorked: 8,
              earnings: 150.00
            }
          ],
          totalHours: 8,
          totalEarnings: 150.00
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<number>>(new Set());
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showBiometric, setShowBiometric] = useState<{show: boolean, employeeId: number, mode: 'register' | 'authenticate'}>({show: false, employeeId: 0, mode: 'register'});
  const [showQRGenerator, setShowQRGenerator] = useState<{show: boolean, employee: Employee | null}>({show: false, employee: null});
  const [showDocuments, setShowDocuments] = useState<{show: boolean, employee: Employee | null}>({show: false, employee: null});
  const [showSalaryCalculator, setShowSalaryCalculator] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { selectedBranch } = useBranch();

  const form = useForm<EmployeeFormData>();
  const salaryForm = useForm<SalaryFormData>();

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateHourlyRate = (employee: Employee) => {
    const totalMonthlyHours = employee.workingDaysPerMonth * employee.workingHoursPerDay;
    return employee.monthlySalary / totalMonthlyHours;
  };

  const toggleEmployeeExpansion = (employeeId: number) => {
    const newExpanded = new Set(expandedEmployees);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedEmployees(newExpanded);
  };

  const handleCheckIn = (employeeId: number) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, isCheckedIn: true, checkInTime: timeString }
        : emp
    ));
    
    toast({ title: t('employeesPage.checkedInSuccess') });
  };

  const handleCheckOut = (employeeId: number) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];
    
    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId && emp.checkInTime) {
        const checkInTime = new Date(`1970/01/01 ${emp.checkInTime}`);
        const checkOutTime = new Date(`1970/01/01 ${timeString}`);
        const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        const hourlyRate = calculateHourlyRate(emp);
        const sessionEarnings = hoursWorked * hourlyRate;
        
        const newSession: WorkSession = {
          checkInTime: emp.checkInTime,
          checkOutTime: timeString,
          hoursWorked: hoursWorked,
          earnings: sessionEarnings
        };

        // Find or create work day for today
        const existingDayIndex = emp.workDays.findIndex(day => day.date === dateString);
        let updatedWorkDays;
        
        if (existingDayIndex >= 0) {
          // Add session to existing day
          const existingDay = emp.workDays[existingDayIndex];
          const updatedSessions = [...existingDay.sessions, newSession];
          const totalHours = updatedSessions.reduce((sum, session) => sum + session.hoursWorked, 0);
          const totalEarnings = updatedSessions.reduce((sum, session) => sum + session.earnings, 0);
          
          updatedWorkDays = [...emp.workDays];
          updatedWorkDays[existingDayIndex] = {
            ...existingDay,
            sessions: updatedSessions,
            totalHours,
            totalEarnings
          };
        } else {
          // Create new work day
          const newWorkDay: WorkDay = {
            date: dateString,
            sessions: [newSession],
            totalHours: hoursWorked,
            totalEarnings: sessionEarnings
          };
          updatedWorkDays = [...emp.workDays, newWorkDay];
        }
        
        // Calculate cumulative daily hours and earnings for today
        const todayWorkDay = updatedWorkDays.find(day => day.date === dateString);
        const cumulativeDailyHours = todayWorkDay ? todayWorkDay.totalHours : 0;
        const cumulativeTodayEarnings = todayWorkDay ? todayWorkDay.totalEarnings : 0;
        
        return {
          ...emp,
          isCheckedIn: false,
          checkOutTime: timeString,
          dailyHours: cumulativeDailyHours,
          todayEarnings: cumulativeTodayEarnings,
          actualHoursWorked: emp.actualHoursWorked + hoursWorked,
          workDays: updatedWorkDays
        };
      }
      return emp;
    }));
    
    toast({ title: t('employeesPage.checkedOutSuccess') });
  };

  const handleAddEmployee = (data: EmployeeFormData) => {
    const newEmployee: Employee = {
      id: Math.max(...employees.map(e => e.id)) + 1,
      ...data,
      status: "Active",
      hireDate: new Date().toISOString().split('T')[0],
      actualHoursWorked: 0,
      currentMonthHours: data.workingDaysPerMonth * data.workingHoursPerDay,
      isCheckedIn: false,
      documents: [],
      qrCode: `QR${String(Math.max(...employees.map(e => e.id)) + 1).padStart(3, '0')}-${data.name.toUpperCase().replace(' ', '-')}`,
      fingerprintId: `FP${String(Math.max(...employees.map(e => e.id)) + 1).padStart(3, '0')}-${data.name.split(' ').map(n => n[0]).join('')}`,
      dailyHours: 0,
      todayEarnings: 0,
      biometricRegistered: false,
      workDays: []
    };

    setEmployees(prev => [...prev, newEmployee]);
    setIsAddDialogOpen(false);
    form.reset();
    toast({ title: t('employeesPage.employeeAdded') });
  };

  const handleEditEmployee = (data: EmployeeFormData) => {
    if (!selectedEmployee) return;

    setEmployees(prev => prev.map(emp => 
      emp.id === selectedEmployee.id 
        ? { 
            ...emp, 
            ...data,
            currentMonthHours: data.workingDaysPerMonth * data.workingHoursPerDay
          }
        : emp
    ));

    setIsDialogOpen(false);
    setSelectedEmployee(null);
    form.reset();
    toast({ title: t('employeesPage.employeeUpdated') });
  };

  const handleDeleteEmployee = (employeeId: number) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast({ title: t('employeesPage.employeeDeleted') });
  };

  const handleSalaryUpdate = (data: SalaryFormData) => {
    if (!selectedEmployee) return;

    setEmployees(prev => prev.map(emp => 
      emp.id === selectedEmployee.id 
        ? { 
            ...emp, 
            ...data,
            currentMonthHours: data.workingDaysPerMonth * data.workingHoursPerDay
          }
        : emp
    ));

    toast({ title: `Salary updated for ${selectedEmployee.name}` });
    setIsSalaryDialogOpen(false);
    setSelectedEmployee(null);
    salaryForm.reset();
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    form.setValue("name", employee.name);
    form.setValue("email", employee.email);
    form.setValue("role", employee.role);
    form.setValue("phone", employee.phone);
    form.setValue("monthlySalary", employee.monthlySalary);
    form.setValue("workingDaysPerMonth", employee.workingDaysPerMonth);
    form.setValue("workingHoursPerDay", employee.workingHoursPerDay);
    setIsDialogOpen(true);
  };

  const handleQRScan = (employeeData: any) => {
    const employee = employees.find(emp => emp.id === employeeData.employeeId);
    if (employee) {
      if (employee.isCheckedIn) {
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

  const handleBiometricAuth = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      if (showBiometric.mode === 'register') {
        // Register biometric
        setEmployees(prev => prev.map(emp => 
          emp.id === employeeId 
            ? { ...emp, biometricRegistered: true }
            : emp
        ));
      } else {
        // Authenticate and check in/out
        if (employee.isCheckedIn) {
          handleCheckOut(employee.id);
        } else {
          handleCheckIn(employee.id);
        }
      }
    }
    setShowBiometric({show: false, employeeId: 0, mode: 'register'});
  };

  const handleFileUpload = (employeeId: number, files: FileList | null) => {
    if (!files) return;
    
    const newDocuments: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf') {
        // In a real implementation, you would upload to Supabase storage
        // For now, we'll just store the filename
        newDocuments.push(file.name);
      }
    });
    
    if (newDocuments.length > 0) {
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, documents: [...emp.documents, ...newDocuments] }
          : emp
      ));
      toast({ title: `${newDocuments.length} ${t('employees.documentsUploaded')}` });
    }
  };

  const removeDocument = (employeeId: number, documentIndex: number) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { 
            ...emp, 
            documents: emp.documents.filter((_, index) => index !== documentIndex) 
          }
        : emp
    ));
    toast({ title: t('employees.documentRemoved') });
  };

  const openSalaryDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    salaryForm.setValue("monthlySalary", employee.monthlySalary);
    salaryForm.setValue("workingDaysPerMonth", employee.workingDaysPerMonth);
    salaryForm.setValue("workingHoursPerDay", employee.workingHoursPerDay);
    setIsSalaryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('employeesPage.title')}</h1>
        <div className="flex gap-3">
          <Button 
            variant={showSalaryCalculator ? "default" : "outline"}
            onClick={() => setShowSalaryCalculator(!showSalaryCalculator)}
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

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder={t('employeesPage.searchEmployees')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600"
          />
        </div>
      </div>

      {/* Salary Calculator */}
      {showSalaryCalculator && (
        <SalaryCalculator employees={employees} />
      )}

      <div className="grid gap-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-semibold text-white">{employee.name}</h3>
                  <Badge className={employee.status === "Active" ? "bg-green-600" : "bg-red-600"}>
                    {employee.status === "Active" ? t('employees.statusActive') : t('employees.statusInactive')}
                  </Badge>
                  <Badge className={employee.isCheckedIn ? "bg-blue-600" : "bg-gray-600"}>
                    {employee.isCheckedIn ? t('employees.checkedIn') : t('employees.checkedOut')}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-gray-300 mb-4">
                  <div>
                    <p><strong>{t('employees.role')}:</strong> {employee.role}</p>
                    <p><strong>{t('employees.phone')}:</strong> {employee.phone}</p>
                    <p className="flex items-center gap-1">
                      <Mail size={14} />
                      <strong>Email:</strong> {employee.email || 'Not set'}
                    </p>
                    <p><strong>{t('employees.hireDate')}:</strong> {employee.hireDate}</p>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDocuments({ show: true, employee })}
                        className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                      >
                        <FileText size={14} className="mr-1" />
                        Manage Documents ({employee.documents.length})
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p><strong>Monthly Salary:</strong> ${employee.monthlySalary.toLocaleString()}</p>
                    <p><strong>Hourly Rate:</strong> ${calculateHourlyRate(employee).toFixed(2)}</p>
                    <p><strong>QR Code:</strong> {employee.qrCode}</p>
                    <p><strong>Fingerprint ID:</strong> {employee.fingerprintId}</p>
                  </div>
                </div>

                {/* Check In/Out Section */}
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-400">{t('employees.checkInTime')}</p>
                      <p className="text-white font-semibold">{employee.checkInTime || t('employees.notCheckedIn')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">{t('employees.checkOutTime')}</p>
                      <p className="text-white font-semibold">{employee.checkOutTime || t('employees.notCheckedOut')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">{t('employees.dailyHours')}</p>
                      <p className="text-white font-semibold">{employee.dailyHours.toFixed(2)}h</p>
                    </div>
                    <div>
                      <p className="text-gray-400">{t('employees.todaysEarnings')}</p>
                      <p className="text-green-400 font-semibold">${employee.todayEarnings.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleCheckIn(employee.id)}
                      disabled={employee.isCheckedIn}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <LogIn size={14} className="mr-1" />
                      {t('employeesPage.checkIn')}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleCheckOut(employee.id)}
                      disabled={!employee.isCheckedIn}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <LogOut size={14} className="mr-1" />
                      {t('employeesPage.checkOut')}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setShowBiometric({show: true, employeeId: employee.id, mode: employee.biometricRegistered ? 'authenticate' : 'register'})}
                      className={employee.biometricRegistered ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"}
                    >
                      <Fingerprint size={14} className="mr-1" />
                      {employee.biometricRegistered ? t('employees.biometricAuth') : t('employees.registerBiometric')}
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

                {/* Monthly Work Days Table */}
                <Collapsible 
                  open={expandedEmployees.has(employee.id)} 
                  onOpenChange={() => toggleEmployeeExpansion(employee.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full mb-4 border-gray-600 text-gray-300"
                    >
                      <Calendar size={16} className="mr-2" />
                      {expandedEmployees.has(employee.id) ? t('common.close') : t('common.view')} {t('employeesPage.workingDays')} ({employee.workDays.length} days)
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mb-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-3">Work Days - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                      {employee.workDays.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-600">
                              <TableHead className="text-gray-300">Date</TableHead>
                              <TableHead className="text-gray-300">Sessions</TableHead>
                              <TableHead className="text-gray-300">Total Hours</TableHead>
                              <TableHead className="text-gray-300">Total Earnings</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {employee.workDays.map((workDay, index) => (
                              <TableRow key={index} className="border-gray-600">
                                <TableCell className="text-white">
                                  {new Date(workDay.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-white">
                                  <div className="space-y-1">
                                    {workDay.sessions.map((session, sessionIndex) => (
                                      <div key={sessionIndex} className="text-sm">
                                        {session.checkInTime} - {session.checkOutTime} 
                                        <span className="text-gray-400 ml-2">
                                          ({session.hoursWorked.toFixed(2)}h, ${session.earnings.toFixed(2)})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-white">{workDay.totalHours.toFixed(2)}h</TableCell>
                                <TableCell className="text-green-400 font-semibold">
                                  ${workDay.totalEarnings.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-gray-400 text-center py-4">No work days recorded this month</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Salary Calculation Section */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Expected Monthly Hours</p>
                      <p className="text-white font-semibold">{employee.currentMonthHours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Hours Worked</p>
                      <p className="text-white font-semibold">{employee.actualHoursWorked.toFixed(2)}h</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Estimated Salary</p>
                      <p className="text-green-400 font-semibold">
                        ${(calculateHourlyRate(employee) * employee.actualHoursWorked).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300"
                  onClick={() => openSalaryDialog(employee)}
                >
                  <DollarSign size={16} className="mr-1" />
                  {t('employees.salary')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300"
                  onClick={() => openEditDialog(employee)}
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300"
                  onClick={() => handleDeleteEmployee(employee.id)}
                >
                  <Trash2 size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300"
                >
                  <QrCode size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-gray-600 text-gray-300"
                >
                  <Fingerprint size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">{t('employeesPage.addEmployee')}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddEmployee)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">{t('employees.name')}</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="employee@example.com" className="bg-gray-700 border-gray-600 text-white" />
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
                    <FormLabel className="text-gray-300">{t('employees.role')}</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                    <FormLabel className="text-gray-300">{t('employees.phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                    <FormLabel className="text-gray-300">{t('employeesPage.monthlySalary')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {t('employeesPage.addEmployee')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
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
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Employee - {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditEmployee)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="employee@example.com" className="bg-gray-700 border-gray-600 text-white" />
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
                    <FormLabel className="text-gray-300">Role</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                    <FormLabel className="text-gray-300">Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                    <FormLabel className="text-gray-300">Monthly Salary ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="workingDaysPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Working Days per Month</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="workingHoursPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Working Hours per Day</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Update Employee
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
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Configure Salary - {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...salaryForm}>
            <form onSubmit={salaryForm.handleSubmit(handleSalaryUpdate)} className="space-y-4">
              <FormField
                control={salaryForm.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Monthly Salary ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={salaryForm.control}
                name="workingDaysPerMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Working Days per Month</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="22"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={salaryForm.control}
                name="workingHoursPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Working Hours per Day</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="8"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Update Salary
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
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
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
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <BiometricAuth 
              employeeId={showBiometric.employeeId}
              employeeName={employees.find(emp => emp.id === showBiometric.employeeId)?.name || ''}
              mode={showBiometric.mode}
              onAuthSuccess={handleBiometricAuth}
              onClose={() => setShowBiometric({show: false, employeeId: 0, mode: 'register'})}
            />
          </div>
        </div>
      )}

      {/* QR Generator Modal */}
      {showQRGenerator.show && showQRGenerator.employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Employee QR Code</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowQRGenerator({show: false, employee: null})}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </Button>
            </div>
            <QRCodeGenerator 
              employeeId={showQRGenerator.employee.id}
              employeeName={showQRGenerator.employee.name}
              qrCodeData={showQRGenerator.employee.qrCode}
            />
          </div>
        </div>
      )}

      {/* Documents Manager Modal */}
      {showDocuments.show && showDocuments.employee && (
        <EmployeeDocumentsManager
          employeeId={String(showDocuments.employee.id)}
          branchId={selectedBranch?.id || 'default'}
          isOpen={showDocuments.show}
          onClose={() => setShowDocuments({ show: false, employee: null })}
          employeeName={showDocuments.employee.name}
        />
      )}
    </div>
  );
};
