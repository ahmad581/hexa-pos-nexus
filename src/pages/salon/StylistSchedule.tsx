import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, User, CalendarDays, Loader2 } from "lucide-react";
import { useSalonAppointments } from "@/hooks/useSalonAppointments";
import { useStylists } from "@/hooks/useStylists";
import { format, parseISO, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8am-7pm

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  confirmed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "in-progress": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const StylistSchedule = () => {
  const { appointments, isLoading } = useSalonAppointments();
  const { stylists } = useStylists();
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedStylist, setSelectedStylist] = useState("all");

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (!a.appointment_date) return false;
      const dt = parseISO(a.appointment_date);
      const inWeek = weekDays.some(d => isSameDay(d, dt));
      const matchStylist = selectedStylist === "all" || a.stylist_id === selectedStylist;
      return inWeek && matchStylist && a.status !== "cancelled";
    });
  }, [appointments, weekDays, selectedStylist]);

  const getAppointmentsForSlot = (day: Date, hour: number) => {
    return filteredAppointments.filter(a => {
      const dt = parseISO(a.appointment_date);
      return isSameDay(dt, day) && dt.getHours() === hour;
    });
  };

  const getStylistName = (id?: string) => {
    if (!id) return "Unassigned";
    const s = stylists.find(st => st.id === id);
    return s ? `${s.first_name} ${s.last_name}` : "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stylist Schedule</h1>
          <p className="text-muted-foreground">Weekly calendar view of appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedStylist} onValueChange={setSelectedStylist}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All stylists" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stylists</SelectItem>
              {stylists.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.first_name} {s.last_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" onClick={() => setCurrentWeek(w => subWeeks(w, 1))}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" className="text-sm min-w-32" onClick={() => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
              This Week
            </Button>
            <Button size="icon" variant="outline" onClick={() => setCurrentWeek(w => addWeeks(w, 1))}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-2 border-b border-r border-border w-20 text-xs text-muted-foreground font-medium sticky left-0 bg-card z-10">
                    <Clock size={14} className="mx-auto" />
                  </th>
                  {weekDays.map(day => {
                    const isToday = isSameDay(day, new Date());
                    return (
                      <th key={day.toString()} className={`p-2 border-b border-r border-border text-center ${isToday ? "bg-primary/10" : ""}`}>
                        <p className={`text-xs font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>{format(day, "EEE")}</p>
                        <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</p>
                        <p className="text-xs text-muted-foreground">{format(day, "MMM")}</p>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(hour => (
                  <tr key={hour} className="hover:bg-muted/30">
                    <td className="p-2 border-r border-b border-border text-xs text-muted-foreground text-center font-medium sticky left-0 bg-card z-10">
                      {format(new Date(2000, 0, 1, hour), "h a")}
                    </td>
                    {weekDays.map(day => {
                      const slotAppts = getAppointmentsForSlot(day, hour);
                      return (
                        <td key={day.toString()} className="p-1 border-r border-b border-border align-top min-w-28 h-16">
                          {slotAppts.map(a => (
                            <div
                              key={a.id}
                              className={`text-xs p-1.5 rounded border mb-1 ${STATUS_COLORS[a.status] || "bg-muted border-border"}`}
                            >
                              <p className="font-medium truncate">{a.customer_name}</p>
                              <p className="truncate opacity-80">{a.service_type}</p>
                              <p className="opacity-70">{getStylistName(a.stylist_id)} · {a.duration}m</p>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${cls.split(' ')[0]}`} />
            <span className="text-xs text-muted-foreground capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
