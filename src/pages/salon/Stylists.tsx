import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Star, Phone, Mail, Plus, Edit, Trash2, Loader2, Search, Scissors } from "lucide-react";
import { useStylists } from "@/hooks/useStylists";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/20 text-green-400",
  busy: "bg-red-500/20 text-red-400",
  break: "bg-yellow-500/20 text-yellow-400",
  off: "bg-gray-500/20 text-gray-400",
};

const SPECIALTIES_OPTIONS = ["Haircuts", "Coloring", "Highlights", "Balayage", "Keratin", "Styling", "Braiding", "Nails", "Manicure", "Pedicure", "Facials", "Waxing", "Massage"];
const EXPERIENCE_LEVELS = ["junior", "senior", "master"];
const STATUS_OPTIONS = ["available", "busy", "break", "off"];

const emptyForm = {
  first_name: "", last_name: "", email: "", phone: "",
  specialties: [] as string[], experience_level: "junior",
  status: "available", rating: 5.0, bio: "",
};

export const Stylists = () => {
  const { stylists, isLoading, createStylist, updateStylist, deleteStylist } = useStylists();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return stylists.filter(s => {
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [stylists, search, statusFilter]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openEdit = (s: any) => {
    setEditing(s);
    setForm({
      first_name: s.first_name, last_name: s.last_name,
      email: s.email || "", phone: s.phone || "",
      specialties: s.specialties || [], experience_level: s.experience_level || "junior",
      status: s.status || "available", rating: s.rating ?? 5.0, bio: s.bio || "",
    });
    setDialogOpen(true);
  };

  const toggleSpecialty = (sp: string) => {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(sp)
        ? f.specialties.filter(s => s !== sp)
        : [...f.specialties, sp],
    }));
  };

  const handleSubmit = () => {
    if (!form.first_name || !form.last_name) return;
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      specialties: form.specialties,
      experience_level: form.experience_level,
      status: form.status,
      rating: form.rating,
      bio: form.bio || undefined,
    };
    if (editing) {
      updateStylist({ id: editing.id, ...payload });
    } else {
      createStylist(payload);
    }
    setDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stylists</h1>
          <p className="text-muted-foreground">Manage salon staff and availability</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> Add Stylist
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Stylist" : "Add Stylist"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name *</Label>
                  <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Experience Level</Label>
                  <Select value={form.experience_level} onValueChange={v => setForm(f => ({ ...f, experience_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_LEVELS.map(l => <SelectItem key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Rating (1-5)</Label>
                <Input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))} />
              </div>
              <div>
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SPECIALTIES_OPTIONS.map(sp => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => toggleSpecialty(sp)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                        form.specialties.includes(sp)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary"
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={!form.first_name || !form.last_name}>
                {editing ? "Update Stylist" : "Add Stylist"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search stylists..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Scissors size={48} className="mx-auto mb-3 opacity-40" />
          <p>No stylists found. Add your first stylist to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => (
            <Card key={s.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{s.first_name} {s.last_name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{s.experience_level} Stylist</p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={`text-xs ${STATUS_COLORS[s.status] || "bg-muted text-muted-foreground"}`}>
                    {s.status}
                  </Badge>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)}>
                    <Edit size={13} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteStylist(s.id)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground">
                {s.phone && <div className="flex items-center gap-2"><Phone size={13} /><span>{s.phone}</span></div>}
                {s.email && <div className="flex items-center gap-2"><Mail size={13} /><span className="truncate">{s.email}</span></div>}
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star size={13} />
                  <span>{s.rating?.toFixed(1)}/5.0</span>
                </div>
              </div>

              {s.specialties && s.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {s.specialties.slice(0, 4).map(sp => (
                    <span key={sp} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{sp}</span>
                  ))}
                  {s.specialties.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{s.specialties.length - 4}</span>
                  )}
                </div>
              )}

              {s.bio && <p className="text-xs text-muted-foreground line-clamp-2">{s.bio}</p>}

              {/* Quick status update */}
              <div className="flex gap-2 pt-1">
                {s.status !== "available" && (
                  <Button size="sm" variant="outline" className="text-xs h-7 text-green-500" onClick={() => updateStylist({ id: s.id, status: "available" })}>
                    Set Available
                  </Button>
                )}
                {s.status === "available" && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateStylist({ id: s.id, status: "break" })}>
                    On Break
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
