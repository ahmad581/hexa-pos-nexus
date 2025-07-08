
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning";
  currentOrder?: {
    customerName: string;
    orderTime: string;
    items: number;
    total: number;
  };
}

const initialTables: Table[] = [
  { id: "1", number: 1, capacity: 2, status: "Available" },
  { id: "2", number: 2, capacity: 4, status: "Occupied", currentOrder: { customerName: "John Doe", orderTime: "12:30 PM", items: 3, total: 45.50 } },
  { id: "3", number: 3, capacity: 6, status: "Reserved" },
  { id: "4", number: 4, capacity: 2, status: "Cleaning" },
  { id: "5", number: 5, capacity: 4, status: "Available" },
  { id: "6", number: 6, capacity: 8, status: "Occupied", currentOrder: { customerName: "Jane Smith", orderTime: "1:15 PM", items: 5, total: 78.25 } },
];

export const Tables = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "Available": return "bg-green-500/20 text-green-400";
      case "Occupied": return "bg-red-500/20 text-red-400";
      case "Reserved": return "bg-yellow-500/20 text-yellow-400";
      case "Cleaning": return "bg-blue-500/20 text-blue-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tables</h1>
          <p className="text-gray-400">Manage restaurant seating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Table {table.number}</h3>
              <Badge className={getStatusColor(table.status)}>
                {table.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Users size={16} className="mr-2" />
                <span className="text-sm">Seats {table.capacity}</span>
              </div>

              {table.currentOrder && (
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-gray-300 mb-2">
                    <span className="text-sm font-medium">{table.currentOrder.customerName}</span>
                  </div>
                  <div className="flex items-center text-gray-300 mb-2">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">Since {table.currentOrder.orderTime}</span>
                  </div>
                  <div className="text-green-400">
                    <span className="text-sm">{table.currentOrder.items} items • ${table.currentOrder.total}</span>
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
