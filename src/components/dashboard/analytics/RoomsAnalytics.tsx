import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Hotel, BedDouble, DollarSign, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const RoomsAnalytics = () => {
  const { selectedBranch } = useBranch();

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms-analytics', selectedBranch?.id],
    queryFn: async () => {
      let query = supabase.from('rooms').select('id, room_number, room_type, status, price_per_night, capacity, floor_number');
      
      if (selectedBranch?.id) {
        query = query.eq('branch_id', selectedBranch.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const avgPrice = total > 0 ? rooms.reduce((sum, r) => sum + (r.price_per_night || 0), 0) / total : 0;
    
    return { total, available, occupied, maintenance, totalCapacity, avgPrice };
  }, [rooms]);

  const roomTypeData = useMemo(() => {
    const types: Record<string, number> = {};
    rooms.forEach(r => {
      const type = r.room_type || 'Standard';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([name, count]) => ({ name, count }));
  }, [rooms]);

  const statusPieData = [
    { name: 'Available', value: stats.available, color: 'hsl(152 69% 45%)' },
    { name: 'Occupied', value: stats.occupied, color: 'hsl(217 91% 60%)' },
    { name: 'Maintenance', value: stats.maintenance, color: 'hsl(38 92% 50%)' },
  ].filter(d => d.value > 0);

  const occupancyRate = stats.total > 0 
    ? Math.round((stats.occupied / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Hotel className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Rooms Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Rooms</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-foreground">{stats.available}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Occupied</p>
          <p className="text-2xl font-bold text-foreground">{stats.occupied}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Avg Price/Night</p>
          <p className="text-2xl font-bold text-foreground">${stats.avgPrice.toFixed(0)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Room Types</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : roomTypeData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No room data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={roomTypeData} layout="vertical">
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
                <Bar dataKey="count" fill="hsl(38 92% 50%)" radius={[0, 4, 4, 0]} name="Rooms" />
              </BarChart>
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
                  stroke={occupancyRate > 80 ? 'hsl(152 69% 45%)' : occupancyRate > 50 ? 'hsl(38 92% 50%)' : 'hsl(0 84% 60%)'}
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
