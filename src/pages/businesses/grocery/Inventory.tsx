
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle } from "lucide-react";

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  expiryDate: string;
  supplier: string;
  status: "Fresh" | "Expiring Soon" | "Expired" | "Low Stock";
}

const initialItems: GroceryItem[] = [
  { id: "1", name: "Organic Apples", category: "Fruits", stock: 50, expiryDate: "2023-12-10", supplier: "Fresh Farms", status: "Fresh" },
  { id: "2", name: "Whole Milk", category: "Dairy", stock: 24, expiryDate: "2023-12-03", supplier: "Dairy Co", status: "Expiring Soon" },
  { id: "3", name: "Bread Loaf", category: "Bakery", stock: 5, expiryDate: "2023-12-05", supplier: "Local Bakery", status: "Low Stock" },
];

export const GroceryInventory = () => {
  const [items, setItems] = useState<GroceryItem[]>(initialItems);

  const getStatusColor = (status: GroceryItem["status"]) => {
    switch (status) {
      case "Fresh": return "bg-green-500/20 text-green-400";
      case "Expiring Soon": return "bg-yellow-500/20 text-yellow-400";
      case "Expired": return "bg-red-500/20 text-red-400";
      case "Low Stock": return "bg-orange-500/20 text-orange-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Grocery Inventory</h1>
          <p className="text-gray-400">Monitor fresh products and expiry dates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{item.name}</h3>
              <Badge className={getStatusColor(item.status)}>
                {item.status === "Expiring Soon" || item.status === "Expired" ? (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {item.status}
                  </span>
                ) : (
                  item.status
                )}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="text-gray-300">
                <span className="text-sm">Category: {item.category}</span>
              </div>
              <div className="text-gray-300">
                <span className="text-sm">Stock: {item.stock} units</span>
              </div>
              <div className="text-gray-300">
                <span className="text-sm">Supplier: {item.supplier}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Calendar size={16} className="mr-2" />
                <span className="text-sm">Expires: {item.expiryDate}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
