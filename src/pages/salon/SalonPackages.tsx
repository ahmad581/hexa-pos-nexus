import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Edit, Trash2, Loader2, Search, Clock, Hash, CalendarDays } from "lucide-react";
import { useSalonPackages, PACKAGE_TYPES } from "@/hooks/useSalonPackages";
import { useSalonServices } from "@/hooks/useSalonServices";
import { useCurrency } from "@/hooks/useCurrency";

const TYPE_COLORS: Record<string, string> = {
  bundle: "bg-blue-500/20 text-blue-400",
  membership: "bg-purple-500/20 text-purple-400",
  prepaid: "bg-green-500/20 text-green-400",
};

const emptyForm = {
  name: "", description: "", package_type: "bundle",
  services: [] as string[], total_sessions: 1, price: 0, validity_days: 90,
};

export const SalonPackages = () => {
  const { packages, isLoading, createPackage, updatePackage, deletePackage } = useSalonPackages();
  const { services } = useSalonServices();
  const { formatCurrency } = useCurrency();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    if (!search) return packages;
    return packages.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [packages, search]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      package_type: p.package_type,
      services: (p.services || []).map((s: any) => typeof s === 'string' ? s : s.name),
      total_sessions: p.total_sessions || 1,
      price: p.price,
      validity_days: p.validity_days || 90,
    });
    setDialogOpen(true);
  };

  const toggleService = (name: string) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(name) ? f.services.filter(s => s !== name) : [...f.services, name],
    }));
  };

  const handleSubmit = () => {
    if (!form.name) return;
    const payload = {
      name: form.name,
      description: form.description || undefined,
      package_type: form.package_type,
      services: form.services.map(s => ({ name: s })),
      total_sessions: form.total_sessions,
      price: form.price,
      validity_days: form.validity_days,
    };
    if (editing) {
      updatePackage({ id: editing.id, ...payload });
    } else {
      createPackage({ ...payload, name: form.name });
    }
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Packages & Memberships</h1>
          <p className="text-muted-foreground">Create service bundles and membership plans</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={v => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Package" : "New Package"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <Label>Package Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. VIP Monthly" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.package_type} onValueChange={v => setForm(f => ({ ...f, package_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PACKAGE_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Price</Label>
                  <Input type="number" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
                </div>
                <div>
                  <Label>Sessions</Label>
                  <Input type="number" min={1} value={form.total_sessions} onChange={e => setForm(f => ({ ...f, total_sessions: +e.target.value }))} />
                </div>
                <div>
                  <Label>Valid (days)</Label>
                  <Input type="number" min={1} value={form.validity_days} onChange={e => setForm(f => ({ ...f, validity_days: +e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Included Services</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {services.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.name)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        form.services.includes(s.name)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={!form.name}>
                {editing ? "Update Package" : "Create Package"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search packages..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={48} className="mx-auto mb-3 opacity-40" />
          <p>No packages yet. Create your first package or membership.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Card key={p.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{p.name}</h3>
                  <Badge className={`mt-1 text-xs ${TYPE_COLORS[p.package_type] || "bg-muted text-muted-foreground"}`}>
                    {p.package_type}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}>
                    <Edit size={13} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deletePackage(p.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              {p.description && <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>}

              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Hash size={13} /><span>{p.total_sessions} sessions</span></div>
                <div className="flex items-center gap-2"><CalendarDays size={13} /><span>Valid {p.validity_days} days</span></div>
              </div>

              {p.services && (p.services as any[]).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(p.services as any[]).slice(0, 3).map((s: any, i: number) => (
                    <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {typeof s === 'string' ? s : s.name}
                    </span>
                  ))}
                  {(p.services as any[]).length > 3 && <span className="text-xs text-muted-foreground">+{(p.services as any[]).length - 3}</span>}
                </div>
              )}

              <div className="text-primary font-bold text-lg">{formatCurrency(p.price)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
