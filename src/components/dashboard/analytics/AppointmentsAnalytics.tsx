import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

type PeriodType = "today" | "week" | "month";

export const AppointmentsAnalytics = () => {
  const { branches, selectedBranch: contextBranch } = useBranch();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [periodType, setPeriodType] = useState<PeriodType>("week");
  const { formatCurrency } = useCurrency();

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

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments-analytics', selectedBranch, periodType],
    queryFn: async () => {
      const { start, end } = getDateRange();
      
      let query = supabase
        .from('appointments')
        .select('id, service_type, status, duration, price, appointment_date, branch_id')
        .gte('appointment_date', start.toISOString())
        .lte('appointment_date', end.toISOString());
      
      if (selectedBranch !== "all") {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const stats = useMemo(() => {
    const total = appointments.length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const revenue = appointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.price || 0), 0);
    
    return { total, scheduled, completed, cancelled, revenue };
  }, [appointments]);

  const chartData = useMemo(() => {
    const groupedData: Record<string, { period: string; appointments: number }> = {};

    const getGroupKey = (date: Date) => {
      if (periodType === "today") return format(date, "HH:00");
      if (periodType === "week") return format(date, "EEE");
      return format(date, "MMM d");
    };

    appointments.forEach(apt => {
      const aptDate = new Date(apt.appointment_date);
      const key = getGroupKey(aptDate);
      
      if (!groupedData[key]) {
        groupedData[key] = { period: key, appointments: 0 };
      }
      
      groupedData[key].appointments += 1;
    });

    return Object.values(groupedData);
  }, [appointments, periodType]);

  const pieData = [
    { name: 'Scheduled', value: stats.scheduled, color: 'hsl(217 91% 60%)' },
    { name: 'Completed', value: stats.completed, color: 'hsl(152 69% 45%)' },
    { name: 'Cancelled', value: stats.cancelled, color: 'hsl(0 84% 60%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Calendar className="w-5 h-5 text-cyan-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Appointments Analytics</h3>
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
        <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Appointments</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Scheduled</p>
          <p className="text-2xl font-bold text-foreground">{stats.scheduled}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.revenue)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Appointment Volume</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No appointments for this period
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
                />
                <Bar dataKey="appointments" fill="hsl(187 92% 45%)" radius={[4, 4, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Appointment Status</h4>
          {pieData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No appointment data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
};
