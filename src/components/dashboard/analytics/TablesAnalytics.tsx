import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LayoutGrid, Users, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export const TablesAnalytics = () => {
  const { selectedBranch } = useBranch();

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables-analytics', selectedBranch?.id],
    queryFn: async () => {
      let query = supabase.from('rooms').select('id, room_number, status, capacity, floor_number');
      
      if (selectedBranch?.id) {
        query = query.eq('branch_id', selectedBranch.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter(t => t.status === 'available').length;
    const occupied = tables.filter(t => t.status === 'occupied').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
    
    return { total, available, occupied, reserved, totalCapacity };
  }, [tables]);

  const chartData = [
    { name: 'Available', value: stats.available, color: 'hsl(152 69% 45%)' },
    { name: 'Occupied', value: stats.occupied, color: 'hsl(0 84% 60%)' },
    { name: 'Reserved', value: stats.reserved, color: 'hsl(38 92% 50%)' },
  ].filter(d => d.value > 0);

  const occupancyRate = stats.total > 0 
    ? Math.round((stats.occupied / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <LayoutGrid className="w-5 h-5 text-indigo-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Tables Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Tables</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-foreground">{stats.available}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Occupied</p>
          <p className="text-2xl font-bold text-foreground">{stats.occupied}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Capacity</p>
          <p className="text-2xl font-bold text-foreground">{stats.totalCapacity}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Table Status</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No table data
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
          <h4 className="text-sm font-medium text-foreground mb-3">Occupancy Rate</h4>
          <div className="h-[180px] flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={occupancyRate > 80 ? 'hsl(0 84% 60%)' : occupancyRate > 50 ? 'hsl(38 92% 50%)' : 'hsl(152 69% 45%)'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${occupancyRate * 2.51} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{occupancyRate}%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Current Occupancy</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
