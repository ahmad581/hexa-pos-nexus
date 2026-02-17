import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, Search, Plus, Loader2, CreditCard, Receipt } from "lucide-react";
import { useGymBilling } from "@/hooks/useGymBilling";
import { useMembers } from "@/hooks/useMembers";
import { useGymMembershipPlans } from "@/hooks/useGymMembershipPlans";
import { useBranch } from "@/contexts/BranchContext";
import { useCurrency } from "@/hooks/useCurrency";
import { format } from "date-fns";

const PAYMENT_TYPES = ["membership", "signup_fee", "pt_session", "class_package", "other"];
const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "online"];

export const Billing = () => {
  const { payments, isLoading, createPayment, stats } = useGymBilling();
  const { members } = useMembers();
  const { plans } = useGymMembershipPlans();
  const { selectedBranch } = useBranch();
  const { formatCurrency } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [form, setForm] = useState({
    member_id: "", plan_id: "", payment_type: "membership",
    amount: "", payment_method: "cash", notes: "",
  });

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = !search ||
        `${p.member?.first_name} ${p.member?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        p.member?.member_number?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || p.payment_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [payments, search, typeFilter]);

  const handleSubmit = () => {
    if (!form.member_id || !form.amount) return;
    createPayment.mutate({
      branch_id: selectedBranch?.id || "",
      business_id: null,
      member_id: form.member_id,
      plan_id: form.plan_id || null,
      payment_type: form.payment_type,
      amount: parseFloat(form.amount),
      payment_method: form.payment_method,
      status: "completed",
      notes: form.notes || null,
      payment_date: new Date().toISOString(),
    });
    setDialogOpen(false);
    setForm({ member_id: "", plan_id: "", payment_type: "membership", amount: "", payment_method: "cash", notes: "" });
  };

  // When a plan is selected, auto-fill amount
  const handlePlanSelect = (planId: string) => {
    setForm(f => ({ ...f, plan_id: planId }));
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setForm(f => ({ ...f, amount: String(plan.price) }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "pending": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "failed": return "bg-destructive/20 text-destructive border-destructive/30";
      case "refunded": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Payments</h1>
          <p className="text-muted-foreground">Track all membership payments and revenue</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Record Payment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Member *</Label>
                <Select value={form.member_id} onValueChange={v => setForm(f => ({ ...f, member_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name} (#{m.member_number})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type</Label>
                  <Select value={form.payment_type} onValueChange={v => setForm(f => ({ ...f, payment_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Method</Label>
                  <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(m => (
                        <SelectItem key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.payment_type === 'membership' && (
                <div>
                  <Label>Plan (optional - auto-fills amount)</Label>
                  <Select value={form.plan_id} onValueChange={handlePlanSelect}>
                    <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                    <SelectContent>
                      {plans.filter(p => p.is_active).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Amount *</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Notes</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <Button onClick={handleSubmit} disabled={createPayment.isPending}>Record Payment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><DollarSign className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">This Month</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.thisMonth)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-foreground">{stats.pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Receipt className="w-5 h-5 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Payments</p>
              <p className="text-xl font-bold text-foreground">{stats.totalPayments}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by member..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PAYMENT_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border border-border/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No payments recorded</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">{format(new Date(p.payment_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{p.member?.first_name} {p.member?.last_name}</TableCell>
                  <TableCell className="capitalize">{p.payment_type.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-muted-foreground">{p.plan?.name || '—'}</TableCell>
                  <TableCell className="capitalize">{p.payment_method.replace(/_/g, ' ')}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(p.amount)}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(p.status)} border`}>{p.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
