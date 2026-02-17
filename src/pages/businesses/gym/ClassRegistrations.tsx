import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Loader2, CheckCircle, XCircle, UserPlus, Calendar, Clock } from "lucide-react";
import { useGymClassRegistrations } from "@/hooks/useGymClassRegistrations";
import { useGymClasses } from "@/hooks/useGymClasses";
import { useMembers } from "@/hooks/useMembers";
import { format } from "date-fns";

export const ClassRegistrations = () => {
  const { classes, isLoading: classesLoading } = useGymClasses();
  const { members } = useMembers();
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const { registrations, isLoading: regsLoading, register, cancelRegistration, markAttendance } = useGymClassRegistrations(selectedClassId);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const activeMembers = members.filter(m => m.status === 'active');
  const registeredMemberIds = registrations.filter(r => r.status === 'registered' || r.status === 'attended').map(r => r.member_id);
  const availableMembers = activeMembers.filter(m => !registeredMemberIds.includes(m.id));
  const isFull = selectedClass ? registrations.filter(r => r.status === 'registered').length >= selectedClass.capacity : false;

  const handleRegister = () => {
    if (!selectedClassId || !selectedMemberId) return;
    register.mutate({ classId: selectedClassId, memberId: selectedMemberId });
    setRegisterDialogOpen(false);
    setSelectedMemberId("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 border">Registered</Badge>;
      case 'attended': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border">Attended</Badge>;
      case 'no-show': return <Badge className="bg-destructive/20 text-destructive border-destructive/30 border">No Show</Badge>;
      case 'cancelled': return <Badge className="bg-muted text-muted-foreground border-border border">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (classesLoading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Class Registration</h1>
        <p className="text-muted-foreground">Register members for classes and track attendance</p>
      </div>

      {/* Class selector */}
      <Card className="p-5 border border-border/50">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[250px]">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger><SelectValue placeholder="Select a class..." /></SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} — {c.day_of_week} {c.start_time?.slice(0, 5)} ({c.registered_count}/{c.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedClassId && (
            <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isFull}><UserPlus className="w-4 h-4 mr-2" />{isFull ? "Class Full" : "Add Member"}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Register Member for {selectedClass?.name}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger><SelectValue placeholder="Select a member..." /></SelectTrigger>
                    <SelectContent>
                      {availableMembers.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name} (#{m.member_number})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground">All active members are already registered</p>
                  )}
                  <Button onClick={handleRegister} disabled={!selectedMemberId || register.isPending}>Register</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </Card>

      {/* Class details */}
      {selectedClass && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Day</p>
                <p className="font-semibold text-foreground">{selectedClass.day_of_week}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-semibold text-foreground">{selectedClass.start_time?.slice(0, 5)} · {selectedClass.duration_minutes}min</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="font-semibold text-foreground">{registrations.filter(r => r.status === 'registered').length}/{selectedClass.capacity}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Instructor</p>
                <p className="font-semibold text-foreground">{selectedClass.instructor_name || 'TBD'}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Registrations */}
      {selectedClassId && (
        <Card className="border border-border/50">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground">Registered Members</h3>
          </div>
          {regsLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
          ) : registrations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No members registered yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Member #</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.member?.first_name} {r.member?.last_name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.member?.member_number}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(r.registered_at), 'MMM d, h:mm a')}</TableCell>
                    <TableCell>{getStatusBadge(r.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {r.status === 'registered' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => markAttendance.mutate({ registrationId: r.id, attended: true })}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />Present
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => markAttendance.mutate({ registrationId: r.id, attended: false })}>
                              <XCircle className="w-3.5 h-3.5 mr-1 text-destructive" />No Show
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => cancelRegistration.mutate(r.id)}>Cancel</Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {!selectedClassId && (
        <Card className="p-8 text-center border border-border/50">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Select a class above to view and manage registrations</p>
        </Card>
      )}
    </div>
  );
};
