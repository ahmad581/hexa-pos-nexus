import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, User, Scissors, Search, Plus, Edit, Trash2, Loader2, Phone, Mail, CalendarDays, Bell, BellOff, CheckCircle2 } from "lucide-react";
import { useSalonAppointments, APPOINTMENT_STATUSES } from "@/hooks/useSalonAppointments";
import { useStylists } from "@/hooks/useStylists";
import { useSalonServices } from "@/hooks/useSalonServices";
import { format, parseISO, isFuture, addHours } from "date-fns";
import { toast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/20 text-blue-400",
  confirmed: "bg-purple-500/20 text-purple-400",
  "in-progress": "bg-yellow-500/20 text-yellow-400",
  completed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
  "no-show": "bg-gray-500/20 text-gray-400",
};

const emptyForm = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  service_type: "",
  stylist_id: "",
  appointment_date: "",
  appointment_time: "",
  duration: 60,
  price: 0,
  notes: "",
  status: "scheduled",
};

export const Appointments = () => {
  const { appointments, isLoading, createAppointment, updateAppointment, deleteAppointment } = useSalonAppointments();
  const { stylists } = useStylists();
  const { services } = useSalonServices();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch = !search ||
        a.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        a.service_type.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, search, statusFilter]);

  const resetForm = () => { setForm(emptyForm); setEditing(null); };

  const openEdit = (a: any) => {
    const dt = a.appointment_date ? parseISO(a.appointment_date) : new Date();
    setEditing(a);
    setForm({
      customer_name: a.customer_name,
      customer_phone: a.customer_phone || "",
      customer_email: a.customer_email || "",
      service_type: a.service_type,
      stylist_id: a.stylist_id || "",
      appointment_date: format(dt, "yyyy-MM-dd"),
      appointment_time: format(dt, "HH:mm"),
      duration: a.duration || 60,
      price: a.price || 0,
      notes: a.notes || "",
      status: a.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.customer_name || !form.service_type || !form.appointment_date || !form.appointment_time) return;
    const isoDate = `${form.appointment_date}T${form.appointment_time}:00`;

    // auto-fill duration from selected service
    const matchedService = services.find(s => s.name === form.service_type);
    const duration = matchedService ? matchedService.duration_minutes : form.duration;
    const price = matchedService ? matchedService.price : form.price;

    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone || undefined,
      customer_email: form.customer_email || undefined,
      service_type: form.service_type,
      stylist_id: form.stylist_id || undefined,
      appointment_date: isoDate,
      duration,
      price,
      notes: form.notes || undefined,
      status: form.status,
    };

    if (editing) {
      updateAppointment({ id: editing.id, ...payload });
    } else {
      createAppointment({ ...payload, customer_name: form.customer_name, appointment_date: isoDate, service_type: form.service_type });
    }
    setDialogOpen(false);
    resetForm();
  };

  const getStylistName = (id?: string) => {
    if (!id) return null;
    const s = stylists.find(st => st.id === id);
    return s ? `${s.first_name} ${s.last_name}` : null;
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Manage client appointments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Appointment" : "New Appointment"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Client Name *</Label>
                  <Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Full name" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} placeholder="+1..." />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} placeholder="client@email.com" />
              </div>
              <div>
                <Label>Service *</Label>
                <Select value={form.service_type} onValueChange={v => setForm(f => ({ ...f, service_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {services.length > 0
                      ? services.map(s => <SelectItem key={s.id} value={s.name}>{s.name} ({s.duration_minutes}min — ${s.price})</SelectItem>)
                      : <SelectItem value="_manual">Enter manually</SelectItem>
                    }
                  </SelectContent>
                </Select>
                {services.length === 0 && (
                  <Input className="mt-1" value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} placeholder="e.g. Haircut & Style" />
                )}
              </div>
              <div>
                <Label>Stylist</Label>
                <Select value={form.stylist_id || "none"} onValueChange={v => setForm(f => ({ ...f, stylist_id: v === "none" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Any available" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any available</SelectItem>
                    {stylists.map(s => <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date *</Label>
                  <Input type="date" min={todayStr} value={form.appointment_date} onChange={e => setForm(f => ({ ...f, appointment_date: e.target.value }))} />
                </div>
                <div>
                  <Label>Time *</Label>
                  <Input type="time" value={form.appointment_time} onChange={e => setForm(f => ({ ...f, appointment_time: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={!form.customer_name || !form.service_type || !form.appointment_date || !form.appointment_time}>
                {editing ? "Update Appointment" : "Book Appointment"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search clients or services..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {APPOINTMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays size={48} className="mx-auto mb-3 opacity-40" />
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => {
            const dt = a.appointment_date ? parseISO(a.appointment_date) : null;
            const stylistName = getStylistName(a.stylist_id);
            return (
              <Card key={a.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{a.customer_name}</h3>
                    <Badge className={`mt-1 text-xs ${STATUS_COLORS[a.status] || "bg-muted text-muted-foreground"}`}>
                      {a.status}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(a)}>
                      <Edit size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteAppointment(a.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Scissors size={13} /><span>{a.service_type}</span></div>
                  {stylistName && <div className="flex items-center gap-2"><User size={13} /><span>{stylistName}</span></div>}
                  {dt && <div className="flex items-center gap-2"><CalendarDays size={13} /><span>{format(dt, "MMM d, yyyy 'at' h:mm a")}</span></div>}
                  <div className="flex items-center gap-2"><Clock size={13} /><span>{a.duration} min</span></div>
                  {a.customer_phone && <div className="flex items-center gap-2"><Phone size={13} /><span>{a.customer_phone}</span></div>}
                </div>

                {a.price != null && a.price > 0 && (
                  <div className="text-primary font-bold">${a.price.toFixed(2)}</div>
                )}

                {/* Reminder indicator */}
                {dt && isFuture(dt) && (a.status === "scheduled" || a.status === "confirmed") && (
                  <div className="flex items-center gap-2 text-xs">
                    {(a as any).reminder_sent ? (
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 size={12} /> Reminder sent
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => {
                          updateAppointment({ id: a.id, reminder_sent: true, reminder_sent_at: new Date().toISOString() } as any);
                          toast({ title: "Reminder sent", description: `Reminder marked for ${a.customer_name}` });
                        }}
                      >
                        <Bell size={12} className="mr-1" /> Send Reminder
                      </Button>
                    )}
                  </div>
                )}

                {/* Quick status actions */}
                <div className="flex gap-2 pt-1">
                  {a.status === "scheduled" && (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateAppointment({ id: a.id, status: "in-progress" })}>
                      Start
                    </Button>
                  )}
                  {a.status === "in-progress" && (
                    <Button size="sm" variant="outline" className="text-xs h-7 text-green-500" onClick={() => updateAppointment({ id: a.id, status: "completed" })}>
                      Complete
                    </Button>
                  )}
                  {(a.status === "scheduled" || a.status === "confirmed") && (
                    <Button size="sm" variant="outline" className="text-xs h-7 text-destructive" onClick={() => updateAppointment({ id: a.id, status: "cancelled" })}>
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
