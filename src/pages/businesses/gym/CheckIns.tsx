import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScanLine, Search, LogIn, LogOut, Loader2, Clock, Users } from "lucide-react";
import { useGymCheckIns } from "@/hooks/useGymCheckIns";
import { useMembers } from "@/hooks/useMembers";
import { format } from "date-fns";

const ZONES = ["Cardio", "Weights", "Group Studio", "Pool", "General"];

export const CheckIns = () => {
  const { checkIns, isLoading, checkIn, checkOut } = useGymCheckIns();
  const { members } = useMembers();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedZone, setSelectedZone] = useState("");

  const activeMembers = useMemo(() => 
    members.filter(m => m.status === "active"), [members]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return activeMembers.filter(m =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.member_number.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, activeMembers]);

  const currentlyIn = checkIns.filter(c => !c.check_out_time);
  const todayTotal = checkIns.length;

  const handleCheckIn = (memberId: string) => {
    // Check if already checked in
    const alreadyIn = checkIns.find(c => c.member_id === memberId && !c.check_out_time);
    if (alreadyIn) {
      return;
    }
    checkIn.mutate({ memberId, zone: selectedZone || undefined, method: 'manual' });
    setSearchQuery("");
    setSelectedMember("");
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Check-In</h1>
        <p className="text-muted-foreground">Track member visits and facility access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Users className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Currently In</p>
              <p className="text-2xl font-bold text-foreground">{currentlyIn.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><LogIn className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Today's Visits</p>
              <p className="text-2xl font-bold text-foreground">{todayTotal}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold text-foreground">{activeMembers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Check-In Form */}
      <Card className="p-5 border border-border/50">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <ScanLine className="w-5 h-5" /> Quick Check-In
        </h3>
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or member number..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg">
                {searchResults.map(m => {
                  const alreadyIn = checkIns.some(c => c.member_id === m.id && !c.check_out_time);
                  return (
                    <button
                      key={m.id}
                      className="w-full px-4 py-2 text-left hover:bg-accent flex items-center justify-between"
                      onClick={() => handleCheckIn(m.id)}
                      disabled={alreadyIn}
                    >
                      <span className="text-sm">
                        <span className="font-medium text-foreground">{m.first_name} {m.last_name}</span>
                        <span className="text-muted-foreground ml-2">#{m.member_number}</span>
                      </span>
                      {alreadyIn ? (
                        <Badge variant="outline" className="text-xs">Already in</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Check In</Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Zone" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Zone</SelectItem>
              {ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Today's Check-Ins */}
      <Card className="border border-border/50">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Today's Activity</h3>
        </div>
        {checkIns.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No check-ins today</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Member #</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkIns.map(ci => (
                <TableRow key={ci.id}>
                  <TableCell className="font-medium">
                    {ci.member?.first_name} {ci.member?.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ci.member?.member_number}</TableCell>
                  <TableCell>{format(new Date(ci.check_in_time), 'h:mm a')}</TableCell>
                  <TableCell>{ci.check_out_time ? format(new Date(ci.check_out_time), 'h:mm a') : '—'}</TableCell>
                  <TableCell>{ci.zone || '—'}</TableCell>
                  <TableCell>
                    {ci.check_out_time ? (
                      <Badge variant="outline">Checked Out</Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">In Gym</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!ci.check_out_time && (
                      <Button variant="ghost" size="sm" onClick={() => checkOut.mutate(ci.id)}>
                        <LogOut className="w-3.5 h-3.5 mr-1" />Out
                      </Button>
                    )}
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
