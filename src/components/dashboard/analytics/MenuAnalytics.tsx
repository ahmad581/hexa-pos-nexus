import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { UtensilsCrossed, TrendingUp, Star, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

export const MenuAnalytics = () => {
  const { selectedBranch } = useBranch();

  const { data: menuItems = [], isLoading: loadingMenu } = useQuery({
    queryKey: ['menu-analytics', selectedBranch?.id],
    queryFn: async () => {
      let query = supabase.from('menu_items').select('id, name, price, category, is_available');
      
      if (selectedBranch?.id) {
        query = query.eq('branch_id', selectedBranch.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: orderItems = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['menu-order-items', selectedBranch?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('menu_item_id, product_name, quantity, total_price');
      
      if (error) throw error;
      return data || [];
    }
  });

  const stats = useMemo(() => {
    const total = menuItems.length;
    const available = menuItems.filter(m => m.is_available).length;
    const unavailable = total - available;
    const categories = [...new Set(menuItems.map(m => m.category))].length;
    const avgPrice = total > 0 ? menuItems.reduce((sum, m) => sum + (m.price || 0), 0) / total : 0;
    
    return { total, available, unavailable, categories, avgPrice };
  }, [menuItems]);

  const topSellingItems = useMemo(() => {
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    orderItems.forEach(item => {
      const key = item.menu_item_id || item.product_name;
      if (!itemSales[key]) {
        itemSales[key] = { name: item.product_name, quantity: 0, revenue: 0 };
      }
      itemSales[key].quantity += item.quantity;
      itemSales[key].revenue += item.total_price || 0;
    });
    
    return Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orderItems]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    menuItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  }, [menuItems]);

  const isLoading = loadingMenu || loadingOrders;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-rose-500/20">
          <UtensilsCrossed className="w-5 h-5 text-rose-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Menu Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-rose-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-foreground">{stats.available}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold text-foreground">{stats.categories}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Avg Price</p>
          <p className="text-2xl font-bold text-foreground">${stats.avgPrice.toFixed(2)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Items by Category</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No menu items
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="hsl(346 77% 50%)" radius={[0, 4, 4, 0]} name="Items" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Top Selling Items
          </h4>
          {topSellingItems.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No sales data yet
            </div>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {topSellingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{index + 1}</span>
                    <span className="text-sm text-foreground truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{item.quantity} sold</p>
                    <p className="text-xs text-muted-foreground">${item.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
