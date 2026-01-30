import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill, FileText, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

type PeriodType = "today" | "week" | "month";

export const PrescriptionsAnalytics = () => {
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

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions-analytics', selectedBranch, periodType],
    queryFn: async () => {
      const { start, end } = getDateRange();
      
      let query = supabase
        .from('prescriptions')
        .select('id, medication_name, status, quantity, created_at, branch_id')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      
      if (selectedBranch !== "all") {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const stats = useMemo(() => {
    const total = prescriptions.length;
    const pending = prescriptions.filter(p => p.status === 'pending').length;
    const filled = prescriptions.filter(p => p.status === 'filled').length;
    const ready = prescriptions.filter(p => p.status === 'ready').length;
    
    return { total, pending, filled, ready };
  }, [prescriptions]);

  const chartData = useMemo(() => {
    const groupedData: Record<string, { period: string; prescriptions: number }> = {};

    const getGroupKey = (date: Date) => {
      if (periodType === "today") return format(date, "HH:00");
      if (periodType === "week") return format(date, "EEE");
      return format(date, "MMM d");
    };

    prescriptions.forEach(rx => {
      const rxDate = new Date(rx.created_at);
      const key = getGroupKey(rxDate);
      
      if (!groupedData[key]) {
        groupedData[key] = { period: key, prescriptions: 0 };
      }
      
      groupedData[key].prescriptions += 1;
    });

    return Object.values(groupedData);
  }, [prescriptions, periodType]);

  const pieData = [
    { name: 'Pending', value: stats.pending, color: 'hsl(38 92% 50%)' },
    { name: 'Filled', value: stats.filled, color: 'hsl(152 69% 45%)' },
    { name: 'Ready', value: stats.ready, color: 'hsl(217 91% 60%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <Pill className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Prescriptions Analytics</h3>
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
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Prescriptions</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Filled</p>
          <p className="text-2xl font-bold text-foreground">{stats.filled}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Ready for Pickup</p>
          <p className="text-2xl font-bold text-foreground">{stats.ready}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Prescription Volume</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No prescriptions for this period
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
                <Bar dataKey="prescriptions" fill="hsl(152 69% 45%)" radius={[4, 4, 0, 0]} name="Prescriptions" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Prescription Status</h4>
          {pieData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No prescription data
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
