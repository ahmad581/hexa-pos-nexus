import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, Search, TrendingUp, Clock, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { format, subDays, differenceInMinutes } from "date-fns";

export const VisitHistory = () => {
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch?.id;
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("7");

  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ['visit-history', branchId, dateRange],
    queryFn: async () => {
      if (!branchId) return [];
      const sinceDate = subDays(new Date(), parseInt(dateRange)).toISOString();
      const { data, error } = await supabase
        .from('gym_check_ins')
        .select('*, member:members(first_name, last_name, member_number, membership_type)')
        .eq('branch_id', branchId)
        .gte('check_in_time', sinceDate)
        .order('check_in_time', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });

  const filtered = useMemo(() => {
    if (!search) return checkIns;
    return checkIns.filter((c: any) =>
      `${c.member?.first_name} ${c.member?.last_name} ${c.member?.member_number}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [checkIns, search]);

  // Stats
  const stats = useMemo(() => {
    const uniqueMembers = new Set(checkIns.map((c: any) => c.member_id)).size;
    const completedVisits = checkIns.filter((c: any) => c.check_out_time);
    const avgDuration = completedVisits.length > 0
      ? Math.round(completedVisits.reduce((sum: number, c: any) => sum + differenceInMinutes(new Date(c.check_out_time), new Date(c.check_in_time)), 0) / completedVisits.length)
      : 0;
    const days = parseInt(dateRange);
    const avgPerDay = days > 0 ? Math.round(checkIns.length / days) : 0;
    return { total: checkIns.length, uniqueMembers, avgDuration, avgPerDay };
  }, [checkIns, dateRange]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Visit History</h1>
        <p className="text-muted-foreground">Historical check-in analytics and reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Visits</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Users className="w-5 h-5 text-emerald-500" /></div>
            <div><p className="text-xs text-muted-foreground">Unique Members</p><p className="text-2xl font-bold text-foreground">{stats.uniqueMembers}</p></div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="w-5 h-5 text-amber-500" /></div>
            <div><p className="text-xs text-muted-foreground">Avg Duration</p><p className="text-2xl font-bold text-foreground">{stats.avgDuration}m</p></div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10"><History className="w-5 h-5 text-violet-500" /></div>
            <div><p className="text-xs text-muted-foreground">Avg / Day</p><p className="text-2xl font-bold text-foreground">{stats.avgPerDay}</p></div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search member..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border border-border/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No visits found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Member #</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Zone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ci: any) => {
                const duration = ci.check_out_time
                  ? differenceInMinutes(new Date(ci.check_out_time), new Date(ci.check_in_time))
                  : null;
                return (
                  <TableRow key={ci.id}>
                    <TableCell>{format(new Date(ci.check_in_time), 'MMM d')}</TableCell>
                    <TableCell className="font-medium">{ci.member?.first_name} {ci.member?.last_name}</TableCell>
                    <TableCell className="text-muted-foreground">{ci.member?.member_number}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{ci.member?.membership_type}</Badge></TableCell>
                    <TableCell>{format(new Date(ci.check_in_time), 'h:mm a')}</TableCell>
                    <TableCell>{ci.check_out_time ? format(new Date(ci.check_out_time), 'h:mm a') : '—'}</TableCell>
                    <TableCell>{duration !== null ? `${duration}m` : '—'}</TableCell>
                    <TableCell>{ci.zone || '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
