import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, Phone, Mail, Plus, Edit, Trash2, Loader2, Search, CalendarDays, AlertTriangle } from "lucide-react";
import { useSalonClients } from "@/hooks/useSalonClients";
import { useStylists } from "@/hooks/useStylists";
import { format, parseISO } from "date-fns";

const emptyForm = {
  first_name: "", last_name: "", email: "", phone: "",
  preferred_stylist_id: "", allergies: "", notes: "",
};

export const SalonClients = () => {
  const { clients, isLoading, createClient, updateClient, deleteClient } = useSalonClients();
  const { stylists } = useStylists();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }, [clients, search]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      first_name: c.first_name, last_name: c.last_name,
      email: c.email || "", phone: c.phone || "",
      preferred_stylist_id: c.preferred_stylist_id || "",
      allergies: c.allergies || "", notes: c.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.first_name || !form.last_name) return;
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      preferred_stylist_id: form.preferred_stylist_id || undefined,
      allergies: form.allergies || undefined,
      notes: form.notes || undefined,
    };
    if (editing) {
      updateClient({ id: editing.id, ...payload });
    } else {
      createClient({ ...payload, first_name: form.first_name, last_name: form.last_name });
    }
    setDialogOpen(false);
    resetForm();
  };

  const getStylistName = (id?: string) => {
    if (!id) return null;
    const s = stylists.find(st => st.id === id);
    return s ? `${s.first_name} ${s.last_name}` : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage client profiles and history</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Client" : "Add Client"}</DialogTitle>
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
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Preferred Stylist</Label>
                <Select value={form.preferred_stylist_id || "none"} onValueChange={v => setForm(f => ({ ...f, preferred_stylist_id: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    {stylists.map(s => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Allergies / Sensitivities</Label>
                <Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} placeholder="e.g. Latex, Ammonia..." />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Preferences, past services..." />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={!form.first_name || !form.last_name}>
                {editing ? "Update Client" : "Add Client"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User size={48} className="mx-auto mb-3 opacity-40" />
          <p>No clients found. Add your first client to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const preferredStylist = getStylistName(c.preferred_stylist_id);
            return (
              <Card key={c.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{c.first_name} {c.last_name}</h3>
                    <p className="text-xs text-muted-foreground">{c.visit_count} visit{c.visit_count !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
                      <Edit size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteClient(c.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  {c.phone && <div className="flex items-center gap-2"><Phone size={13} /><span>{c.phone}</span></div>}
                  {c.email && <div className="flex items-center gap-2"><Mail size={13} /><span className="truncate">{c.email}</span></div>}
                  {preferredStylist && <div className="flex items-center gap-2"><User size={13} /><span>Prefers: {preferredStylist}</span></div>}
                  {c.last_visit_date && (
                    <div className="flex items-center gap-2">
                      <CalendarDays size={13} />
                      <span>Last visit: {format(parseISO(c.last_visit_date), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                {c.allergies && (
                  <div className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-md px-2 py-1.5 text-xs">
                    <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                    <span>{c.allergies}</span>
                  </div>
                )}

                {c.notes && <p className="text-xs text-muted-foreground line-clamp-2 italic">{c.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
