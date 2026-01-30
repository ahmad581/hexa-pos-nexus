import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const InventoryAnalytics = () => {
  const { userProfile } = useAuth();
  const { branches } = useBranch();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ['inventory-analytics', userProfile?.business_id, selectedBranch],
    queryFn: async () => {
      let query = supabase
        .from('inventory_items')
        .select('id, name, current_stock, min_stock, max_stock, status, category');
      
      if (userProfile?.business_id) {
        query = query.eq('business_id', userProfile.business_id);
      }
      
      if (selectedBranch !== "all") {
        query = query.eq('branch_id', selectedBranch);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userProfile?.business_id
  });

  const categories = useMemo(() => {
    return [...new Set(inventoryData.map(i => i.category))];
  }, [inventoryData]);

  const filteredInventory = useMemo(() => {
    let result = inventoryData;
    if (statusFilter !== "all") {
      result = result.filter(i => i.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter(i => i.category === categoryFilter);
    }
    return result;
  }, [inventoryData, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = inventoryData.length;
    const lowStock = inventoryData.filter(i => i.status === 'Low Stock').length;
    const outOfStock = inventoryData.filter(i => i.status === 'Out of Stock').length;
    const normal = inventoryData.filter(i => i.status === 'Normal').length;
    const overstock = inventoryData.filter(i => i.status === 'Overstock').length;
    
    return { total, lowStock, outOfStock, normal, overstock, filtered: filteredInventory.length };
  }, [inventoryData, filteredInventory]);

  const chartData = [
    { name: 'Normal', value: stats.normal, color: 'hsl(152 69% 45%)' },
    { name: 'Low Stock', value: stats.lowStock, color: 'hsl(38 92% 50%)' },
    { name: 'Out of Stock', value: stats.outOfStock, color: 'hsl(0 84% 60%)' },
    { name: 'Overstock', value: stats.overstock, color: 'hsl(217 91% 60%)' },
  ].filter(d => d.value > 0);

  const lowStockItems = filteredInventory
    .filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock')
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Inventory Analytics</h3>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
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
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              <SelectItem value="Overstock">Overstock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Items</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Normal Stock</p>
          <p className="text-2xl font-bold text-foreground">{stats.normal}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold text-foreground">{stats.lowStock}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Out of Stock</p>
          <p className="text-2xl font-bold text-foreground">{stats.outOfStock}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Stock Distribution</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No inventory data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
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

        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Items Needing Attention</h4>
          {lowStockItems.length === 0 ? (
            <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <span className="text-sm">All items are well stocked</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${item.status === 'Out of Stock' ? 'text-red-500' : 'text-amber-500'}`} />
                    <span className="text-sm text-foreground truncate max-w-[150px]">{item.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.current_stock}/{item.min_stock}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
