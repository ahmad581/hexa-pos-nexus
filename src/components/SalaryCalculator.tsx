import { useState, useMemo } from "react";
import { Calculator, Calendar, DollarSign, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
  monthlySalary: number;
  workingDaysPerMonth: number;
  workingHoursPerDay: number;
  workDays: WorkDay[];
}

interface SalaryCalculatorProps {
  employees: Employee[];
}

export const SalaryCalculator = ({ employees }: SalaryCalculatorProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const selectedEmployee = useMemo(() => {
    return employees.find(emp => emp.id.toString() === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  const calculatedSalary = useMemo(() => {
    if (!selectedEmployee || !startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return null;
    }

    // Filter work days within the selected period
    const filteredWorkDays = selectedEmployee.workDays.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= start && dayDate <= end;
    });

    // Calculate totals
    const totalHours = filteredWorkDays.reduce((sum, day) => sum + day.totalHours, 0);
    const totalSessions = filteredWorkDays.reduce((sum, day) => sum + day.sessions.length, 0);
    const daysWorked = filteredWorkDays.length;

    // Calculate hourly rate
    const totalMonthlyHours = selectedEmployee.workingDaysPerMonth * selectedEmployee.workingHoursPerDay;
    const hourlyRate = selectedEmployee.monthlySalary / totalMonthlyHours;

    // Calculate salary for the period
    const calculatedAmount = totalHours * hourlyRate;

    // Calculate expected hours for the period (business days only)
    const expectedDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const expectedWorkingDays = Math.min(expectedDays, selectedEmployee.workingDaysPerMonth);
    const expectedHours = expectedWorkingDays * selectedEmployee.workingHoursPerDay;

    // Calculate overtime (hours beyond expected per day)
    let overtimeHours = 0;
    filteredWorkDays.forEach(day => {
      if (day.totalHours > selectedEmployee.workingHoursPerDay) {
        overtimeHours += day.totalHours - selectedEmployee.workingHoursPerDay;
      }
    });

    const regularHours = totalHours - overtimeHours;
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * 1.5; // 1.5x for overtime

    return {
      totalHours: totalHours.toFixed(2),
      daysWorked,
      totalSessions,
      hourlyRate: hourlyRate.toFixed(2),
      regularHours: regularHours.toFixed(2),
      overtimeHours: overtimeHours.toFixed(2),
      regularPay: regularPay.toFixed(2),
      overtimePay: overtimePay.toFixed(2),
      totalSalary: (regularPay + overtimePay).toFixed(2),
      workDays: filteredWorkDays
    };
  }, [selectedEmployee, startDate, endDate]);

  return (
    <Card className="bg-card border-border p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Salary Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Select Employee</Label>
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger className="bg-background border-input">
              <SelectValue placeholder="Choose an employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background border-input"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background border-input"
          />
        </div>
      </div>

      {selectedEmployee && calculatedSalary && (
        <>
          <Separator className="my-6" />
          
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <User className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">{selectedEmployee.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Monthly Salary: ${selectedEmployee.monthlySalary.toLocaleString()} | 
                  Hourly Rate: ${calculatedSalary.hourlyRate}/hr
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-500/10 border-blue-500/20 p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Days Worked</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{calculatedSalary.daysWorked}</p>
              </Card>

              <Card className="bg-green-500/10 border-green-500/20 p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Total Hours</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{calculatedSalary.totalHours}</p>
              </Card>

              <Card className="bg-orange-500/10 border-orange-500/20 p-4">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Overtime Hours</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{calculatedSalary.overtimeHours}</p>
              </Card>

              <Card className="bg-primary/10 border-primary/20 p-4">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm font-medium">Total Salary</span>
                </div>
                <p className="text-2xl font-bold text-foreground">${calculatedSalary.totalSalary}</p>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card className="bg-muted/30 border-border p-4">
              <h4 className="font-semibold text-foreground mb-4">Payment Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Regular Hours ({calculatedSalary.regularHours} hrs × ${calculatedSalary.hourlyRate})</span>
                  <span className="font-medium text-foreground">${calculatedSalary.regularPay}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Overtime ({calculatedSalary.overtimeHours} hrs × ${calculatedSalary.hourlyRate} × 1.5)</span>
                  <span className="font-medium text-orange-400">${calculatedSalary.overtimePay}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total Payable</span>
                  <span className="text-xl font-bold text-primary">${calculatedSalary.totalSalary}</span>
                </div>
              </div>
            </Card>

            {/* Work Days Details */}
            {calculatedSalary.workDays.length > 0 && (
              <Card className="bg-muted/30 border-border p-4">
                <h4 className="font-semibold text-foreground mb-4">Work Sessions Detail</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {calculatedSalary.workDays.map((day, index) => (
                    <div key={index} className="p-3 bg-background/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground">{new Date(day.date).toLocaleDateString()}</span>
                        <span className="text-sm text-muted-foreground">{day.totalHours.toFixed(2)} hrs - ${day.totalEarnings.toFixed(2)}</span>
                      </div>
                      <div className="space-y-1">
                        {day.sessions.map((session, sIndex) => (
                          <div key={sIndex} className="text-sm text-muted-foreground flex justify-between">
                            <span>{session.checkInTime} - {session.checkOutTime}</span>
                            <span>{session.hoursWorked.toFixed(2)} hrs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </>
      )}

      {selectedEmployee && !calculatedSalary && startDate && endDate && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No work sessions found for the selected period.</p>
        </div>
      )}

      {!selectedEmployee && (
        <div className="text-center py-8 text-muted-foreground">
          <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select an employee and date range to calculate salary.</p>
        </div>
      )}
    </Card>
  );
};
