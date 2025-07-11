import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Minus, ShoppingCart, Search, Filter, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrder } from "@/contexts/OrderContext";
import { useCall } from "@/contexts/CallContext";
import { useToast } from "@/hooks/use-toast";
import { OrderSummary } from "@/components/OrderSummary";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  soldOut: boolean;
}

export const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCallInfo, endCall, isInCall } = useCall();
  const { 
    addItemToOrder, 
    currentOrder, 
    setCustomerInfo, 
    customerInfo, 
    setOrderType,
    orderType,
    setSelectedTable,
    clearCurrentOrder,
    updateItemQuantity,
    removeItemFromOrder
  } = useOrder();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Classic Burger",
      description: "Juicy beef patty with lettuce, tomato, and special sauce",
      price: 12.99,
      category: "burgers",
      available: true,
      soldOut: false
    },
    {
      id: "2",
      name: "Margherita Pizza",
      description: "Fresh mozzarella, tomatoes, and basil on thin crust",
      price: 16.99,
      category: "pizza",
      available: true,
      soldOut: false
    },
    {
      id: "3",
      name: "Caesar Salad",
      description: "Crisp romaine lettuce with parmesan and croutons",
      price: 9.99,
      category: "salads",
      available: true,
      soldOut: true
    },
    {
      id: "4",
      name: "Grilled Chicken",
      description: "Tender chicken breast with herbs and spices",
      price: 18.99,
      category: "mains",
      available: true,
      soldOut: false
    }
  ]);

  const categories = [
    { value: "all", label: "All Items" },
    { value: "burgers", label: "Burgers" },
    { value: "pizza", label: "Pizza" },
    { value: "salads", label: "Salads" },
    { value: "mains", label: "Main Courses" }
  ];

  // Load order for editing if passed from Orders page
  useEffect(() => {
    if (location.state?.editingOrder) {
      const editingOrder = location.state.editingOrder;
      setIsEditingOrder(true);
      setEditingOrderId(editingOrder.id);
      
      // Clear current order and load the editing order
      clearCurrentOrder();
      
      // Set customer info
      setCustomerInfo(editingOrder.customerInfo);
      
      // Set order type
      const orderTypeMap: { [key: string]: any } = {
        'dinein': 'dine-in',
        'takeout': 'takeout',
        'delivery': 'delivery'
      };
      setOrderType(orderTypeMap[editingOrder.orderType] || 'dine-in');
      
      // Set table number if dine-in
      if (editingOrder.tableNumber) {
        setSelectedTable(editingOrder.tableNumber);
      }
      
      // Load items into current order
      setTimeout(() => {
        editingOrder.items.forEach((item: any) => {
          for (let i = 0; i < item.quantity; i++) {
            addItemToOrder({ name: item.name, price: item.price });
          }
        });
      }, 100);
      
      toast({ title: `Editing order #${editingOrder.id}` });
    }
  }, [location.state]);

  // Set customer info from call when component mounts
  useEffect(() => {
    if (activeCallInfo && !customerInfo && !isEditingOrder) {
      setCustomerInfo({
        name: activeCallInfo.customerName,
        phone: activeCallInfo.phoneNumber,
        address: activeCallInfo.address
      });
    }
  }, [activeCallInfo, customerInfo, setCustomerInfo, isEditingOrder]);

  const handleEndCall = () => {
    endCall();
    toast({ title: "Call ended" });
    navigate("/call-center");
  };

  const handleCancelEdit = () => {
    setIsEditingOrder(false);
    setEditingOrderId(null);
    clearCurrentOrder();
    navigate("/orders");
  };

  const handleSaveEdit = () => {
    // Here you would typically update the order in your backend/context
    toast({ title: `Order #${editingOrderId} updated successfully!` });
    setIsEditingOrder(false);
    setEditingOrderId(null);
    clearCurrentOrder();
    navigate("/orders");
  };

  const toggleSoldOut = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, soldOut: !item.soldOut } : item
    ));
    
    const item = menuItems.find(item => item.id === itemId);
    toast({ 
      title: `${item?.name} marked as ${item?.soldOut ? 'available' : 'sold out'}` 
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Items - Takes up 2 columns */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isEditingOrder ? `Edit Order #${editingOrderId}` : 'Menu'}
            </h1>
            {isInCall && activeCallInfo && !isEditingOrder && (
              <p className="text-green-400">
                📞 Taking order for: {activeCallInfo.customerName} ({activeCallInfo.phoneNumber})
              </p>
            )}
            {isEditingOrder && (
              <p className="text-blue-400">
                ✏️ Editing existing order - modify items and details
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {isEditingOrder && (
              <>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  Cancel Edit
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Save Changes
                </Button>
              </>
            )}
            {isInCall && !isEditingOrder && (
              <Button
                onClick={handleEndCall}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <PhoneOff size={16} className="mr-2" />
                End Call
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-white font-medium">Filters:</span>
            </div>
            
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <div className="flex gap-2">
                    {item.soldOut && (
                      <Badge className="bg-red-600 text-white">Sold Out</Badge>
                    )}
                    <Badge className={item.available ? "bg-green-600" : "bg-red-600"}>
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-400">${item.price}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => addItemToOrder({ name: item.name, price: item.price })}
                    disabled={!item.available || item.soldOut}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                  >
                    <Plus size={16} className="mr-2" />
                    Add to Order
                  </Button>
                  
                  {!isEditingOrder && (
                    <Button
                      onClick={() => toggleSoldOut(item.id)}
                      variant="outline"
                      size="sm"
                      className={`${item.soldOut ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
                    >
                      {item.soldOut ? 'Mark Available' : 'Mark Sold Out'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="bg-gray-800 border-gray-700 p-8 text-center">
            <p className="text-gray-400">No menu items found matching your criteria.</p>
          </Card>
        )}
      </div>

      {/* Order Summary - Takes up 1 column */}
      <div className="space-y-6">
        <OrderSummary />
      </div>
    </div>
  );
};
