import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, UserCheck, Loader2, Calendar, DollarSign } from "lucide-react";
import { useGymTrainers, GymTrainer } from "@/hooks/useGymTrainers";
import { useMembers } from "@/hooks/useMembers";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { format } from "date-fns";

const SPECIALIZATIONS = ['Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'CrossFit', 'Boxing', 'Swimming', 'Nutrition', 'Rehabilitation'];

const emptyTrainer = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  specializations: [] as string[],
  certifications: [] as string[],
  hourly_rate: 0,
  session_rate: 0,
  bio: '',
  status: 'active',
  hire_date: '',
};

export const Trainers = () => {
  const { trainers, isLoading, ptSessions, createTrainer, updateTrainer, deleteTrainer, createPTSession, updatePTSession } = useGymTrainers();
  const { members } = useMembers();
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const { formatCurrency } = useCurrency();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<GymTrainer | null>(null);
  const [form, setForm] = useState(emptyTrainer);
  const [newSpec, setNewSpec] = useState('');
  const [newCert, setNewCert] = useState('');

  // PT Session dialog
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ trainer_id: '', member_id: '', session_date: '', duration_minutes: 60, price: 0, notes: '' });

  const openCreate = () => {
    setEditingTrainer(null);
    setForm(emptyTrainer);
    setDialogOpen(true);
  };

  const openEdit = (t: GymTrainer) => {
    setEditingTrainer(t);
    setForm({
      first_name: t.first_name,
      last_name: t.last_name,
      email: t.email || '',
      phone: t.phone || '',
      specializations: t.specializations || [],
      certifications: t.certifications || [],
      hourly_rate: t.hourly_rate,
      session_rate: t.session_rate,
      bio: t.bio || '',
      status: t.status,
      hire_date: t.hire_date || '',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = {
      ...form,
      email: form.email || null,
      phone: form.phone || null,
      bio: form.bio || null,
      hire_date: form.hire_date || null,
      branch_id: selectedBranch!.id,
      business_id: userProfile?.business_id || null,
    };
    if (editingTrainer) {
      updateTrainer.mutate({ id: editingTrainer.id, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createTrainer.mutate(payload as any, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleAddSpec = (spec: string) => {
    if (spec && !form.specializations.includes(spec)) {
      setForm(f => ({ ...f, specializations: [...f.specializations, spec] }));
    }
    setNewSpec('');
  };

  const handleAddCert = () => {
    if (newCert && !form.certifications.includes(newCert)) {
      setForm(f => ({ ...f, certifications: [...f.certifications, newCert] }));
    }
    setNewCert('');
  };

  const handleScheduleSession = () => {
    const trainer = trainers.find(t => t.id === sessionForm.trainer_id);
    createPTSession.mutate({
      ...sessionForm,
      price: sessionForm.price || trainer?.session_rate || 0,
      branch_id: selectedBranch!.id,
      business_id: userProfile?.business_id || null,
    } as any, { onSuccess: () => setSessionDialogOpen(false) });
  };

  const activeTrainers = trainers.filter(t => t.status === 'active');

  if (isLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trainers</h1>
          <p className="text-muted-foreground">Manage trainers and personal training sessions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setSessionForm({ trainer_id: '', member_id: '', session_date: '', duration_minutes: 60, price: 0, notes: '' })}>
                <Calendar className="w-4 h-4 mr-2" />Schedule PT
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule PT Session</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Trainer</Label>
                  <Select value={sessionForm.trainer_id} onValueChange={v => {
                    const tr = trainers.find(t => t.id === v);
                    setSessionForm(f => ({ ...f, trainer_id: v, price: tr?.session_rate || 0 }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select trainer" /></SelectTrigger>
                    <SelectContent>
                      {activeTrainers.map(t => <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Member</Label>
                  <Select value={sessionForm.member_id} onValueChange={v => setSessionForm(f => ({ ...f, member_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                    <SelectContent>
                      {members.filter(m => m.status === 'active').map(m => <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date & Time</Label>
                  <Input type="datetime-local" value={sessionForm.session_date} onChange={e => setSessionForm(f => ({ ...f, session_date: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Duration (min)</Label>
                    <Input type="number" min={15} step={15} value={sessionForm.duration_minutes} onChange={e => setSessionForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 60 }))} />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input type="number" min={0} step={0.01} value={sessionForm.price} onChange={e => setSessionForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
                <Button onClick={handleScheduleSession} className="w-full" disabled={!sessionForm.trainer_id || !sessionForm.member_id || !sessionForm.session_date}>
                  Schedule Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Trainer</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingTrainer ? 'Edit Trainer' : 'New Trainer'}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First Name</Label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                  <div><Label>Last Name</Label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><Label>Hourly Rate</Label><Input type="number" min={0} value={form.hourly_rate} onChange={e => setForm(f => ({ ...f, hourly_rate: parseFloat(e.target.value) || 0 }))} /></div>
                  <div><Label>Session Rate</Label><Input type="number" min={0} value={form.session_rate} onChange={e => setForm(f => ({ ...f, session_rate: parseFloat(e.target.value) || 0 }))} /></div>
                  <div><Label>Hire Date</Label><Input type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} /></div>
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {form.specializations.map(s => (
                      <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => setForm(f => ({ ...f, specializations: f.specializations.filter(x => x !== s) }))}>
                        {s} ×
                      </Badge>
                    ))}
                  </div>
                  <Select value={newSpec} onValueChange={v => handleAddSpec(v)}>
                    <SelectTrigger><SelectValue placeholder="Add specialization" /></SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.filter(s => !form.specializations.includes(s)).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Certifications</Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {form.certifications.map(c => (
                      <Badge key={c} variant="outline" className="cursor-pointer" onClick={() => setForm(f => ({ ...f, certifications: f.certifications.filter(x => x !== c) }))}>
                        {c} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="e.g. NASM-CPT" value={newCert} onChange={e => setNewCert(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCert()} />
                    <Button variant="outline" size="sm" onClick={handleAddCert}>Add</Button>
                  </div>
                </div>
                <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} /></div>
                <Button onClick={handleSave} className="w-full" disabled={!form.first_name || !form.last_name}>
                  {editingTrainer ? 'Save Changes' : 'Add Trainer'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="trainers">
        <TabsList>
          <TabsTrigger value="trainers">Trainers ({trainers.length})</TabsTrigger>
          <TabsTrigger value="sessions">PT Sessions ({ptSessions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="trainers" className="mt-4">
          {trainers.length === 0 ? (
            <Card className="p-12 border border-border/50 text-center">
              <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold text-foreground">No Trainers Yet</h3>
              <p className="text-muted-foreground mt-1">Add your fitness professionals</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trainers.map(t => (
                <Card key={t.id} className="p-5 border border-border/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground">{t.first_name} {t.last_name}</h3>
                      <Badge variant={t.status === 'active' ? 'default' : 'secondary'} className="mt-1 text-xs capitalize">{t.status}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTrainer.mutate(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{formatCurrency(t.hourly_rate)}/hr · {formatCurrency(t.session_rate)}/session</span>
                    </div>
                    {t.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.specializations.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                      </div>
                    )}
                    {t.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {t.certifications.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          {ptSessions.length === 0 ? (
            <Card className="p-8 border border-border/50 text-center text-muted-foreground">No sessions scheduled</Card>
          ) : (
            <Card className="border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ptSessions.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{format(new Date(s.session_date), 'MMM d, h:mm a')}</TableCell>
                      <TableCell className="font-medium">{s.trainer?.first_name} {s.trainer?.last_name}</TableCell>
                      <TableCell>{s.member?.first_name} {s.member?.last_name}</TableCell>
                      <TableCell>{s.duration_minutes} min</TableCell>
                      <TableCell>{formatCurrency(s.price)}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === 'completed' ? 'default' : s.status === 'cancelled' ? 'destructive' : 'outline'} className="text-xs capitalize">
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {s.status === 'scheduled' && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => updatePTSession.mutate({ id: s.id, status: 'completed' })}>Complete</Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => updatePTSession.mutate({ id: s.id, status: 'cancelled' })}>Cancel</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
