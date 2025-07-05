
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, DollarSign, Bed } from "lucide-react";

interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Maintenance";
  currentGuest?: {
    name: string;
    checkIn: string;
    checkOut: string;
    total: number;
  };
}

const initialRooms: Room[] = [
  { id: "1", number: "101", type: "Standard", capacity: 2, status: "Available" },
  { id: "2", number: "102", type: "Deluxe", capacity: 2, status: "Occupied", currentGuest: { name: "John Doe", checkIn: "2023-12-01", checkOut: "2023-12-03", total: 250 } },
  { id: "3", number: "201", type: "Suite", capacity: 4, status: "Reserved" },
  { id: "4", number: "202", type: "Standard", capacity: 2, status: "Maintenance" },
];

export const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const getStatusColor = (status: Room["status"]) => {
    switch (status) {
      case "Available": return "bg-green-500/20 text-green-400";
      case "Occupied": return "bg-red-500/20 text-red-400";
      case "Reserved": return "bg-yellow-500/20 text-yellow-400";
      case "Maintenance": return "bg-blue-500/20 text-blue-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Room Management</h1>
          <p className="text-gray-400">Monitor and manage hotel rooms</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {rooms.filter(r => r.status === "Available").length}
            </div>
            <div className="text-gray-400 text-sm">Available</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {rooms.filter(r => r.status === "Occupied").length}
            </div>
            <div className="text-gray-400 text-sm">Occupied</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {rooms.filter(r => r.status === "Reserved").length}
            </div>
            <div className="text-gray-400 text-sm">Reserved</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {rooms.filter(r => r.status === "Maintenance").length}
            </div>
            <div className="text-gray-400 text-sm">Maintenance</div>
          </div>
        </Card>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Room {room.number}</h3>
              <Badge className={getStatusColor(room.status)}>
                {room.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Bed size={16} className="mr-2" />
                <span className="text-sm">{room.type}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Users size={16} className="mr-2" />
                <span className="text-sm">Capacity: {room.capacity} guests</span>
              </div>

              {room.currentGuest && (
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-gray-300 mb-2">
                    <span className="text-sm font-medium">{room.currentGuest.name}</span>
                  </div>
                  <div className="flex items-center text-gray-300 mb-2">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">{room.currentGuest.checkIn} - {room.currentGuest.checkOut}</span>
                  </div>
                  <div className="flex items-center text-green-400">
                    <DollarSign size={16} className="mr-1" />
                    <span className="font-semibold">${room.currentGuest.total}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
