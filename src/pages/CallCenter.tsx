
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, Clock, User, MapPin } from "lucide-react";

interface Call {
  id: string;
  customerName: string;
  phoneNumber: string;
  orderType: "Delivery" | "Pickup" | "Reservation";
  status: "Active" | "On Hold" | "Completed" | "Missed";
  startTime: string;
  duration: string;
  address?: string;
  orderTotal?: number;
}

const activeCalls: Call[] = [
  { id: "1", customerName: "John Smith", phoneNumber: "+1 (555) 123-4567", orderType: "Delivery", status: "Active", startTime: "2:45 PM", duration: "03:42", address: "123 Main St, City", orderTotal: 34.50 },
  { id: "2", customerName: "Mary Johnson", phoneNumber: "+1 (555) 987-6543", orderType: "Pickup", status: "On Hold", startTime: "2:42 PM", duration: "06:15", orderTotal: 18.99 },
  { id: "3", customerName: "Bob Wilson", phoneNumber: "+1 (555) 456-7890", orderType: "Reservation", status: "Active", startTime: "2:40 PM", duration: "08:30" }
];

const recentCalls: Call[] = [
  { id: "4", customerName: "Alice Brown", phoneNumber: "+1 (555) 321-0987", orderType: "Delivery", status: "Completed", startTime: "2:30 PM", duration: "05:20", address: "456 Oak Ave, City", orderTotal: 52.75 },
  { id: "5", customerName: "David Lee", phoneNumber: "+1 (555) 654-3210", orderType: "Pickup", status: "Completed", startTime: "2:25 PM", duration: "03:15", orderTotal: 24.30 },
  { id: "6", customerName: "Sarah Davis", phoneNumber: "+1 (555) 789-0123", orderType: "Delivery", status: "Missed", startTime: "2:20 PM", duration: "00:00" }
];

export const CallCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: Call["status"]) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-400";
      case "On Hold": return "bg-yellow-500/20 text-yellow-400";
      case "Completed": return "bg-blue-500/20 text-blue-400";
      case "Missed": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getOrderTypeColor = (type: Call["orderType"]) => {
    switch (type) {
      case "Delivery": return "bg-purple-500/20 text-purple-400";
      case "Pickup": return "bg-orange-500/20 text-orange-400";
      case "Reservation": return "bg-cyan-500/20 text-cyan-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Call Center</h1>
          <p className="text-gray-400">Manage incoming calls and orders</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-green-600 hover:bg-green-700">
            <Phone size={16} className="mr-2" />
            New Call
          </Button>
        </div>
      </div>

      {/* Call Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">3</div>
              <div className="text-gray-400 text-sm">Active Calls</div>
            </div>
            <PhoneCall className="text-green-400" size={24} />
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">147</div>
              <div className="text-gray-400 text-sm">Calls Today</div>
            </div>
            <Phone className="text-blue-400" size={24} />
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-400">6:42</div>
              <div className="text-gray-400 text-sm">Avg Call Time</div>
            </div>
            <Clock className="text-yellow-400" size={24} />
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-400">$2,341</div>
              <div className="text-gray-400 text-sm">Orders Value</div>
            </div>
            <User className="text-purple-400" size={24} />
          </div>
        </Card>
      </div>

      {/* Active Calls */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Active Calls</h3>
        <div className="space-y-4">
          {activeCalls.map((call) => (
            <div key={call.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{call.customerName}</h4>
                    <p className="text-gray-400 text-sm">{call.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getOrderTypeColor(call.orderType)}>
                    {call.orderType}
                  </Badge>
                  <Badge className={getStatusColor(call.status)}>
                    {call.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {call.startTime} ({call.duration})
                  </div>
                  {call.address && (
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {call.address}
                    </div>
                  )}
                </div>
                {call.orderTotal && (
                  <div className="text-green-400 font-semibold">
                    ${call.orderTotal.toFixed(2)}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                  Take Order
                </Button>
                <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
                  Put on Hold
                </Button>
                <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                  End Call
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Calls */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Calls</h3>
          <Input
            placeholder="Search calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-gray-700 border-gray-600"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Customer</th>
                <th className="text-left py-3 text-gray-400 font-medium">Phone</th>
                <th className="text-left py-3 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 text-gray-400 font-medium">Time</th>
                <th className="text-left py-3 text-gray-400 font-medium">Duration</th>
                <th className="text-left py-3 text-gray-400 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call) => (
                <tr key={call.id} className="border-b border-gray-700">
                  <td className="py-3 text-white">{call.customerName}</td>
                  <td className="py-3 text-gray-300">{call.phoneNumber}</td>
                  <td className="py-3">
                    <Badge className={getOrderTypeColor(call.orderType)}>
                      {call.orderType}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge className={getStatusColor(call.status)}>
                      {call.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-300">{call.startTime}</td>
                  <td className="py-3 text-gray-300">{call.duration}</td>
                  <td className="py-3 text-green-400 font-semibold">
                    {call.orderTotal ? `$${call.orderTotal.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
