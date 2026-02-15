import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Users, Plus, Edit, Trash2, Loader2, MapPin } from "lucide-react";
import { useGymClasses } from "@/hooks/useGymClasses";
import { useBranch } from "@/contexts/BranchContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CLASS_TYPES = ["Yoga", "Spin", "HIIT", "Pilates", "CrossFit", "Zumba", "Boxing", "Swimming", "Strength", "Stretching", "Dance", "Martial Arts"];

export const Classes = () => {
  const { classes, isLoading, createClass, updateClass, deleteClass } = useGymClasses();
  const { selectedBranch } = useBranch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [dayFilter, setDayFilter] = useState("all");

  const [form, setForm] = useState({
    name: "", class_type: "Yoga", instructor_name: "", description: "",
    day_of_week: "Monday", start_time: "09:00", duration_minutes: 60,
    capacity: 20, location: "", recurring: true, status: "scheduled",
  });

  const filtered = useMemo(() => {
    if (dayFilter === "all") return classes;
    return classes.filter(c => c.day_of_week === dayFilter);
  }, [classes, dayFilter]);

  // Group by day
  const grouped = useMemo(() => {
    const map: Record<string, typeof classes> = {};
    DAYS.forEach(d => { map[d] = []; });
    filtered.forEach(c => {
      if (map[c.day_of_week]) map[c.day_of_week].push(c);
    });
    return Object.entries(map).filter(([, v]) => v.length > 0);
  }, [filtered]);

  const resetForm = () => {
    setForm({ name: "", class_type: "Yoga", instructor_name: "", description: "", day_of_week: "Monday", start_time: "09:00", duration_minutes: 60, capacity: 20, location: "", recurring: true, status: "scheduled" });
    setEditing(null);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      name: c.name, class_type: c.class_type,
      instructor_name: c.instructor_name || "",
      description: c.description || "",
      day_of_week: c.day_of_week, start_time: c.start_time?.slice(0, 5) || "09:00",
      duration_minutes: c.duration_minutes, capacity: c.capacity,
      location: c.location || "", recurring: c.recurring, status: c.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.class_type) return;
    const payload = {
      ...form,
      branch_id: selectedBranch?.id || "",
      instructor_name: form.instructor_name || null,
      description: form.description || null,
      location: form.location || null,
    };

    if (editing) {
      updateClass.mutate({ id: editing.id, ...payload });
    } else {
      createClass.mutate(payload as any);
    }
    setDialogOpen(false);
    resetForm();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground">Manage group fitness class schedule</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Class</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit Class" : "Add New Class"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div><Label>Class Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Morning Yoga" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type *</Label>
                  <Select value={form.class_type} onValueChange={v => setForm(f => ({ ...f, class_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CLASS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Day *</Label>
                  <Select value={form.day_of_week} onValueChange={v => setForm(f => ({ ...f, day_of_week: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Start Time</Label><Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} /></div>
                <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 60 }))} /></div>
                <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 20 }))} /></div>
              </div>
              <div><Label>Instructor</Label><Input value={form.instructor_name} onChange={e => setForm(f => ({ ...f, instructor_name: e.target.value }))} /></div>
              <div><Label>Location/Room</Label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Studio A" /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <Button onClick={handleSubmit}>{editing ? "Update" : "Create"} Class</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <Select value={dayFilter} onValueChange={setDayFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Filter day" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {grouped.length === 0 ? (
        <Card className="p-8 text-center border border-border/50">
          <p className="text-muted-foreground">No classes scheduled</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, dayClasses]) => (
            <div key={day}>
              <h3 className="text-lg font-semibold text-foreground mb-3">{day}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayClasses.map(cls => (
                  <Card key={cls.id} className="p-4 border border-border/50 bg-card/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{cls.name}</h4>
                        <Badge variant="outline" className="mt-1">{cls.class_type}</Badge>
                      </div>
                      <Badge className={cls.status === 'scheduled' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted text-muted-foreground'}>
                        {cls.status}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-sm mt-3">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 mr-2" />
                        {cls.start_time?.slice(0, 5)} · {cls.duration_minutes}min
                      </div>
                      {cls.instructor_name && (
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-3.5 h-3.5 mr-2" />{cls.instructor_name}
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-3.5 h-3.5 mr-2" />
                        {cls.registered_count}/{cls.capacity} registered
                      </div>
                      {cls.location && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 mr-2" />{cls.location}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(cls)}>
                        <Edit className="w-3.5 h-3.5 mr-1" />Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive ml-auto" onClick={() => deleteClass.mutate(cls.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
