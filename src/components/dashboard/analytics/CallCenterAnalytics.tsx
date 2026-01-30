import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

type PeriodType = "today" | "week" | "month";

export const CallCenterAnalytics = () => {
  const { userProfile } = useAuth();
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

  const { data: callHistory = [], isLoading } = useQuery({
    queryKey: ['call-center-analytics', userProfile?.business_id, periodType],
    queryFn: async () => {
      if (!userProfile?.business_id) return [];
      
      const { start, end } = getDateRange();
      
      const { data, error } = await supabase
        .from('call_history')
        .select('id, call_type, direction, status, duration_seconds, created_at')
        .eq('business_id', userProfile.business_id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.business_id
  });

  const stats = useMemo(() => {
    const total = callHistory.length;
    const inbound = callHistory.filter(c => c.direction === 'inbound').length;
    const outbound = callHistory.filter(c => c.direction === 'outbound').length;
    const completed = callHistory.filter(c => c.status === 'completed').length;
    const missed = callHistory.filter(c => c.status === 'missed' || c.status === 'no-answer').length;
    
    // Average call duration
    const completedCalls = callHistory.filter(c => c.duration_seconds && c.duration_seconds > 0);
    const avgDuration = completedCalls.length > 0 
      ? completedCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / completedCalls.length 
      : 0;
    
    return { total, inbound, outbound, completed, missed, avgDuration: Math.round(avgDuration) };
  }, [callHistory]);

  const chartData = useMemo(() => {
    const groupedData: Record<string, { period: string; inbound: number; outbound: number }> = {};

    const getGroupKey = (date: Date) => {
      if (periodType === "today") return format(date, "HH:00");
      if (periodType === "week") return format(date, "EEE");
      return format(date, "MMM d");
    };

    callHistory.forEach(call => {
      const callDate = new Date(call.created_at);
      const key = getGroupKey(callDate);
      
      if (!groupedData[key]) {
        groupedData[key] = { period: key, inbound: 0, outbound: 0 };
      }
      
      if (call.direction === 'inbound') {
        groupedData[key].inbound += 1;
      } else {
        groupedData[key].outbound += 1;
      }
    });

    return Object.values(groupedData);
  }, [callHistory, periodType]);

  const pieData = [
    { name: 'Completed', value: stats.completed, color: 'hsl(152 69% 45%)' },
    { name: 'Missed', value: stats.missed, color: 'hsl(0 84% 60%)' },
  ].filter(d => d.value > 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-500/20">
            <Phone className="w-5 h-5 text-teal-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Call Center Analytics</h3>
        </div>
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-teal-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Calls</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <div className="flex items-center gap-1 mb-1">
            <PhoneIncoming className="w-3 h-3 text-blue-500" />
            <p className="text-xs text-muted-foreground">Inbound</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.inbound}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <div className="flex items-center gap-1 mb-1">
            <PhoneOutgoing className="w-3 h-3 text-emerald-500" />
            <p className="text-xs text-muted-foreground">Outbound</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.outbound}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-0">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-purple-500" />
            <p className="text-xs text-muted-foreground">Avg Duration</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatDuration(stats.avgDuration)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Call Volume</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No call data for this period
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
                <Bar dataKey="inbound" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} name="Inbound" />
                <Bar dataKey="outbound" fill="hsl(152 69% 45%)" radius={[4, 4, 0, 0]} name="Outbound" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Call Status</h4>
          {pieData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No call data
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
