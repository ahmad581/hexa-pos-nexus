import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Hotel, BedDouble, DollarSign, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useCurrency } from "@/hooks/useCurrency";

export const RoomsAnalytics = () => {
  const { branches, selectedBranch: contextBranch } = useBranch();
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const { formatCurrency } = useCurrency();

  const branchFilter = selectedBranch !== "all" ? selectedBranch : contextBranch?.id;

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['rooms-analytics', branchFilter],
    queryFn: async () => {
      let query = supabase.from('rooms').select('id, room_number, room_type, status, price_per_night, capacity, floor_number');
      
      if (branchFilter) {
        query = query.eq('branch_id', branchFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const roomTypes = useMemo(() => {
    return [...new Set(rooms.map(r => r.room_type || 'Standard'))];
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }
    if (roomTypeFilter !== "all") {
      result = result.filter(r => (r.room_type || 'Standard') === roomTypeFilter);
    }
    return result;
  }, [rooms, statusFilter, roomTypeFilter]);

  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;
    const totalCapacity = filteredRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const avgPrice = filteredRooms.length > 0 ? filteredRooms.reduce((sum, r) => sum + (r.price_per_night || 0), 0) / filteredRooms.length : 0;
    
    return { total, available, occupied, maintenance, totalCapacity, avgPrice, filtered: filteredRooms.length };
  }, [rooms, filteredRooms]);

  const roomTypeData = useMemo(() => {
    const types: Record<string, number> = {};
    filteredRooms.forEach(r => {
      const type = r.room_type || 'Standard';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([name, count]) => ({ name, count }));
  }, [filteredRooms]);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Hotel className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Rooms Analytics</h3>
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
          <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {roomTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.avgPrice)}</p>
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
