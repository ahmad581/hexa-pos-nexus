
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Edit, Trash2, Eye, Download, Filter, Undo } from "lucide-react";
import { useOrder, Order } from "@/contexts/OrderContext";
import { useToast } from "@/hooks/use-toast";

export const Orders = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrder();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeletedOrders, setShowDeletedOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [deletedOrders, setDeletedOrders] = useState<Order[]>([]);

  const handleDeleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(order => order.id === orderId);
    if (orderToDelete) {
      setDeletedOrders(prev => [...prev, { ...orderToDelete, status: 'deleted' as any }]);
      deleteOrder(orderId);
      toast({ title: "Order moved to deleted orders" });
    }
  };

  const handleRestoreOrder = (order: Order) => {
    // This would typically restore the order back to orders list
    setDeletedOrders(prev => prev.filter(o => o.id !== order.id));
    toast({ title: "Order restored" });
  };

  const handlePermanentDelete = (orderId: string) => {
    setDeletedOrders(prev => prev.filter(order => order.id !== orderId));
    toast({ title: "Order permanently deleted" });
  };

  const displayOrders = showDeletedOrders ? deletedOrders : orders;

  const filteredOrders = displayOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-400";
      case "preparing": return "bg-blue-500/20 text-blue-400";
      case "ready": return "bg-green-500/20 text-green-400";
      case "served": return "bg-gray-500/20 text-gray-400";
      default: return "bg-red-500/20 text-red-400";
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ["Order ID", "Branch", "Type", "Customer", "Items", "Total", "Status", "Date"],
      ...filteredOrders.map(order => [
        order.id,
        order.branchName,
        order.orderType,
        order.customerInfo?.name || "N/A",
        order.items.length,
        order.total,
        order.status,
        order.timestamp
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${showDeletedOrders ? 'deleted-' : ''}orders-export-${Date.now()}.csv`;
    a.click();
    toast({ title: `${showDeletedOrders ? 'Deleted orders' : 'Orders'} exported successfully!` });
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {showDeletedOrders ? 'Deleted Orders' : 'Orders Management'}
          </h1>
          <p className="text-gray-400">
            {showDeletedOrders ? 'View and manage deleted orders' : 'Track and manage all restaurant orders'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowDeletedOrders(!showDeletedOrders)}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            {showDeletedOrders ? 'View Active Orders' : 'View Deleted Orders'}
          </Button>
          <Button onClick={exportOrders} className="bg-green-600 hover:bg-green-700">
            <Download size={16} className="mr-2" />
            Export {showDeletedOrders ? 'Deleted' : ''} Orders
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-white font-medium">Filters:</span>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600"
            />
          </div>

          {!showDeletedOrders && (
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
          )}
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Order ID</th>
                <th className="text-left py-3 text-gray-400 font-medium">Branch</th>
                <th className="text-left py-3 text-gray-400 font-medium">Customer</th>
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
                  <td className="py-3 text-white font-mono">{order.id}</td>
                  <td className="py-3 text-gray-300">{order.branchName}</td>
                  <td className="py-3 text-gray-300">
                    {order.customerInfo?.name || "Walk-in"}
                  </td>
                  <td className="py-3">
                    <Badge className="bg-blue-500/20 text-blue-400">
                      {order.orderType}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-300">{order.items.length} items</td>
                  <td className="py-3 text-green-400 font-semibold">${order.total.toFixed(2)}</td>
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
                        variant="outline"
                        onClick={() => openOrderDetail(order)}
                        className="border-gray-600 text-gray-300"
                      >
                        <Eye size={14} />
                      </Button>
                      
                      {showDeletedOrders ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreOrder(order)}
                            className="border-green-500 text-green-400"
                          >
                            <Undo size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePermanentDelete(order.id)}
                            className="border-red-500 text-red-400"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="border-red-500 text-red-400"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {showDeletedOrders ? 'No deleted orders found.' : 'No orders found matching your criteria.'}
            </p>
          </div>
        )}
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Branch</h4>
                  <p className="text-white">{selectedOrder.branchName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Order Type</h4>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {selectedOrder.orderType}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Customer</h4>
                  <p className="text-white">{selectedOrder.customerInfo?.name || "Walk-in"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Status</h4>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-green-400 font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <span className="text-xl font-bold text-white">Total:</span>
                <span className="text-xl font-bold text-green-400">
                  ${selectedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
