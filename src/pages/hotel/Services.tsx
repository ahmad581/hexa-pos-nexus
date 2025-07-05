
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

const initialServices: Service[] = [
  { id: "1", name: "Room Service", description: "24/7 in-room dining", price: 25.00, category: "Dining", available: true },
  { id: "2", name: "Spa Treatment", description: "Relaxing massage therapy", price: 120.00, category: "Wellness", available: true },
  { id: "3", name: "Airport Transfer", description: "Private car to/from airport", price: 45.00, category: "Transportation", available: true },
  { id: "4", name: "Laundry Service", description: "Same-day clothing cleaning", price: 15.00, category: "Convenience", available: true },
];

export const Services = () => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", price: 0, category: "", available: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Hotel Services</h1>
          <p className="text-gray-400">Manage available hotel services</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus size={16} className="mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="servicePrice">Price ($)</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  step="0.01"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{service.name}</h3>
              <Button size="sm" variant="ghost" className="text-blue-400">
                <Edit size={16} />
              </Button>
            </div>
            <p className="text-gray-300 text-sm mb-4">{service.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-bold">${service.price}</span>
              <span className="text-xs text-gray-400">{service.category}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
