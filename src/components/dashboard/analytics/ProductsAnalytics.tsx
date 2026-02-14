import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const ProductsAnalytics = () => {
  const { branches, selectedBranch: contextBranch } = useBranch();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");

  const branchFilter = selectedBranch !== "all" ? selectedBranch : contextBranch?.id;

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-analytics', branchFilter],
    queryFn: async () => {
      let query = supabase.from('retail_products').select('id, name, selling_price, cost_price, category, stock_quantity, min_stock, is_active');
      
      if (branchFilter) {
        query = query.eq('branch_id', branchFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(p => ({
        ...p,
        price: p.selling_price,
        cost: p.cost_price,
        stock_quantity: p.stock_quantity,
        min_stock_level: p.min_stock,
      }));
    }
  });

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (categoryFilter !== "all") {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    if (stockStatusFilter !== "all") {
      if (stockStatusFilter === "in_stock") {
        result = result.filter(p => p.stock_quantity > p.min_stock_level);
      } else if (stockStatusFilter === "low_stock") {
        result = result.filter(p => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0);
      } else if (stockStatusFilter === "out_of_stock") {
        result = result.filter(p => p.stock_quantity === 0);
      }
    }
    
    return result;
  }, [products, categoryFilter, stockStatusFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.is_active).length;
    const lowStock = products.filter(p => p.stock_quantity <= p.min_stock_level).length;
    const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);
    
    return { total, active, lowStock, totalValue, filtered: filteredProducts.length };
  }, [products, filteredProducts]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredProducts.forEach(p => {
      cats[p.category] = (cats[p.category] || 0) + 1;
    });
    return Object.entries(cats).map(([name, count]) => ({ name, count }));
  }, [filteredProducts]);

  const stockStatusData = [
    { name: 'In Stock', value: products.filter(p => p.stock_quantity > p.min_stock_level).length, color: 'hsl(152 69% 45%)' },
    { name: 'Low Stock', value: products.filter(p => p.stock_quantity <= p.min_stock_level && p.stock_quantity > 0).length, color: 'hsl(38 92% 50%)' },
    { name: 'Out of Stock', value: products.filter(p => p.stock_quantity === 0).length, color: 'hsl(0 84% 60%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-pink-500/20">
            <Tag className="w-5 h-5 text-pink-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Products Analytics</h3>
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
          <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-pink-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Products</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-foreground">{stats.active}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold text-foreground">{stats.lowStock}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Inventory Value</p>
          <p className="text-2xl font-bold text-foreground">${stats.totalValue.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Products by Category</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No product data
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
                <Bar dataKey="count" fill="hsl(330 80% 60%)" radius={[0, 4, 4, 0]} name="Products" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Stock Status</h4>
          {stockStatusData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No product data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
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
