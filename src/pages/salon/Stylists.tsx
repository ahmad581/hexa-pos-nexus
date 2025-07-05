
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Star } from "lucide-react";

interface Stylist {
  id: string;
  name: string;
  specialties: string[];
  status: "Available" | "Busy" | "Break";
  rating: number;
  nextAppointment?: string;
}

const initialStylists: Stylist[] = [
  { id: "1", name: "Emma Wilson", specialties: ["Haircuts", "Styling"], status: "Available", rating: 4.8 },
  { id: "2", name: "Lisa Chen", specialties: ["Coloring", "Highlights"], status: "Busy", rating: 4.9, nextAppointment: "2:30 PM" },
  { id: "3", name: "Sophie Martinez", specialties: ["Nails", "Manicure"], status: "Break", rating: 4.7 },
];

export const Stylists = () => {
  const [stylists, setStylists] = useState<Stylist[]>(initialStylists);

  const getStatusColor = (status: Stylist["status"]) => {
    switch (status) {
      case "Available": return "bg-green-500/20 text-green-400";
      case "Busy": return "bg-red-500/20 text-red-400";
      case "Break": return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Stylists</h1>
          <p className="text-gray-400">Manage salon staff and schedules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stylists.map((stylist) => (
          <Card key={stylist.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{stylist.name}</h3>
              <Badge className={getStatusColor(stylist.status)}>
                {stylist.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <User size={16} className="mr-2" />
                <span className="text-sm">{stylist.specialties.join(", ")}</span>
              </div>
              <div className="flex items-center text-yellow-400">
                <Star size={16} className="mr-2" />
                <span className="text-sm">{stylist.rating}/5.0</span>
              </div>
              {stylist.nextAppointment && (
                <div className="flex items-center text-gray-300">
                  <Clock size={16} className="mr-2" />
                  <span className="text-sm">Next: {stylist.nextAppointment}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
