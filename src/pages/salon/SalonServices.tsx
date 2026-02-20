import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Scissors, Clock, DollarSign, Plus, Edit, Trash2, Loader2, Search, Tag } from "lucide-react";
import { useSalonServices, SERVICE_CATEGORIES } from "@/hooks/useSalonServices";

const CATEGORY_COLORS: Record<string, string> = {
  Hair: "bg-purple-500/20 text-purple-400",
  Nails: "bg-pink-500/20 text-pink-400",
  Skin: "bg-green-500/20 text-green-400",
  Spa: "bg-blue-500/20 text-blue-400",
  Makeup: "bg-orange-500/20 text-orange-400",
  Other: "bg-gray-500/20 text-gray-400",
};

const emptyForm = {
  name: "", description: "", category: "Hair", duration_minutes: 60, price: 0,
};

export const SalonServices = () => {
  const { services, isLoading, createService, updateService, deleteService } = useSalonServices();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || s.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [services, search, categoryFilter]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      name: s.name, description: s.description || "",
      category: s.category, duration_minutes: s.duration_minutes, price: s.price,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name) return;
    const payload = {
      name: form.name,
      description: form.description || undefined,
      category: form.category,
      duration_minutes: form.duration_minutes,
      price: form.price,
    };
    if (editing) {
      updateService({ id: editing.id, ...payload });
    } else {
      createService({ ...payload, name: form.name });
    }
    setDialogOpen(false);
    resetForm();
  };

  const byCategory = useMemo(() => {
    return SERVICE_CATEGORIES.reduce((acc, cat) => {
      const items = filtered.filter(s => s.category === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    }, {} as Record<string, typeof services>);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Catalog</h1>
          <p className="text-muted-foreground">Manage salon services and pricing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Service Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Women's Haircut" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" min={5} step={5} value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: +e.target.value }))} />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input type="number" min={0} step={0.5} value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Optional description..." />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={!form.name}>
                {editing ? "Update Service" : "Add Service"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SERVICE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : Object.keys(byCategory).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Scissors size={48} className="mx-auto mb-3 opacity-40" />
          <p>No services found. Add your first service to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={15} className="text-muted-foreground" />
                <h2 className="font-semibold text-foreground">{cat}</h2>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(s => (
                  <Card key={s.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{s.name}</h3>
                        <Badge className={`mt-1 text-xs ${CATEGORY_COLORS[s.category] || ""}`}>{s.category}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)}>
                          <Edit size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteService(s.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    {s.description && <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground"><Clock size={13} />{s.duration_minutes} min</span>
                      <span className="flex items-center gap-1 text-primary font-semibold"><DollarSign size={13} />{s.price.toFixed(2)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
