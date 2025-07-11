import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Clock, MapPin, Phone, Edit, Trash2, Filter, Plus, Minus } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";

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
  isDeleted?: boolean;
  isUpdated?: boolean;
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
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<string>("all");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { orders: contextOrders, updateOrderStatus, deleteOrder: deleteContextOrder } = useOrder();

  useEffect(() => {
    const mergedOrders = [
      ...initialOrders,
      ...contextOrders
        .filter(order => order.orderType !== 'phone') // Remove phone orders
        .map(order => ({
          id: order.id,
          customerName: order.customerInfo?.name || 'Unknown Customer',
          customerPhone: order.customerInfo?.phone || 'No phone',
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: order.total,
          status: order.status === 'pending' ? 'Pending' as const : 
                  order.status === 'preparing' ? 'Preparing' as const :
                  order.status === 'ready' ? 'Ready' as const : 'Delivered' as const,
          orderTime: order.timestamp,
          type: order.orderType === 'dine-in' ? 'Dine-in' as const :
                order.orderType === 'takeout' ? 'Takeout' as const : 'Delivery' as const,
          tableNumber: order.tableNumber,
          address: order.customerInfo?.address
        }))
    ];
    setOrders(mergedOrders);
  }, [contextOrders]);

  useEffect(() => {
    let filtered = orders;
    
    switch (filter) {
      case "deleted":
        filtered = orders.filter(order => order.isDeleted);
        break;
      case "updated":
        filtered = orders.filter(order => order.isUpdated);
        break;
      case "delivery":
        filtered = orders.filter(order => order.type === "Delivery" && !order.isDeleted);
        break;
      case "dine-in":
        filtered = orders.filter(order => order.type === "Dine-in" && !order.isDeleted);
        break;
      case "takeout":
        filtered = orders.filter(order => order.type === "Takeout" && !order.isDeleted);
        break;
      default:
        filtered = orders.filter(order => !order.isDeleted);
    }
    
    setFilteredOrders(filtered);
  }, [orders, filter]);

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

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus, isUpdated: true } : order
    ));
    
    let contextStatus: 'pending' | 'preparing' | 'ready' | 'served';
    switch (newStatus) {
      case 'Pending':
        contextStatus = 'pending';
        break;
      case 'Preparing':
        contextStatus = 'preparing';
        break;
      case 'Ready':
        contextStatus = 'ready';
        break;
      case 'Delivered':
        contextStatus = 'served';
        break;
      default:
        contextStatus = 'pending';
    }
    
    updateOrderStatus(orderId, contextStatus);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, isDeleted: true } : order
    ));
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder({ ...order });
    setIsEditDialogOpen(true);
  };

  const handleSaveOrder = () => {
    if (!editingOrder) return;
    
    setOrders(prev => prev.map(order => 
      order.id === editingOrder.id ? { ...editingOrder, isUpdated: true } : order
    ));
    
    setIsEditDialogOpen(false);
    setEditingOrder(null);
  };

  const handleUpdateOrderItem = (index: number, field: 'quantity' | 'price', value: number) => {
    if (!editingOrder) return;
    
    const updatedItems = [...editingOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      total: newTotal
    });
  };

  const handleRemoveOrderItem = (index: number) => {
    if (!editingOrder) return;
    
    const updatedItems = editingOrder.items.filter((_, i) => i !== index);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      total: newTotal
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-400">Manage restaurant orders</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter orders" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="dine-in">Dine-in</SelectItem>
                <SelectItem value="takeout">Takeout</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Order #</TableHead>
              <TableHead className="text-gray-300">Customer</TableHead>
              <TableHead className="text-gray-300">Type</TableHead>
              <TableHead className="text-gray-300">Items</TableHead>
              <TableHead className="text-gray-300">Total</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Time</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="border-gray-700 hover:bg-gray-750">
                <TableCell className="text-white font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div className="text-white">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Phone size={12} className="mr-1" />
                      {order.customerPhone}
                    </div>
                    {order.tableNumber && (
                      <div className="text-sm text-gray-400">Table {order.tableNumber}</div>
                    )}
                    {order.address && (
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <MapPin size={12} className="mr-1" />
                        {order.address}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getTypeColor(order.type)} text-xs`}>
                    {order.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-300">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-green-400 font-bold">
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-gray-300">
                    <Clock size={12} className="mr-1" />
                    <span className="text-sm">{order.orderTime}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                      onClick={() => handleEditOrder(order)}
                    >
                      <Edit size={14} />
                    </Button>
                    {!order.isDeleted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Order #{editingOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {editingOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Customer Name</label>
                  <Input
                    value={editingOrder.customerName}
                    onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Phone</label>
                  <Input
                    value={editingOrder.customerPhone}
                    onChange={(e) => setEditingOrder({...editingOrder, customerPhone: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Order Type</label>
                  <Select 
                    value={editingOrder.type} 
                    onValueChange={(value) => setEditingOrder({...editingOrder, type: value as Order["type"]})}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Dine-in">Dine-in</SelectItem>
                      <SelectItem value="Takeout">Takeout</SelectItem>
                      <SelectItem value="Delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <Select 
                    value={editingOrder.status} 
                    onValueChange={(value) => setEditingOrder({...editingOrder, status: value as Order["status"]})}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Preparing">Preparing</SelectItem>
                      <SelectItem value="Ready">Ready</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingOrder.type === "Dine-in" && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Table Number</label>
                  <Input
                    type="number"
                    value={editingOrder.tableNumber || ""}
                    onChange={(e) => setEditingOrder({...editingOrder, tableNumber: parseInt(e.target.value) || undefined})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}

              {editingOrder.type === "Delivery" && (
                <div>
                  <label className="text-sm font-medium text-gray-400">Address</label>
                  <Input
                    value={editingOrder.address || ""}
                    onChange={(e) => setEditingOrder({...editingOrder, address: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Order Items</label>
                <div className="space-y-2">
                  {editingOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-700 p-3 rounded">
                      <div className="flex-1">
                        <span className="text-white font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400"
                          onClick={() => handleUpdateOrderItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                        >
                          <Minus size={12} />
                        </Button>
                        <span className="text-white w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400"
                          onClick={() => handleUpdateOrderItem(index, 'quantity', item.quantity + 1)}
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleUpdateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                          className="bg-gray-600 border-gray-500 text-white text-sm"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                        onClick={() => handleRemoveOrderItem(index)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <span className="text-xl font-bold text-white">Total:</span>
                <span className="text-xl font-bold text-green-400">
                  ${editingOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveOrder}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
