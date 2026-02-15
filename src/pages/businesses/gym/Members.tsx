import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { User, Calendar, Activity, Search, Plus, Edit, Trash2, Loader2, Phone, Mail, Snowflake, XCircle, CheckCircle } from "lucide-react";
import { useMembers, type MemberInsert } from "@/hooks/useMembers";
import { useBranch } from "@/contexts/BranchContext";
import { format } from "date-fns";

const MEMBERSHIP_TYPES = ["Basic", "Premium", "VIP", "Student", "Family", "Corporate", "Off-Peak", "Class-Only"];
const STATUSES = ["active", "expired", "frozen", "cancelled", "pending"];

export const Members = () => {
  const { members, isLoading, createMember, updateMember, deleteMember } = useMembers();
  const { selectedBranch } = useBranch();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    membership_type: "Basic", start_date: "", end_date: "",
    member_number: "", emergency_contact_name: "", emergency_contact_phone: "",
  });

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !search || 
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        m.member_number.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || m.status === statusFilter;
      const matchType = typeFilter === "all" || m.membership_type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [members, search, statusFilter, typeFilter]);

  const resetForm = () => {
    setForm({ first_name: "", last_name: "", email: "", phone: "", membership_type: "Basic", start_date: "", end_date: "", member_number: "", emergency_contact_name: "", emergency_contact_phone: "" });
    setEditingMember(null);
  };

  const openEdit = (m: any) => {
    setEditingMember(m);
    setForm({
      first_name: m.first_name, last_name: m.last_name,
      email: m.email || "", phone: m.phone || "",
      membership_type: m.membership_type, start_date: m.start_date,
      end_date: m.end_date || "", member_number: m.member_number,
      emergency_contact_name: m.emergency_contact_name || "",
      emergency_contact_phone: m.emergency_contact_phone || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.first_name || !form.last_name || !form.member_number || !form.start_date) return;
    
    const payload = {
      ...form,
      branch_id: selectedBranch?.id || "",
      email: form.email || null,
      phone: form.phone || null,
      end_date: form.end_date || null,
      emergency_contact_name: form.emergency_contact_name || null,
      emergency_contact_phone: form.emergency_contact_phone || null,
      status: editingMember?.status || "active",
    };

    if (editingMember) {
      updateMember.mutate({ id: editingMember.id, ...payload });
    } else {
      createMember.mutate(payload as MemberInsert);
    }
    setDialogOpen(false);
    resetForm();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active": return { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle };
      case "expired": return { color: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle };
      case "frozen": return { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Snowflake };
      case "cancelled": return { color: "bg-muted text-muted-foreground border-border", icon: XCircle };
      case "pending": return { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Activity };
      default: return { color: "bg-muted text-muted-foreground border-border", icon: Activity };
    }
  };

  const changeStatus = (id: string, newStatus: string) => {
    updateMember.mutate({ id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground">Manage gym memberships ({members.length} total)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Member" : "Add New Member"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>First Name *</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                <div><Label>Last Name *</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
              </div>
              <div><Label>Member Number *</Label><Input value={form.member_number} onChange={e => setForm(f => ({ ...f, member_number: e.target.value }))} placeholder="e.g. GYM-001" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div><Label>Membership Type</Label>
                <Select value={form.membership_type} onValueChange={v => setForm(f => ({ ...f, membership_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MEMBERSHIP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Emergency Contact</Label><Input value={form.emergency_contact_name} onChange={e => setForm(f => ({ ...f, emergency_contact_name: e.target.value }))} /></div>
                <div><Label>Emergency Phone</Label><Input value={form.emergency_contact_phone} onChange={e => setForm(f => ({ ...f, emergency_contact_phone: e.target.value }))} /></div>
              </div>
              <Button onClick={handleSubmit} disabled={createMember.isPending || updateMember.isPending}>
                {editingMember ? "Update" : "Add"} Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {MEMBERSHIP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Members Grid */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center border border-border/50">
          <p className="text-muted-foreground">No members found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => {
            const statusConfig = getStatusConfig(member.status);
            const StatusIcon = statusConfig.icon;
            return (
              <Card key={member.id} className="p-5 border border-border/50 bg-card/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{member.first_name} {member.last_name}</h3>
                    <p className="text-xs text-muted-foreground">{member.member_number}</p>
                  </div>
                  <Badge className={`${statusConfig.color} border`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {member.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {member.email && (
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 mr-2" />{member.email}
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 mr-2" />{member.phone}
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <User className="w-3.5 h-3.5 mr-2" />{member.membership_type}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 mr-2" />
                    {format(new Date(member.start_date), 'MMM d, yyyy')}
                    {member.end_date && ` → ${format(new Date(member.end_date), 'MMM d, yyyy')}`}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>
                    <Edit className="w-3.5 h-3.5 mr-1" />Edit
                  </Button>
                  {member.status === "active" && (
                    <Button variant="ghost" size="sm" onClick={() => changeStatus(member.id, "frozen")}>
                      <Snowflake className="w-3.5 h-3.5 mr-1" />Freeze
                    </Button>
                  )}
                  {member.status === "frozen" && (
                    <Button variant="ghost" size="sm" onClick={() => changeStatus(member.id, "active")}>
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />Activate
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => deleteMember.mutate(member.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
