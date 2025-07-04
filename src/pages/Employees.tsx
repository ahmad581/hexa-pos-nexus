
import { useState } from "react";
import { Plus, Edit, Trash2, Search, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  phone: string;
  hireDate: string;
  monthlySalary: number;
  workingDaysPerMonth: number;
  workingHoursPerDay: number;
  actualHoursWorked: number;
  currentMonthHours: number;
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
      email: "john@hexapos.com",
      role: "Manager",
      status: "Active",
      phone: "(555) 123-4567",
      hireDate: "2023-01-15",
      monthlySalary: 5000,
      workingDaysPerMonth: 22,
      workingHoursPerDay: 8,
      actualHoursWorked: 0,
      currentMonthHours: 176
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@hexapos.com",
      role: "Cashier",
      status: "Active",
      phone: "(555) 987-6543",
      hireDate: "2023-03-20",
      monthlySalary: 3000,
      workingDaysPerMonth: 20,
      workingHoursPerDay: 8,
      actualHoursWorked: 0,
      currentMonthHours: 160
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@hexapos.com",
      role: "Server",
      status: "Inactive",
      phone: "(555) 456-7890",
      hireDate: "2023-02-10",
      monthlySalary: 2500,
      workingDaysPerMonth: 18,
      workingHoursPerDay: 6,
      actualHoursWorked: 0,
      currentMonthHours: 108
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SalaryFormData>();

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateHourlyRate = (employee: Employee) => {
    const totalMonthlyHours = employee.workingDaysPerMonth * employee.workingHoursPerDay;
    return employee.monthlySalary / totalMonthlyHours;
  };

  const calculateEstimatedSalary = (employee: Employee) => {
    const hourlyRate = calculateHourlyRate(employee);
    return hourlyRate * employee.currentMonthHours;
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

    toast({
      title: "Salary Updated",
      description: `Salary configuration updated for ${selectedEmployee.name}`,
    });

    setIsDialogOpen(false);
    setSelectedEmployee(null);
    form.reset();
  };

  const updateHoursWorked = (employeeId: number, hours: number) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, actualHoursWorked: Math.max(0, emp.actualHoursWorked + hours) }
        : emp
    ));
  };

  const openSalaryDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    form.setValue("monthlySalary", employee.monthlySalary);
    form.setValue("workingDaysPerMonth", employee.workingDaysPerMonth);
    form.setValue("workingHoursPerDay", employee.workingHoursPerDay);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus size={20} className="mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-semibold text-white">{employee.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.status === "Active" 
                      ? "bg-green-600 text-white" 
                      : "bg-red-600 text-white"
                  }`}>
                    {employee.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-gray-300 mb-4">
                  <div>
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Role:</strong> {employee.role}</p>
                    <p><strong>Phone:</strong> {employee.phone}</p>
                    <p><strong>Hire Date:</strong> {employee.hireDate}</p>
                  </div>
                  <div>
                    <p><strong>Monthly Salary:</strong> ${employee.monthlySalary.toLocaleString()}</p>
                    <p><strong>Hourly Rate:</strong> ${calculateHourlyRate(employee).toFixed(2)}</p>
                    <p><strong>Working Days/Month:</strong> {employee.workingDaysPerMonth}</p>
                    <p><strong>Hours/Day:</strong> {employee.workingHoursPerDay}</p>
                  </div>
                </div>
                
                {/* Salary Calculation Section */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Expected Monthly Hours</p>
                      <p className="text-white font-semibold">{employee.currentMonthHours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Hours Worked</p>
                      <p className="text-white font-semibold">{employee.actualHoursWorked}h</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Estimated Salary</p>
                      <p className="text-green-400 font-semibold">
                        ${(calculateHourlyRate(employee) * employee.actualHoursWorked).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateHoursWorked(employee.id, 1)}
                      className="border-gray-600 text-gray-300"
                    >
                      +1h
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateHoursWorked(employee.id, 8)}
                      className="border-gray-600 text-gray-300"
                    >
                      +8h (Full Day)
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateHoursWorked(employee.id, -1)}
                      className="border-gray-600 text-gray-300"
                    >
                      -1h
                    </Button>
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
                  Salary
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  <Edit size={16} />
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Salary Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Configure Salary - {selectedEmployee?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSalaryUpdate)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
              
              {selectedEmployee && (
                <div className="bg-gray-700 p-3 rounded">
                  <p className="text-sm text-gray-300">
                    Hourly Rate: ${(form.watch("monthlySalary") / (form.watch("workingDaysPerMonth") * form.watch("workingHoursPerDay"))).toFixed(2)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Update Salary
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
