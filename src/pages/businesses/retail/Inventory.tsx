
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  lastRestocked: string;
  status: "Normal" | "Low Stock" | "Out of Stock" | "Overstock";
}

const initialInventory: InventoryItem[] = [
  { id: "1", name: "Wireless Headphones", sku: "WH001", currentStock: 15, minStock: 5, maxStock: 50, lastRestocked: "2023-12-01", status: "Normal" },
  { id: "2", name: "Cotton T-Shirt", sku: "CT001", currentStock: 0, minStock: 10, maxStock: 100, lastRestocked: "2023-11-15", status: "Out of Stock" },
  { id: "3", name: "Water Bottle", sku: "WB001", currentStock: 3, minStock: 5, maxStock: 30, lastRestocked: "2023-11-28", status: "Low Stock" },
];

export const Inventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const getStatusColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "Normal": return "bg-green-500/20 text-green-400";
      case "Low Stock": return "bg-yellow-500/20 text-yellow-400";
      case "Out of Stock": return "bg-red-500/20 text-red-400";
      case "Overstock": return "bg-blue-500/20 text-blue-400";
    }
  };

  const getStatusIcon = (status: InventoryItem["status"]) => {
    switch (status) {
      case "Low Stock":
      case "Out of Stock":
        return <AlertTriangle size={16} />;
      case "Overstock":
        return <TrendingUp size={16} />;
      default:
        return <TrendingDown size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Inventory</h1>
          <p className="text-gray-400">Monitor stock levels</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          Restock Items
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => (
          <Card key={item.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{item.name}</h3>
              <Badge className={getStatusColor(item.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(item.status)}
                  {item.status}
                </span>
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="text-gray-300">
                <span className="text-sm">SKU: {item.sku}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-2xl font-bold text-white">{item.currentStock}</span>
                <span className="text-sm ml-2">units in stock</span>
              </div>
              <div className="text-gray-400 text-sm">
                <div>Min: {item.minStock} | Max: {item.maxStock}</div>
                <div>Last restocked: {item.lastRestocked}</div>
              </div>
            </div>

            <div className="mt-4">
              <Button size="sm" variant="outline" className="w-full">
                Update Stock
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
