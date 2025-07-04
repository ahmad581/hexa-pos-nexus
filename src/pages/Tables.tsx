
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, DollarSign } from "lucide-react";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning";
  currentOrder?: {
    id: string;
    items: number;
    total: number;
    startTime: string;
  };
}

const initialTables: Table[] = [
  { id: "1", number: 1, capacity: 2, status: "Available" },
  { id: "2", number: 2, capacity: 4, status: "Occupied", currentOrder: { id: "ORD-001", items: 3, total: 45.50, startTime: "1:30 PM" } },
  { id: "3", number: 3, capacity: 6, status: "Reserved" },
  { id: "4", number: 4, capacity: 2, status: "Available" },
  { id: "5", number: 5, capacity: 4, status: "Cleaning" },
  { id: "6", number: 6, capacity: 8, status: "Occupied", currentOrder: { id: "ORD-002", items: 5, total: 89.25, startTime: "12:45 PM" } },
  { id: "7", number: 7, capacity: 4, status: "Available" },
  { id: "8", number: 8, capacity: 2, status: "Reserved" },
];

export const Tables = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "Available": return "bg-green-500/20 text-green-400";
      case "Occupied": return "bg-red-500/20 text-red-400";
      case "Reserved": return "bg-yellow-500/20 text-yellow-400";
      case "Cleaning": return "bg-blue-500/20 text-blue-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleStatusChange = (tableId: string, newStatus: Table["status"]) => {
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, status: newStatus, ...(newStatus !== "Occupied" && { currentOrder: undefined }) }
        : table
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Table Management</h1>
          <p className="text-gray-400">Monitor and manage restaurant tables</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-300">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-300">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-300">Reserved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-300">Cleaning</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {tables.filter(t => t.status === "Available").length}
            </div>
            <div className="text-gray-400 text-sm">Available</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {tables.filter(t => t.status === "Occupied").length}
            </div>
            <div className="text-gray-400 text-sm">Occupied</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {tables.filter(t => t.status === "Reserved").length}
            </div>
            <div className="text-gray-400 text-sm">Reserved</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {tables.filter(t => t.status === "Cleaning").length}
            </div>
            <div className="text-gray-400 text-sm">Cleaning</div>
          </div>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="bg-gray-800 border-gray-700 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Table {table.number}</h3>
              <Badge className={getStatusColor(table.status)}>
                {table.status}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Users size={16} className="mr-2" />
                <span className="text-sm">Capacity: {table.capacity} guests</span>
              </div>

              {table.currentOrder && (
                <>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex items-center text-gray-300 mb-2">
                      <Clock size={16} className="mr-2" />
                      <span className="text-sm">Since {table.currentOrder.startTime}</span>
                    </div>
                    <div className="flex items-center text-gray-300 mb-2">
                      <span className="text-sm">{table.currentOrder.items} items ordered</span>
                    </div>
                    <div className="flex items-center text-green-400">
                      <DollarSign size={16} className="mr-1" />
                      <span className="font-semibold">${table.currentOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4 space-y-2">
                {table.status === "Available" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(table.id, "Occupied")}
                      className="bg-red-600 hover:bg-red-700 text-xs"
                    >
                      Seat Guests
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(table.id, "Reserved")}
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                    >
                      Reserve
                    </Button>
                  </div>
                )}

                {table.status === "Occupied" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(table.id, "Cleaning")}
                      className="bg-blue-600 hover:bg-blue-700 text-xs"
                    >
                      Clear Table
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
                    >
                      View Order
                    </Button>
                  </div>
                )}

                {table.status === "Reserved" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(table.id, "Occupied")}
                      className="bg-red-600 hover:bg-red-700 text-xs"
                    >
                      Seat Guests
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(table.id, "Available")}
                      className="bg-green-600 hover:bg-green-700 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {table.status === "Cleaning" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(table.id, "Available")}
                    className="w-full bg-green-600 hover:bg-green-700 text-xs"
                  >
                    Mark Clean
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
