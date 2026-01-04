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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.overview')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={chartType === "bar" ? "default" : "outline"}
            size="icon"
            onClick={() => setChartType("bar")}
          >
            <BarChart3 size={18} />
          </Button>
          <Button
            variant={chartType === "line" ? "default" : "outline"}
            size="icon"
            onClick={() => setChartType("line")}
          >
            <LineChartIcon size={18} />
          </Button>
          <Button onClick={exportReport} className="bg-primary hover:bg-primary/90">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} className="text-muted-foreground" />
          <span className="text-foreground font-medium">Chart Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Order Metric Filter */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Order Status</Label>
            <Select value={orderMetric} onValueChange={(v) => setOrderMetric(v as OrderMetric)}>
              <SelectTrigger className="bg-background border-border">
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
            <Label className="text-muted-foreground text-sm">{businessTerms.services}</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger className="bg-background border-border">
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
            <Label className="text-muted-foreground text-sm">Branch</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="bg-background border-border">
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
            <Label className="text-muted-foreground text-sm">Period</Label>
            <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
              <SelectTrigger className="bg-background border-border">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Start Date</Label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Start Time</Label>
              <Input
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">End Date</Label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">End Time</Label>
              <Input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border p-4">
          <p className="text-muted-foreground text-sm">{getMetricLabel()}</p>
          <p className="text-2xl font-bold text-foreground">{summaryStats.totalOrders}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-muted-foreground text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground">${summaryStats.totalRevenue.toFixed(2)}</p>
        </Card>
        <Card className="bg-card border-border p-4">
          <p className="text-muted-foreground text-sm">Avg Order Value</p>
          <p className="text-2xl font-bold text-foreground">${summaryStats.avgOrderValue.toFixed(2)}</p>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="bg-card border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            {getMetricLabel()} {selectedItem !== "all" && `- ${menuItems.find((i: any) => i.id === selectedItem)?.name || selectedItem}`}
          </h3>
          <span className="text-sm text-muted-foreground">
            {periodType === "custom" && customStartDate && customEndDate
              ? `${customStartDate} ${customStartTime} - ${customEndDate} ${customEndTime}`
              : periodType.charAt(0).toUpperCase() + periodType.slice(1)}
          </span>
        </div>
        
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No data available for the selected filters
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" name="Orders" fill="hsl(var(--primary))" radius={4} />
                <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="orders" name="Orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};
