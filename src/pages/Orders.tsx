
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Trash2, Download, Filter, Plus, Minus } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { useToast } from "@/hooks/use-toast";

export const Orders = () => {
  const { orders, updateOrderStatus } = useOrder();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editOrderItems, setEditOrderItems] = useState<any[]>([]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesType = orderTypeFilter === "all" || order.orderType === orderTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteOrder = (orderId: string) => {
    // In a real app, this would call a delete function from the context
    toast({ 
      title: "Order deleted successfully!",
      description: `Order ${orderId} has been removed.`,
      variant: "destructive"
    });
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setEditOrderItems([...order.items]);
    setEditDialogOpen(true);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setEditOrderItems(editOrderItems.filter(item => item.id !== itemId));
    } else {
      setEditOrderItems(editOrderItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const handleSaveOrder = () => {
    // In a real app, this would update the order in the context
    const newTotal = editOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    toast({ 
      title: "Order updated successfully!",
      description: `Order ${selectedOrder.id} has been updated. New total: $${newTotal.toFixed(2)}`
    });
    setEditDialogOpen(false);
    setSelectedOrder(null);
  };

  const exportOrders = () => {
    const csvContent = [
      ["Order ID", "Type", "Customer", "Items", "Total", "Status", "Date"],
      ...filteredOrders.map(order => [
        order.id,
        order.orderType,
        order.customerInfo?.name || 'N/A',
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
    a.download = `orders-report-${Date.now()}.csv`;
    a.click();
    toast({ title: "Orders report exported successfully!" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'preparing': return 'bg-blue-500/20 text-blue-400';
      case 'ready': return 'bg-green-500/20 text-green-400';
      case 'served': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'dine-in': return 'bg-blue-500/20 text-blue-400';
      case 'takeout': return 'bg-green-500/20 text-green-400';
      case 'delivery': return 'bg-purple-500/20 text-purple-400';
      case 'phone': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-white font-medium">Filters:</span>
          </div>
          
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
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="served">Served</SelectItem>
            </SelectContent>
          </Select>

          <Select value={orderTypeFilter} onValueChange={setOrderTypeFilter}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="dine-in">Dine In</SelectItem>
              <SelectItem value="takeout">Takeout</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-gray-400 text-sm">Pending</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {orders.filter(o => o.status === 'preparing').length}
            </div>
            <div className="text-gray-400 text-sm">Preparing</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {orders.filter(o => o.status === 'ready').length}
            </div>
            <div className="text-gray-400 text-sm">Ready</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400 mb-1">
              {orders.filter(o => o.status === 'served').length}
            </div>
            <div className="text-gray-400 text-sm">Served</div>
          </div>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Order ID</th>
                <th className="text-left py-3 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 text-gray-400 font-medium">Customer/Table</th>
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
                  <td className="py-3 text-white font-medium">{order.id}</td>
                  <td className="py-3">
                    <Badge className={getOrderTypeColor(order.orderType)}>
                      {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-300">
                    {order.orderType === 'dine-in' 
                      ? `Table ${order.tableNumber}` 
                      : order.customerInfo?.name || 'N/A'
                    }
                  </td>
                  <td className="py-3 text-gray-300">{order.items.length} items</td>
                  <td className="py-3 text-white font-semibold">${order.total.toFixed(2)}</td>
                  <td className="py-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="py-3 text-gray-300">{order.timestamp}</td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditOrder(order)}
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
                      {order.status !== 'served' && (
                        <Select 
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value as any)}
                        >
                          <SelectTrigger className="w-24 h-8 bg-gray-700 border-gray-600 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="served">Served</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
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
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Type</Label>
                  <div className="text-gray-300">{selectedOrder.orderType}</div>
                </div>
                <div>
                  <Label>Customer/Table</Label>
                  <div className="text-gray-300">
                    {selectedOrder.orderType === 'dine-in' 
                      ? `Table ${selectedOrder.tableNumber}` 
                      : selectedOrder.customerInfo?.name || 'N/A'
                    }
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Order Items</Label>
                <div className="space-y-2 mt-2">
                  {editOrderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-gray-400 text-sm">${item.price.toFixed(2)} each</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <Plus size={14} />
                        </Button>
                        <div className="text-white font-medium ml-4">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <span className="text-lg font-bold text-green-400">
                    ${editOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleSaveOrder} className="flex-1 bg-green-600 hover:bg-green-700">
                  Save Changes
                </Button>
                <Button 
                  onClick={() => setEditDialogOpen(false)} 
                  variant="outline" 
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
