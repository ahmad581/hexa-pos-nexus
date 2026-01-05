import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, Legend } from "recharts";
import { Download, Filter, BarChart3, LineChartIcon } from "lucide-react";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useBranch } from "@/contexts/BranchContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from "date-fns";

type ChartType = "bar" | "line";

type OrderMetric = "total" | "completed" | "pending" | "cancelled" | "updated";

type PeriodType = "today" | "week" | "month" | "custom";

export const Dashboard = () => {
  const { selectedBusinessType } = useBusinessType();
  const { branches, selectedBranch: contextBranch } = useBranch();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Filter states
  const [orderMetric, setOrderMetric] = useState<OrderMetric>("total");
  const [selectedItem, setSelectedItem] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [periodType, setPeriodType] = useState<PeriodType>("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customStartTime, setCustomStartTime] = useState("00:00");
  const [customEndTime, setCustomEndTime] = useState("23:59");
  const [chartType, setChartType] = useState<ChartType>("bar");

  const businessTerms = selectedBusinessType?.terminology || {
    service: 'Item',
    services: 'Items'
  };

  // Get date range based on period type
  const getDateRange = () => {
    const now = new Date();
    switch (periodType) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "custom":
        if (customStartDate && customEndDate) {
          const start = parseISO(`${customStartDate}T${customStartTime}`);
          const end = parseISO(`${customEndDate}T${customEndTime}`);
          return { start, end };
        }
        return { start: startOfWeek(now), end: endOfWeek(now) };
      default:
        return { start: startOfWeek(now), end: endOfWeek(now) };
    }
  };

  // Fetch menu items for the item filter
  const { data: menuItems = [] } = useQuery({
    queryKey: ['dashboard-menu-items', selectedBranch],
    queryFn: async () => {
      let query = supabase.from('menu_items').select('id, name, category');
      
      if (selectedBranch !== "all") {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch orders data
  const { data: ordersData = [], isLoading } = useQuery({
    queryKey: ['dashboard-orders', selectedBranch, periodType, customStartDate, customEndDate, customStartTime, customEndTime],
    queryFn: async () => {
      const { start, end } = getDateRange();
      
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          updated_at,
          branch_id,
          order_items (
            id,
            product_name,
            quantity,
            total_price,
            menu_item_id
          )
        `)
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

  // Process chart data
  const chartData = useMemo(() => {
    if (!ordersData.length) return [];

    // Filter orders by selected item
    let filteredOrders = ordersData;
    if (selectedItem !== "all") {
      filteredOrders = ordersData.filter(order => 
        order.order_items?.some((item: any) => 
          item.menu_item_id === selectedItem || item.product_name.toLowerCase() === selectedItem.toLowerCase()
        )
      );
    }

    // Filter by order metric
    const filterByMetric = (orders: typeof filteredOrders) => {
      switch (orderMetric) {
        case "completed":
          return orders.filter(o => o.status === 'completed');
        case "pending":
          return orders.filter(o => o.status === 'pending');
        case "cancelled":
          return orders.filter(o => o.status === 'cancelled');
        case "updated":
          return orders.filter(o => o.updated_at !== o.created_at);
        default:
          return orders;
      }
    };

    const metricFilteredOrders = filterByMetric(filteredOrders);

    // Group by period
    const { start, end } = getDateRange();
    const groupedData: Record<string, { period: string; orders: number; revenue: number }> = {};

    // Determine grouping format based on period
    const getGroupKey = (date: Date) => {
      if (periodType === "today") {
        return format(date, "HH:00");
      } else if (periodType === "week") {
        return format(date, "EEE");
      } else if (periodType === "month") {
        return format(date, "MMM d");
      } else {
        // For custom, use appropriate grouping
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          return format(date, "HH:00");
        } else if (diffDays <= 7) {
          return format(date, "EEE");
        } else {
          return format(date, "MMM d");
        }
      }
    };

    metricFilteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const key = getGroupKey(orderDate);
      
      if (!groupedData[key]) {
        groupedData[key] = { period: key, orders: 0, revenue: 0 };
      }
      
      groupedData[key].orders += 1;
      
      // Calculate revenue for selected item or total
      if (selectedItem !== "all") {
        const itemRevenue = order.order_items
          ?.filter((item: any) => item.menu_item_id === selectedItem || item.product_name.toLowerCase() === selectedItem.toLowerCase())
          .reduce((sum: number, item: any) => sum + (item.total_price || 0), 0) || 0;
        groupedData[key].revenue += itemRevenue;
      } else {
        groupedData[key].revenue += order.total_amount || 0;
      }
    });

    return Object.values(groupedData).sort((a, b) => {
      // Sort by period appropriately
      if (periodType === "today" || (periodType === "custom" && a.period.includes(":"))) {
        return parseInt(a.period) - parseInt(b.period);
      }
      return 0;
    });
  }, [ordersData, selectedItem, orderMetric, periodType]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { totalOrders, totalRevenue, avgOrderValue };
  }, [chartData]);

  const exportReport = () => {
    const csvContent = [
      ["Period", "Orders", "Revenue"],
      ...chartData.map(item => [item.period, item.orders, item.revenue.toFixed(2)])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-report-${orderMetric}-${periodType}-${Date.now()}.csv`;
    a.click();
    toast({ title: "Report exported successfully!" });
  };

  const getMetricLabel = () => {
    switch (orderMetric) {
      case "total": return "Total Orders";
      case "completed": return "Completed Orders";
      case "pending": return "Pending Orders";
      case "cancelled": return "Cancelled Orders";
      case "updated": return "Updated Orders";
      default: return "Orders";
    }
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.overview')}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChartType("bar")}
              className={`rounded-none ${chartType === "bar" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <BarChart3 size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChartType("line")}
              className={`rounded-none ${chartType === "line" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <LineChartIcon size={18} />
            </Button>
          </div>
          <Button onClick={exportReport} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Stats - Moved to top for better visual impact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">{getMetricLabel()}</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{summaryStats.totalOrders}</p>
          </div>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold text-foreground">${summaryStats.totalRevenue.toFixed(2)}</p>
          </div>
        </Card>
        
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm font-medium">Avg Order Value</p>
            </div>
            <p className="text-3xl font-bold text-foreground">${summaryStats.avgOrderValue.toFixed(2)}</p>
          </div>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg bg-muted">
              <Filter size={16} className="text-muted-foreground" />
            </div>
            <span className="text-foreground font-semibold">Chart Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Order Metric Filter */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Order Status</Label>
              <Select value={orderMetric} onValueChange={(v) => setOrderMetric(v as OrderMetric)}>
                <SelectTrigger className="bg-background/50 border-border/50 h-11">
                  <SelectValue placeholder="Select metric" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="total">Total Orders</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Item Filter */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">{businessTerms.services}</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="bg-background/50 border-border/50 h-11">
                  <SelectValue placeholder={`Select ${businessTerms.service.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All {businessTerms.services}</SelectItem>
                  {menuItems.map((item: any) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch Filter */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="bg-background/50 border-border/50 h-11">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period Filter */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Period</Label>
              <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                <SelectTrigger className="bg-background/50 border-border/50 h-11">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date/Time Range */}
          {periodType === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border/50">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Start Date</Label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-background/50 border-border/50 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">Start Time</Label>
                <Input
                  type="time"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="bg-background/50 border-border/50 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">End Date</Label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-background/50 border-border/50 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-medium uppercase tracking-wide">End Time</Label>
                <Input
                  type="time"
                  value={customEndTime}
                  onChange={(e) => setCustomEndTime(e.target.value)}
                  className="bg-background/50 border-border/50 h-11"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Main Chart */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {getMetricLabel()} {selectedItem !== "all" && `- ${menuItems.find((i: any) => i.id === selectedItem)?.name || selectedItem}`}
            </h3>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              {periodType === "custom" && customStartDate && customEndDate
                ? `${customStartDate} ${customStartTime} - ${customEndDate} ${customEndTime}`
                : periodType.charAt(0).toUpperCase() + periodType.slice(1)}
            </span>
          </div>
          
          {isLoading ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
              <span>Loading chart data...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3">
              <div className="p-4 rounded-full bg-muted/50">
                <BarChart3 className="w-8 h-8" />
              </div>
              <span>No data available for the selected filters</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="hsl(var(--muted-foreground))" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="hsl(var(--muted-foreground))" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar 
                    yAxisId="left" 
                    dataKey="orders" 
                    fill="hsl(217 91% 60%)" 
                    radius={[6, 6, 0, 0]} 
                    name="Orders" 
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="revenue" 
                    fill="hsl(152 69% 45%)" 
                    radius={[6, 6, 0, 0]} 
                    name="Revenue ($)" 
                  />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    stroke="hsl(var(--muted-foreground))" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="hsl(var(--muted-foreground))" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="hsl(var(--muted-foreground))" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="hsl(217 91% 60%)" 
                    strokeWidth={3} 
                    dot={{ fill: 'hsl(217 91% 60%)', strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Orders" 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(152 69% 45%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(152 69% 45%)', strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Revenue ($)" 
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
};
