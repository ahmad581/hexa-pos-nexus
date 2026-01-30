import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Users, Clock, UserCheck, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { format, startOfWeek, endOfWeek } from "date-fns";

export const EmployeeAnalytics = () => {
  const { selectedBranch } = useBranch();

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employee-analytics', selectedBranch?.id],
    queryFn: async () => {
      let query = supabase.from('employees').select('id, first_name, last_name, is_active, salary, hourly_rate');
      
      if (selectedBranch?.id) {
        query = query.eq('branch_id', selectedBranch.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: workSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['work-sessions-analytics', selectedBranch?.id],
    queryFn: async () => {
      const now = new Date();
      const start = startOfWeek(now);
      const end = endOfWeek(now);
      
      let query = supabase
        .from('employee_work_sessions')
        .select('id, employee_id, check_in_time, check_out_time, break_duration')
        .gte('check_in_time', start.toISOString())
        .lte('check_in_time', end.toISOString());
      
      if (selectedBranch?.id) {
        query = query.eq('branch_id', selectedBranch.id);
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
    
    // Calculate total hours worked this week
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
    const dayData: Record<string, number> = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(d => dayData[d] = 0);
    
    workSessions.forEach(session => {
      const day = format(new Date(session.check_in_time), 'EEE');
      if (session.check_out_time) {
        const checkIn = new Date(session.check_in_time);
        const checkOut = new Date(session.check_out_time);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        dayData[day] += hours;
      }
    });
    
    return days.map(d => ({ day: d, hours: Math.round(dayData[d] * 10) / 10 }));
  }, [workSessions]);

  const isLoading = loadingEmployees || loadingSessions;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-violet-500/20">
          <Users className="w-5 h-5 text-violet-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Employee Analytics</h3>
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
          <p className="text-xs text-muted-foreground">Hours This Week</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalHours}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Monthly Payroll</p>
          <p className="text-2xl font-bold text-foreground">${stats.totalPayroll.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="p-4 border border-border/50">
        <h4 className="text-sm font-medium text-foreground mb-3">Work Hours This Week</h4>
        {isLoading ? (
          <div className="h-[180px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
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
