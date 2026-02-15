import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dumbbell, Plus, Edit, Trash2, Loader2, Search, Wrench, AlertTriangle } from "lucide-react";
import { useGymEquipment } from "@/hooks/useGymEquipment";
import { useBranch } from "@/contexts/BranchContext";
import { format } from "date-fns";

const CATEGORIES = ["Cardio", "Strength", "Free Weights", "Machines", "Functional", "Accessories", "Other"];
const ZONES = ["Cardio Area", "Weight Room", "Group Studio", "Pool", "Outdoor", "General"];
const STATUSES = ["operational", "maintenance", "out-of-order", "retired"];
const CONDITIONS = ["excellent", "good", "fair", "poor"];

export const Equipment = () => {
  const { equipment, isLoading, createEquipment, updateEquipment, deleteEquipment } = useGymEquipment();
  const { selectedBranch } = useBranch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [form, setForm] = useState({
    name: "", category: "Cardio", brand: "", model: "", serial_number: "",
    purchase_date: "", warranty_expiry: "", zone: "", status: "operational",
    condition: "good", last_maintenance: "", next_maintenance: "", maintenance_notes: "",
  });

  const filtered = useMemo(() => {
    return equipment.filter(e => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.brand?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || e.status === statusFilter;
      const matchCategory = categoryFilter === "all" || e.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [equipment, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => ({
    total: equipment.length,
    operational: equipment.filter(e => e.status === "operational").length,
    maintenance: equipment.filter(e => e.status === "maintenance").length,
    outOfOrder: equipment.filter(e => e.status === "out-of-order").length,
  }), [equipment]);

  const resetForm = () => {
    setForm({ name: "", category: "Cardio", brand: "", model: "", serial_number: "", purchase_date: "", warranty_expiry: "", zone: "", status: "operational", condition: "good", last_maintenance: "", next_maintenance: "", maintenance_notes: "" });
    setEditing(null);
  };

  const openEdit = (e: any) => {
    setEditing(e);
    setForm({
      name: e.name, category: e.category, brand: e.brand || "", model: e.model || "",
      serial_number: e.serial_number || "", purchase_date: e.purchase_date || "",
      warranty_expiry: e.warranty_expiry || "", zone: e.zone || "",
      status: e.status, condition: e.condition,
      last_maintenance: e.last_maintenance || "", next_maintenance: e.next_maintenance || "",
      maintenance_notes: e.maintenance_notes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.category) return;
    const payload = {
      ...form,
      branch_id: selectedBranch?.id || "",
      brand: form.brand || null, model: form.model || null,
      serial_number: form.serial_number || null,
      purchase_date: form.purchase_date || null,
      warranty_expiry: form.warranty_expiry || null,
      zone: form.zone || null,
      last_maintenance: form.last_maintenance || null,
      next_maintenance: form.next_maintenance || null,
      maintenance_notes: form.maintenance_notes || null,
    };

    if (editing) {
      updateEquipment.mutate({ id: editing.id, ...payload });
    } else {
      createEquipment.mutate(payload as any);
    }
    setDialogOpen(false);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-emerald-500/20 text-emerald-400";
      case "maintenance": return "bg-amber-500/20 text-amber-400";
      case "out-of-order": return "bg-destructive/20 text-destructive";
      case "retired": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipment</h1>
          <p className="text-muted-foreground">Track gym equipment and maintenance</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Equipment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Equipment" : "Add Equipment"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Treadmill #1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category *</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Zone</Label>
                  <Select value={form.zone} onValueChange={v => setForm(f => ({ ...f, zone: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                    <SelectContent>{ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Brand</Label><Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
                <div><Label>Model</Label><Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} /></div>
              </div>
              <div><Label>Serial Number</Label><Input value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Condition</Label>
                  <Select value={form.condition} onValueChange={v => setForm(f => ({ ...f, condition: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Purchase Date</Label><Input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} /></div>
                <div><Label>Warranty Expiry</Label><Input type="date" value={form.warranty_expiry} onChange={e => setForm(f => ({ ...f, warranty_expiry: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Last Maintenance</Label><Input type="date" value={form.last_maintenance} onChange={e => setForm(f => ({ ...f, last_maintenance: e.target.value }))} /></div>
                <div><Label>Next Maintenance</Label><Input type="date" value={form.next_maintenance} onChange={e => setForm(f => ({ ...f, next_maintenance: e.target.value }))} /></div>
              </div>
              <div><Label>Maintenance Notes</Label><Textarea value={form.maintenance_notes} onChange={e => setForm(f => ({ ...f, maintenance_notes: e.target.value }))} /></div>
              <Button onClick={handleSubmit}>{editing ? "Update" : "Add"} Equipment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border border-border/50">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4 border border-border/50">
          <p className="text-xs text-muted-foreground">Operational</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.operational}</p>
        </Card>
        <Card className="p-4 border border-border/50">
          <p className="text-xs text-muted-foreground">In Maintenance</p>
          <p className="text-2xl font-bold text-amber-400">{stats.maintenance}</p>
        </Card>
        <Card className="p-4 border border-border/50">
          <p className="text-xs text-muted-foreground">Out of Order</p>
          <p className="text-2xl font-bold text-destructive">{stats.outOfOrder}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Equipment Table */}
      <Card className="border border-border/50">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No equipment found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand/Model</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Maintenance</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(eq => (
                <TableRow key={eq.id}>
                  <TableCell className="font-medium">{eq.name}</TableCell>
                  <TableCell>{eq.category}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[eq.brand, eq.model].filter(Boolean).join(' ') || '—'}
                  </TableCell>
                  <TableCell>{eq.zone || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{eq.condition}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(eq.status)}>{eq.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {eq.next_maintenance ? format(new Date(eq.next_maintenance), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(eq)}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteEquipment.mutate(eq.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
