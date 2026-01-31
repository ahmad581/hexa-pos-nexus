
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Heart } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface PetAppointment {
  id: string;
  ownerName: string;
  petName: string;
  petType: string;
  serviceType: string;
  appointmentTime: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  cost: number;
}

const initialAppointments: PetAppointment[] = [
  { id: "1", ownerName: "Sarah Johnson", petName: "Buddy", petType: "Golden Retriever", serviceType: "Grooming", appointmentTime: "10:00 AM", status: "Scheduled", cost: 65.00 },
  { id: "2", ownerName: "Mike Brown", petName: "Whiskers", petType: "Persian Cat", serviceType: "Checkup", appointmentTime: "2:30 PM", status: "In Progress", cost: 85.00 },
];

export const PetAppointments = () => {
  const [appointments, setAppointments] = useState<PetAppointment[]>(initialAppointments);
  const { formatCurrency } = useCurrency();

  const getStatusColor = (status: PetAppointment["status"]) => {
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
          <h1 className="text-3xl font-bold text-white">Pet Care Appointments</h1>
          <p className="text-gray-400">Manage pet appointments and services</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{appointment.petName}</h3>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <User size={16} className="mr-2" />
                <span className="text-sm">Owner: {appointment.ownerName}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Heart size={16} className="mr-2" />
                <span className="text-sm">{appointment.petType}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-sm">Service: {appointment.serviceType}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock size={16} className="mr-2" />
                <span className="text-sm">{appointment.appointmentTime}</span>
              </div>
              <div className="text-green-400 font-bold">
                {formatCurrency(appointment.cost)}
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
