
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Clock, Wrench } from "lucide-react";

interface RepairService {
  id: string;
  customerName: string;
  vehicleInfo: string;
  serviceType: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Waiting Parts";
  estimatedTime: string;
  cost: number;
}

const initialServices: RepairService[] = [
  { id: "1", customerName: "John Doe", vehicleInfo: "2020 Honda Civic", serviceType: "Oil Change", status: "In Progress", estimatedTime: "1 hour", cost: 45.00 },
  { id: "2", customerName: "Jane Smith", vehicleInfo: "2018 Toyota Camry", serviceType: "Brake Replacement", status: "Waiting Parts", estimatedTime: "3 hours", cost: 320.00 },
];

export const AutoRepairServices = () => {
  const [services, setServices] = useState<RepairService[]>(initialServices);

  const getStatusColor = (status: RepairService["status"]) => {
    switch (status) {
      case "Scheduled": return "bg-blue-500/20 text-blue-400";
      case "In Progress": return "bg-yellow-500/20 text-yellow-400";
      case "Completed": return "bg-green-500/20 text-green-400";
      case "Waiting Parts": return "bg-red-500/20 text-red-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Auto Repair Services</h1>
          <p className="text-gray-400">Manage vehicle service appointments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{service.customerName}</h3>
              <Badge className={getStatusColor(service.status)}>
                {service.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Car size={16} className="mr-2" />
                <span className="text-sm">{service.vehicleInfo}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Wrench size={16} className="mr-2" />
                <span className="text-sm">{service.serviceType}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock size={16} className="mr-2" />
                <span className="text-sm">Est. {service.estimatedTime}</span>
              </div>
              <div className="text-green-400 font-bold">
                ${service.cost.toFixed(2)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
