
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PhoneIncoming, PhoneCall, Clock, User, MapPin, ShoppingCart, Plus, Phone, PhoneOff } from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useOrder } from "@/contexts/OrderContext";
import { OrderSummary } from "@/components/OrderSummary";
import { useToast } from "@/hooks/use-toast";

interface IncomingCall {
  id: string;
  customerName: string;
  phoneNumber: string;
  callType: "Sales" | "Support" | "Appointment" | "Complaint" | "General";
  status: "Ringing" | "Active" | "On Hold" | "Completed" | "Missed";
  startTime: string;
  duration: string;
  address?: string;
  orderTotal?: number;
  branchId: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
}

export const CallCenter = () => {
  const { selectedBranch } = useBranch();
  const { selectedBusinessType } = useBusinessType();
  const { setOrderType, setCustomerInfo, addItemToOrder } = useOrder();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCall, setActiveCall] = useState<IncomingCall | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const businessTerms = selectedBusinessType?.terminology || {
    customer: 'Customer',
    customers: 'Customers',
    service: 'Service',
    services: 'Services'
  };

  // Sample menu/services items based on business type
  const getServiceItems = () => {
    if (!selectedBusinessType) return [];
    
    switch (selectedBusinessType.id) {
      case 'restaurant':
        return [
          { id: "1", name: "Classic Burger", price: 12.99, category: "Main Course" },
          { id: "2", name: "Margherita Pizza", price: 16.99, category: "Pizza" },
          { id: "3", name: "Coca Cola", price: 2.99, category: "Drinks" },
          { id: "4", name: "French Fries", price: 4.99, category: "Sides" }
        ];
      case 'hair-salon':
        return [
          { id: "1", name: "Haircut & Style", price: 45.00, category: "Hair Services" },
          { id: "2", name: "Hair Color", price: 85.00, category: "Hair Services" },
          { id: "3", name: "Manicure", price: 25.00, category: "Nail Services" },
          { id: "4", name: "Facial Treatment", price: 65.00, category: "Skin Care" }
        ];
      case 'retail-store':
        return [
          { id: "1", name: "Designer T-Shirt", price: 29.99, category: "Clothing" },
          { id: "2", name: "Sneakers", price: 89.99, category: "Footwear" },
          { id: "3", name: "Phone Case", price: 19.99, category: "Accessories" },
          { id: "4", name: "Wireless Headphones", price: 129.99, category: "Electronics" }
        ];
      default:
        return [
          { id: "1", name: "Service A", price: 50.00, category: "Standard" },
          { id: "2", name: "Service B", price: 75.00, category: "Premium" },
          { id: "3", name: "Service C", price: 100.00, category: "Deluxe" }
        ];
    }
  };

  const serviceItems = getServiceItems();

  // Incoming calls data - filtered by selected branch
  const incomingCalls: IncomingCall[] = [
    { id: "1", customerName: "John Smith", phoneNumber: "+1 (555) 123-4567", callType: "Sales" as const, status: "Ringing" as const, startTime: "2:45 PM", duration: "00:00", address: "123 Main St, City", branchId: selectedBranch?.id || '1', priority: "High" as const },
    { id: "2", customerName: "Mary Johnson", phoneNumber: "+1 (555) 987-6543", callType: "Support" as const, status: "Active" as const, startTime: "2:42 PM", duration: "06:15", branchId: selectedBranch?.id || '1', priority: "Medium" as const },
    { id: "3", customerName: "Bob Wilson", phoneNumber: "+1 (555) 456-7890", callType: "Appointment" as const, status: "On Hold" as const, startTime: "2:40 PM", duration: "08:30", branchId: selectedBranch?.id || '1', priority: "Low" as const }
  ].filter(call => call.branchId === selectedBranch?.id);

  const recentCalls: IncomingCall[] = [
    { id: "4", customerName: "Alice Brown", phoneNumber: "+1 (555) 321-0987", callType: "Sales" as const, status: "Completed" as const, startTime: "2:30 PM", duration: "05:20", address: "456 Oak Ave, City", orderTotal: 52.75, branchId: selectedBranch?.id || '1', priority: "Medium" as const },
    { id: "5", customerName: "David Lee", phoneNumber: "+1 (555) 654-3210", callType: "Support" as const, status: "Completed" as const, startTime: "2:25 PM", duration: "03:15", orderTotal: 24.30, branchId: selectedBranch?.id || '1', priority: "Low" as const },
    { id: "6", customerName: "Sarah Davis", phoneNumber: "+1 (555) 789-0123", callType: "Complaint" as const, status: "Missed" as const, startTime: "2:20 PM", duration: "00:00", branchId: selectedBranch?.id || '1', priority: "Urgent" as const }
  ].filter(call => call.branchId === selectedBranch?.id);

  const getStatusColor = (status: IncomingCall["status"]) => {
    switch (status) {
      case "Ringing": return "bg-yellow-500/20 text-yellow-400 animate-pulse";
      case "Active": return "bg-green-500/20 text-green-400";
      case "On Hold": return "bg-blue-500/20 text-blue-400";
      case "Completed": return "bg-gray-500/20 text-gray-400";
      case "Missed": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getCallTypeColor = (type: IncomingCall["callType"]) => {
    switch (type) {
      case "Sales": return "bg-green-500/20 text-green-400";
      case "Support": return "bg-blue-500/20 text-blue-400";
      case "Appointment": return "bg-purple-500/20 text-purple-400";
      case "Complaint": return "bg-red-500/20 text-red-400";
      case "General": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPriorityColor = (priority: IncomingCall["priority"]) => {
    switch (priority) {
      case "Urgent": return "bg-red-600/20 text-red-400 border-red-500";
      case "High": return "bg-orange-500/20 text-orange-400 border-orange-500";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "Low": return "bg-green-500/20 text-green-400 border-green-500";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const handleAnswerCall = (call: IncomingCall) => {
    setActiveCall(call);
    setOrderType(call.callType === "Sales" ? "phone" : "phone");
    setCustomerInfo({
      name: call.customerName,
      phone: call.phoneNumber,
      address: call.address
    });
    if (call.callType === "Sales") {
      setOrderDialogOpen(true);
    }
    toast({ title: `Answered call from ${call.customerName}` });
  };

  const filteredServiceItems = serviceItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Call Center</h1>
            <p className="text-gray-400">
              Manage incoming calls for {selectedBranch?.name || 'All Locations'} - {selectedBusinessType?.name || 'Business'}
            </p>
          </div>
        </div>

        {/* Call Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{incomingCalls.filter(c => c.status === 'Active').length}</div>
                <div className="text-gray-400 text-sm">Active Calls</div>
              </div>
              <PhoneCall className="text-green-400" size={24} />
            </div>
          </Card>
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{incomingCalls.filter(c => c.status === 'Ringing').length}</div>
                <div className="text-gray-400 text-sm">Ringing</div>
              </div>
              <PhoneIncoming className="text-yellow-400" size={24} />
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
                <div className="text-2xl font-bold text-purple-400">4:32</div>
                <div className="text-gray-400 text-sm">Avg Call Time</div>
              </div>
              <Clock className="text-purple-400" size={24} />
            </div>
          </Card>
        </div>

        {/* Incoming Calls */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Incoming Calls</h3>
          <div className="space-y-4">
            {incomingCalls.map((call) => (
              <div key={call.id} className="bg-gray-700 p-4 rounded-lg border-l-4 border-l-transparent">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${call.status === 'Ringing' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}>
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{call.customerName}</h4>
                      <p className="text-gray-400 text-sm">{call.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(call.priority)}>
                      {call.priority}
                    </Badge>
                    <Badge className={getCallTypeColor(call.callType)}>
                      {call.callType}
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
                </div>

                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAnswerCall(call)}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={call.status === 'Active' || call.status === 'Completed'}
                  >
                    <Phone size={14} className="mr-1" />
                    {call.status === 'Ringing' ? 'Answer' : 'Active'}
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
                    Put on Hold
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                    <PhoneOff size={14} className="mr-1" />
                    End Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Calls Table */}
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
                  <th className="text-left py-3 text-gray-400 font-medium">{businessTerms.customer}</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Phone</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Priority</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call) => (
                  <tr key={call.id} className="border-b border-gray-700">
                    <td className="py-3 text-white">{call.customerName}</td>
                    <td className="py-3 text-gray-300">{call.phoneNumber}</td>
                    <td className="py-3">
                      <Badge className={getCallTypeColor(call.callType)}>
                        {call.callType}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={getPriorityColor(call.priority)}>
                        {call.priority}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-300">{call.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Order Taking Sidebar */}
      <div className="lg:col-span-1">
        <OrderSummary />
      </div>

      {/* Sales Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Take Order - {activeCall?.customerName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Input
                placeholder={`Search ${businessTerms.services.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {filteredServiceItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                  <div>
                    <h4 className="font-medium text-white">{item.name}</h4>
                    <p className="text-gray-300 text-sm">${item.price.toFixed(2)} - {item.category}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      addItemToOrder({ name: item.name, price: item.price });
                      toast({ title: `Added ${item.name} to order` });
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
