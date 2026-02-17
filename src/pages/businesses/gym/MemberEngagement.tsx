import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Gift, AlertTriangle, Calendar, Users, Loader2, Mail, Clock } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { useGymFreezes } from "@/hooks/useGymFreezes";
import { format, differenceInDays, addDays, isAfter, isBefore } from "date-fns";

export const MemberEngagement = () => {
  const { members, isLoading } = useMembers();
  const { freezes, getDaysUsed } = useGymFreezes();

  const today = new Date();

  // Expiring soon (within 7 days)
  const expiringSoon = useMemo(() =>
    members.filter(m => {
      if (!m.end_date || m.status !== 'active') return false;
      const end = new Date(m.end_date);
      const daysLeft = differenceInDays(end, today);
      return daysLeft >= 0 && daysLeft <= 7;
    }).map(m => ({
      ...m,
      daysLeft: differenceInDays(new Date(m.end_date!), today),
    }))
  , [members]);

  // Already expired
  const expired = useMemo(() =>
    members.filter(m => {
      if (!m.end_date) return false;
      return m.status === 'expired' || (m.status === 'active' && isBefore(new Date(m.end_date), today));
    })
  , [members]);

  // Birthdays this month (if we had DOB - simulated with join month anniversary)
  const newMembers = useMemo(() =>
    members.filter(m => {
      const joined = new Date(m.created_at);
      return differenceInDays(today, joined) <= 7;
    })
  , [members]);

  // Frozen members with freeze info
  const frozenMembers = useMemo(() => {
    const activeFreezes = freezes.filter(f => f.status === 'active');
    return activeFreezes.map(f => ({
      ...f,
      daysUsed: getDaysUsed(f),
      daysRemaining: f.max_days_allowed - getDaysUsed(f),
    }));
  }, [freezes, getDaysUsed]);

  // Inactive members (no check-in recently - simplified)
  const inactiveMembers = useMemo(() =>
    members.filter(m => m.status === 'active' && m.end_date && differenceInDays(new Date(m.end_date), today) > 30)
  , [members]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Member Engagement</h1>
        <p className="text-muted-foreground">Notifications, reminders, and member retention tools</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold text-foreground">{expiringSoon.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><Clock className="w-5 h-5 text-destructive" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold text-foreground">{expired.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Users className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Frozen</p>
              <p className="text-2xl font-bold text-foreground">{frozenMembers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Gift className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">New This Week</p>
              <p className="text-2xl font-bold text-foreground">{newMembers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="expiring">
        <TabsList>
          <TabsTrigger value="expiring">Expiring Soon ({expiringSoon.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expired.length})</TabsTrigger>
          <TabsTrigger value="frozen">Frozen ({frozenMembers.length})</TabsTrigger>
          <TabsTrigger value="new">New Members ({newMembers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expiring" className="space-y-3 mt-4">
          {expiringSoon.length === 0 ? (
            <Card className="p-6 text-center border border-border/50">
              <p className="text-muted-foreground">No memberships expiring within 7 days</p>
            </Card>
          ) : (
            expiringSoon.map(m => (
              <Card key={m.id} className="p-4 border border-border/50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{m.first_name} {m.last_name}</p>
                  <p className="text-sm text-muted-foreground">#{m.member_number} · {m.membership_type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 border">
                    {m.daysLeft === 0 ? 'Expires today' : `${m.daysLeft} day${m.daysLeft === 1 ? '' : 's'} left`}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Expires {format(new Date(m.end_date!), 'MMM d')}</p>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-3 mt-4">
          {expired.length === 0 ? (
            <Card className="p-6 text-center border border-border/50">
              <p className="text-muted-foreground">No expired memberships</p>
            </Card>
          ) : (
            expired.map(m => (
              <Card key={m.id} className="p-4 border border-border/50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{m.first_name} {m.last_name}</p>
                  <p className="text-sm text-muted-foreground">#{m.member_number} · {m.membership_type}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30 border">Expired</Badge>
                  {m.end_date && <p className="text-xs text-muted-foreground mt-1">Expired {format(new Date(m.end_date), 'MMM d, yyyy')}</p>}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="frozen" className="space-y-3 mt-4">
          {frozenMembers.length === 0 ? (
            <Card className="p-6 text-center border border-border/50">
              <p className="text-muted-foreground">No frozen memberships</p>
            </Card>
          ) : (
            frozenMembers.map(f => (
              <Card key={f.id} className="p-4 border border-border/50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{f.member?.first_name} {f.member?.last_name}</p>
                  <p className="text-sm text-muted-foreground">#{f.member?.member_number} · Since {format(new Date(f.freeze_start), 'MMM d')}</p>
                  {f.reason && <p className="text-xs text-muted-foreground mt-1">Reason: {f.reason}</p>}
                </div>
                <div className="text-right">
                  <Badge className={f.daysRemaining <= 5 ? "bg-destructive/20 text-destructive border-destructive/30 border" : "bg-blue-500/20 text-blue-400 border-blue-500/30 border"}>
                    {f.daysUsed}/{f.max_days_allowed} days used
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{f.daysRemaining} days remaining</p>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-3 mt-4">
          {newMembers.length === 0 ? (
            <Card className="p-6 text-center border border-border/50">
              <p className="text-muted-foreground">No new members this week</p>
            </Card>
          ) : (
            newMembers.map(m => (
              <Card key={m.id} className="p-4 border border-border/50 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{m.first_name} {m.last_name}</p>
                  <p className="text-sm text-muted-foreground">#{m.member_number} · {m.membership_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">
                    <Gift className="w-3 h-3 mr-1" />Welcome!
                  </Badge>
                  <p className="text-sm text-muted-foreground">Joined {format(new Date(m.created_at), 'MMM d')}</p>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
