
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Search, Filter, Download } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { useBranch } from "@/contexts/BranchContext";
import { useToast } from "@/hooks/use-toast";

export const Orders = () => {
  const { orders, updateOrderStatus } = useOrder();
  const { branches } = useBranch();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesBranch = branchFilter === "all" || order.branchId === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleDeleteOrder = (orderId: string) => {
    // In a real app, this would call an API to delete the order
    toast({ title: "Order deleted successfully!", variant: "destructive" });
  };

  const handleUpdateOrder = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
    toast({ title: "Order updated successfully!" });
    setEditDialogOpen(false);
  };

  const exportOrders = () => {
    const csvContent = [
      ["Order ID", "Customer", "Branch", "Type", "Total", "Status", "Date"],
      ...filteredOrders.map(order => [
        order.id,
        order.customerInfo?.name || "N/A",
        order.branchName,
        order.orderType,
        `$${order.total.toFixed(2)}`,
        order.status,
        order.timestamp
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-report.csv";
    a.click();
    toast({ title: "Orders exported successfully!" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "preparing": return "bg-blue-500/20 text-blue-400";
      case "ready": return "bg-green-500/20 text-green-400";
      case "served": return "bg-gray-500/20 text-gray-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders Management</h1>
          <p className="text-gray-400">View, edit, and manage all orders</p>
        </div>
        <Button onClick={exportOrders} className="bg-green-600 hover:bg-green-700">
          <Download size={16} className="mr-2" />
          Export Orders
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 w-64"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="served">Served</SelectItem>
            </SelectContent>
          </Select>

          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Filter by branch" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Order ID</th>
                <th className="text-left py-3 text-gray-400 font-medium">Customer</th>
                <th className="text-left py-3 text-gray-400 font-medium">Branch</th>
                <th className="text-left py-3 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 text-gray-400 font-medium">Items</th>
                <th className="text-left py-3 text-gray-400 font-medium">Total</th>
                <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 text-gray-400 font-medium">Time</th>
                <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-700">
                  <td className="py-3 text-white font-mono text-sm">{order.id}</td>
                  <td className="py-3 text-white">{order.customerInfo?.name || "N/A"}</td>
                  <td className="py-3 text-gray-300">{order.branchName}</td>
                  <td className="py-3 text-gray-300 capitalize">{order.orderType}</td>
                  <td className="py-3 text-gray-300">{order.items.length} items</td>
                  <td className="py-3 text-white font-semibold">${order.total.toFixed(2)}</td>
                  <td className="py-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-300">{order.timestamp}</td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedOrder(order);
                          setEditDialogOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Order - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Status</label>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleUpdateOrder(selectedOrder.id, value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="served">Served</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Order Items</label>
                {selectedOrder.items.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-700 p-3 rounded flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
