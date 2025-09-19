import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/contexts/OrderContext";
import { useCall } from "@/contexts/CallContext";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { OrderSummary } from "@/components/OrderSummary";
import { MenuModern } from "./MenuModern";
import { MenuSimple } from "./MenuSimple";

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
  const { menuDesign } = useSettings();
  const { t } = useTranslation();
  
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
    { value: "all", label: t('menu.allItems') },
    { value: "burgers", label: t('category.burgers') },
    { value: "pizza", label: t('category.pizza') },
    { value: "salads", label: t('category.salads') },
    { value: "mains", label: t('category.mains') }
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
      
      toast({ title: t('order.editOrder') + ` #${editingOrder.id}` });
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
    toast({ title: t('order.endCall') });
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
    toast({ title: t('order.saveChanges') + ` #${editingOrderId} ` + t('common.save') });
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

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isEditingOrder ? `${t('order.editOrder')} #${editingOrderId}` : t('menu.title')}
            </h1>
            {isInCall && activeCallInfo && !isEditingOrder && (
              <p className="text-green-400">
                📞 {t('order.takingOrderFor')}: {activeCallInfo.customerName} ({activeCallInfo.phoneNumber})
              </p>
            )}
            {isEditingOrder && (
              <p className="text-blue-400">
                ✏️ {t('order.editingExisting')}
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
                  {t('order.cancelEdit')}
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {t('order.saveChanges')}
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
                {t('order.endCall')}
              </Button>
            )}
          </div>
        </div>

      {/* Menu Content */}
      {menuDesign === 'simple' ? (
        <div className={currentOrder.length > 0 ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : ""}>
          <div className={currentOrder.length > 0 ? "lg:col-span-2" : ""}>
            <MenuSimple 
              menuItems={menuItems}
              categories={categories}
              toggleSoldOut={toggleSoldOut}
              isEditingOrder={isEditingOrder}
            />
          </div>
          {currentOrder.length > 0 && (
            <div className="space-y-6">
              <OrderSummary />
            </div>
          )}
        </div>
      ) : (
        <div className={currentOrder.length > 0 ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : ""}>
          <div className={currentOrder.length > 0 ? "lg:col-span-2" : ""}>
            <MenuModern 
              menuItems={menuItems}
              categories={categories}
              toggleSoldOut={toggleSoldOut}
              isEditingOrder={isEditingOrder}
            />
          </div>
          {currentOrder.length > 0 && (
            <div className="space-y-6">
              <OrderSummary />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
