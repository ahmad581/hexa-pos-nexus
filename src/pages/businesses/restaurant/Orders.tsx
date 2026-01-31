
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, MapPin, Phone, Edit, Trash2, Filter, CalendarIcon, X } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";

interface DisplayOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "Pending" | "Preparing" | "Ready" | "Delivered";
  orderTime: string;
  orderDate: Date;
  type: "Dine-in" | "Takeout" | "Delivery";
  tableNumber?: string;
  address?: string;
  notes?: string;
  isDeleted?: boolean;
  isUpdated?: boolean;
}

export const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DisplayOrder[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const { orders: contextOrders, updateOrderStatus, deleteOrder: deleteContextOrder } = useOrder();
  const { formatCurrency } = useCurrency();

  // Map context orders to display format
  useEffect(() => {
    const mappedOrders: DisplayOrder[] = contextOrders
      .filter(order => order.orderType !== 'phone')
      .map(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
        return {
          id: order.id,
          customerName: order.customerInfo?.name || (order.tableNumber ? `Table ${order.tableNumber}` : 'Walk-in'),
          customerPhone: order.customerInfo?.phone || '-',
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
          orderDate,
          type: order.orderType === 'dine-in' ? 'Dine-in' as const :
                order.orderType === 'takeout' ? 'Takeout' as const : 'Delivery' as const,
          tableNumber: order.tableNumber,
          address: order.customerInfo?.address,
          notes: order.notes
        };
      });
    setOrders(mappedOrders);
  }, [contextOrders]);

  useEffect(() => {
    let filtered = orders;
    
    // Apply type filter
    switch (filter) {
      case "deleted":
        filtered = filtered.filter(order => order.isDeleted);
        break;
      case "updated":
        filtered = filtered.filter(order => order.isUpdated);
        break;
      case "delivery":
        filtered = filtered.filter(order => order.type === "Delivery" && !order.isDeleted);
        break;
      case "dine-in":
        filtered = filtered.filter(order => order.type === "Dine-in" && !order.isDeleted);
        break;
      case "takeout":
        filtered = filtered.filter(order => order.type === "Takeout" && !order.isDeleted);
        break;
      default:
        filtered = filtered.filter(order => !order.isDeleted);
    }

    // Apply date range filter
    if (dateFrom) {
      const fromStart = new Date(dateFrom);
      fromStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => order.orderDate >= fromStart);
    }
    if (dateTo) {
      const toEnd = new Date(dateTo);
      toEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => order.orderDate <= toEnd);
    }

    // Apply time filter
    if (timeFilter !== "all") {
      filtered = filtered.filter(order => {
        const hour = order.orderDate.getHours();
        switch (timeFilter) {
          case "morning": return hour >= 6 && hour < 12;
          case "afternoon": return hour >= 12 && hour < 17;
          case "evening": return hour >= 17 && hour < 21;
          case "night": return hour >= 21 || hour < 6;
          default: return true;
        }
      });
    }
    
    setFilteredOrders(filtered);
  }, [orders, filter, dateFrom, dateTo, timeFilter]);

  const clearDateFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const getStatusColor = (status: DisplayOrder["status"]) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/20 text-yellow-400";
      case "Preparing": return "bg-blue-500/20 text-blue-400";
      case "Ready": return "bg-green-500/20 text-green-400";
      case "Delivered": return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeColor = (type: DisplayOrder["type"]) => {
    switch (type) {
      case "Dine-in": return "bg-purple-500/20 text-purple-400";
      case "Takeout": return "bg-orange-500/20 text-orange-400";
      case "Delivery": return "bg-teal-500/20 text-teal-400";
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: DisplayOrder["status"]) => {
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

  const handleEditOrder = (order: DisplayOrder) => {
    // Navigate to menu page with order data in state
    navigate('/menu', { 
      state: { 
        editingOrder: {
          id: order.id,
          customerInfo: {
            name: order.customerName,
            phone: order.customerPhone,
            address: order.address
          },
          orderType: order.type.toLowerCase().replace('-', '') as 'dinein' | 'takeout' | 'delivery',
          items: order.items.map(item => ({
            id: `${order.id}-${item.name}`,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          tableNumber: order.tableNumber,
          status: order.status.toLowerCase(),
          total: order.total
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Orders</h1>
          <p className="text-gray-400">Manage restaurant orders</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date From */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal bg-gray-800 border-gray-700",
                  !dateFrom && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "MMM dd") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={setDateFrom}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Date To */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[140px] justify-start text-left font-normal bg-gray-800 border-gray-700",
                  !dateTo && "text-gray-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "MMM dd") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={setDateTo}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Clear date filters */}
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilters}
              className="h-9 px-2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          )}

          {/* Time Filter */}
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700 text-white">
              <Clock size={14} className="mr-2" />
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Times</SelectItem>
              <SelectItem value="morning">Morning (6-12)</SelectItem>
              <SelectItem value="afternoon">Afternoon (12-5)</SelectItem>
              <SelectItem value="evening">Evening (5-9)</SelectItem>
              <SelectItem value="night">Night (9-6)</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700 text-white">
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
                    {order.notes && (
                      <div className="text-sm text-gray-400 mt-1 italic">
                        {order.notes}
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
                  {formatCurrency(order.total)}
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
    </div>
  );
};
