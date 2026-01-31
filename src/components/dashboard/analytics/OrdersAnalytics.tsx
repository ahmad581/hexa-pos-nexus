import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

type PeriodType = "today" | "week" | "month";

export const OrdersAnalytics = () => {
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

  const { data: ordersData = [], isLoading } = useQuery({
    queryKey: ['orders-analytics', selectedBranch, periodType],
    queryFn: async () => {
      const { start, end } = getDateRange();
      
      let query = supabase
        .from('orders')
        .select('id, status, total_amount, created_at, branch_id')
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
    const total = ordersData.length;
    const completed = ordersData.filter(o => o.status === 'completed').length;
    const pending = ordersData.filter(o => o.status === 'pending').length;
    const revenue = ordersData.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const avgOrderValue = total > 0 ? revenue / total : 0;
    
    return { total, completed, pending, revenue, avgOrderValue };
  }, [ordersData]);

  const chartData = useMemo(() => {
    const { start, end } = getDateRange();
    const groupedData: Record<string, { period: string; orders: number; revenue: number }> = {};

    const getGroupKey = (date: Date) => {
      if (periodType === "today") return format(date, "HH:00");
      if (periodType === "week") return format(date, "EEE");
      return format(date, "MMM d");
    };

    ordersData.forEach(order => {
      const orderDate = new Date(order.created_at);
      const key = getGroupKey(orderDate);
      
      if (!groupedData[key]) {
        groupedData[key] = { period: key, orders: 0, revenue: 0 };
      }
      
      groupedData[key].orders += 1;
      groupedData[key].revenue += order.total_amount || 0;
    });

    return Object.values(groupedData);
  }, [ordersData, periodType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Orders Analytics</h3>
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
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.revenue)}</p>
        </Card>
      </div>

      <Card className="p-4 border border-border/50">
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No order data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
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
              <Bar dataKey="orders" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};
