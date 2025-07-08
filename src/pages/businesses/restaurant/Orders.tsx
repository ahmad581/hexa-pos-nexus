
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone } from "lucide-react";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "Pending" | "Preparing" | "Ready" | "Delivered";
  orderTime: string;
  type: "Dine-in" | "Takeout" | "Delivery";
  tableNumber?: number;
  address?: string;
}

const initialOrders: Order[] = [
  {
    id: "1",
    customerName: "John Doe",
    customerPhone: "(555) 123-4567",
    items: [
      { name: "Classic Burger", quantity: 2, price: 12.99 },
      { name: "Fries", quantity: 2, price: 4.99 }
    ],
    total: 35.96,
    status: "Preparing",
    orderTime: "12:30 PM",
    type: "Dine-in",
    tableNumber: 5
  },
  {
    id: "2",
    customerName: "Jane Smith",
    customerPhone: "(555) 987-6543",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 16.99 },
      { name: "Caesar Salad", quantity: 1, price: 9.99 }
    ],
    total: 26.98,
    status: "Ready",
    orderTime: "1:15 PM",
    type: "Takeout"
  }
];

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/20 text-yellow-400";
      case "Preparing": return "bg-blue-500/20 text-blue-400";
      case "Ready": return "bg-green-500/20 text-green-400";
      case "Delivered": return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeColor = (type: Order["type"]) => {
    switch (type) {
      case "Dine-in": return "bg-purple-500/20 text-purple-400";
      case "Takeout": return "bg-orange-500/20 text-orange-400";
      case "Delivery": return "bg-teal-500/20 text-teal-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-400">Manage restaurant orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Order #{order.id}</h3>
              <div className="flex gap-2">
                <Badge className={getTypeColor(order.type)}>
                  {order.type}
                </Badge>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-gray-300">
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone size={16} className="mr-2" />
                <span className="text-sm">{order.customerPhone}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Clock size={16} className="mr-2" />
                <span className="text-sm">{order.orderTime}</span>
              </div>
              
              {order.tableNumber && (
                <div className="text-gray-300">
                  <span className="text-sm">Table {order.tableNumber}</span>
                </div>
              )}
              
              {order.address && (
                <div className="flex items-center text-gray-300">
                  <MapPin size={16} className="mr-2" />
                  <span className="text-sm">{order.address}</span>
                </div>
              )}

              <div className="border-t border-gray-700 pt-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-300 mb-1">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-green-400 text-lg mt-2">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {order.status === "Pending" && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Start Preparing
                </Button>
              )}
              {order.status === "Preparing" && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Mark Ready
                </Button>
              )}
              {order.status === "Ready" && order.type !== "Dine-in" && (
                <Button size="sm" className="bg-gray-600 hover:bg-gray-700">
                  Mark Delivered
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
