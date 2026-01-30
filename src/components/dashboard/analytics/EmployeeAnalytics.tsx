import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, UserCheck, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

type PeriodType = "today" | "week" | "month";

export const EmployeeAnalytics = () => {
  const { branches, selectedBranch: contextBranch } = useBranch();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [periodType, setPeriodType] = useState<PeriodType>("week");

  const getDateRange = () => {
    const now = new Date();
    switch (periodType) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) };
    }
  };

  const branchFilter = selectedBranch !== "all" ? selectedBranch : contextBranch?.id;

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employee-analytics', branchFilter],
    queryFn: async () => {
      let query = supabase.from('employees').select('id, first_name, last_name, is_active, salary, hourly_rate');
      
      if (branchFilter) {
        query = query.eq('branch_id', branchFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: workSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['work-sessions-analytics', branchFilter, periodType],
    queryFn: async () => {
      const { start, end } = getDateRange();
      
      let query = supabase
        .from('employee_work_sessions')
        .select('id, employee_id, check_in_time, check_out_time, break_duration')
        .gte('check_in_time', start.toISOString())
        .lte('check_in_time', end.toISOString());
      
      if (branchFilter) {
        query = query.eq('branch_id', branchFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.is_active).length;
    const inactive = total - active;
    
    // Calculate total hours worked this period
    let totalHours = 0;
    workSessions.forEach(session => {
      if (session.check_out_time) {
        const checkIn = new Date(session.check_in_time);
        const checkOut = new Date(session.check_out_time);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        const breakHours = (session.break_duration || 0) / 60;
        totalHours += hours - breakHours;
      }
    });
    
    // Total payroll estimate
    const totalPayroll = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
    
    return { total, active, inactive, totalHours: Math.round(totalHours * 10) / 10, totalPayroll };
  }, [employees, workSessions]);

  const chartData = useMemo(() => {
    const getGroupKey = (date: Date) => {
      if (periodType === "today") return format(date, "HH:00");
      if (periodType === "week") return format(date, "EEE");
      return format(date, "MMM d");
    };

    const groupedData: Record<string, number> = {};
    
    workSessions.forEach(session => {
      const key = getGroupKey(new Date(session.check_in_time));
      if (!groupedData[key]) groupedData[key] = 0;
      
      if (session.check_out_time) {
        const checkIn = new Date(session.check_in_time);
        const checkOut = new Date(session.check_out_time);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        groupedData[key] += hours;
      }
    });
    
    return Object.entries(groupedData).map(([period, hours]) => ({ 
      period, 
      hours: Math.round(hours * 10) / 10 
    }));
  }, [workSessions, periodType]);

  const isLoading = loadingEmployees || loadingSessions;

  const periodLabel = periodType === "today" ? "Today" : periodType === "week" ? "This Week" : "This Month";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Employee Analytics</h3>
        </div>
        <div className="flex gap-2">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Employees</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-foreground">{stats.active}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Hours {periodLabel}</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalHours}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Monthly Payroll</p>
          <p className="text-2xl font-bold text-foreground">${stats.totalPayroll.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="p-4 border border-border/50">
        <h4 className="text-sm font-medium text-foreground mb-3">Work Hours {periodLabel}</h4>
        {isLoading ? (
          <div className="h-[180px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[180px] flex items-center justify-center text-muted-foreground">
            No work session data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value} hrs`, 'Hours']}
              />
              <Bar dataKey="hours" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};
