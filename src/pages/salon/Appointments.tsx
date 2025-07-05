
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Scissors } from "lucide-react";

interface Appointment {
  id: string;
  clientName: string;
  service: string;
  stylist: string;
  time: string;
  duration: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  price: number;
}

const initialAppointments: Appointment[] = [
  { id: "1", clientName: "Sarah Johnson", service: "Haircut & Style", stylist: "Emma", time: "10:00 AM", duration: "1h", status: "Scheduled", price: 65 },
  { id: "2", clientName: "Mike Brown", service: "Hair Coloring", stylist: "Lisa", time: "11:30 AM", duration: "2h", status: "In Progress", price: 120 },
  { id: "3", clientName: "Anna Davis", service: "Manicure", stylist: "Sophie", time: "2:00 PM", duration: "45m", status: "Scheduled", price: 35 },
];

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "Scheduled": return "bg-blue-500/20 text-blue-400";
      case "In Progress": return "bg-yellow-500/20 text-yellow-400";
      case "Completed": return "bg-green-500/20 text-green-400";
      case "Cancelled": return "bg-red-500/20 text-red-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Appointments</h1>
          <p className="text-gray-400">Manage client appointments</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{appointment.clientName}</h3>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Scissors size={16} className="mr-2" />
                <span className="text-sm">{appointment.service}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <User size={16} className="mr-2" />
                <span className="text-sm">Stylist: {appointment.stylist}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock size={16} className="mr-2" />
                <span className="text-sm">{appointment.time} ({appointment.duration})</span>
              </div>
              <div className="text-green-400 font-bold">
                ${appointment.price}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {appointment.status === "Scheduled" && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Start Service
                </Button>
              )}
              {appointment.status === "In Progress" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Complete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
