import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { UserPlus, Users, UserCheck, UserX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export const MembersAnalytics = () => {
  const { selectedBranch } = useBranch();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members-analytics', selectedBranch?.id],
    queryFn: async () => {
      let query = supabase.from('members').select('id, first_name, last_name, membership_type, status, start_date, end_date');
      
      if (selectedBranch?.id) {
        query = query.eq('branch_id', selectedBranch.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter(m => m.status === 'active').length;
    const expired = members.filter(m => m.status === 'expired').length;
    const suspended = members.filter(m => m.status === 'suspended').length;
    
    return { total, active, expired, suspended };
  }, [members]);

  const membershipTypeData = useMemo(() => {
    const types: Record<string, number> = {};
    members.forEach(m => {
      types[m.membership_type] = (types[m.membership_type] || 0) + 1;
    });
    return Object.entries(types).map(([name, count]) => ({ name, count }));
  }, [members]);

  const statusPieData = [
    { name: 'Active', value: stats.active, color: 'hsl(152 69% 45%)' },
    { name: 'Expired', value: stats.expired, color: 'hsl(0 84% 60%)' },
    { name: 'Suspended', value: stats.suspended, color: 'hsl(38 92% 50%)' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-lime-500/20">
          <Users className="w-5 h-5 text-lime-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Members Analytics</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-lime-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Total Members</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-foreground">{stats.active}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Expired</p>
          <p className="text-2xl font-bold text-foreground">{stats.expired}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-transparent border-0">
          <p className="text-xs text-muted-foreground">Suspended</p>
          <p className="text-2xl font-bold text-foreground">{stats.suspended}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Membership Types</h4>
          {isLoading ? (
            <div className="h-[180px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : membershipTypeData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No member data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={membershipTypeData} layout="vertical">
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
                <Bar dataKey="count" fill="hsl(82 84% 45%)" radius={[0, 4, 4, 0]} name="Members" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-4 border border-border/50">
          <h4 className="text-sm font-medium text-foreground mb-3">Member Status</h4>
          {statusPieData.length === 0 ? (
            <div className="h-[180px] flex items-center justify-center text-muted-foreground">
              No member data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
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
