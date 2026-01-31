import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PhoneOff, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrder } from "@/contexts/OrderContext";
import { useCall } from "@/contexts/CallContext";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useRole } from "@/hooks/useRole";
import { useBranch } from "@/contexts/BranchContext";
import { supabase } from "@/integrations/supabase/client";
import { OrderSummary } from "@/components/OrderSummary";
import { MenuModern } from "./MenuModern";
import { MenuSimple } from "./MenuSimple";
import { CreateCategoryDialog } from "@/components/menu/CreateCategoryDialog";
import { CreateMenuItemDialog } from "@/components/menu/CreateMenuItemDialog";
import { SalesCalculator } from "@/components/SalesCalculator";

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
  const { isManager, isSuperManager, isSystemMaster } = useRole();
  const { selectedBranch } = useBranch();
  
  const canManageMenu = isManager() || isSuperManager() || isSystemMaster();
  
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState([
    { value: "all", label: t('menu.allItems') },
    { value: "burgers", label: t('category.burgers') },
    { value: "pizza", label: t('category.pizza') },
    { value: "salads", label: t('category.salads') },
    { value: "mains", label: t('category.mains') }
  ]);

  // Fetch menu items from Supabase
  useEffect(() => {
    if (selectedBranch?.id) {
      fetchMenuItems();
      fetchCategories();
    }
  }, [selectedBranch?.id]);

  const fetchMenuItems = async () => {
    if (!selectedBranch?.id) return;

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('branch_id', selectedBranch.id);

    if (error) {
      toast({ title: "Error fetching menu items", variant: "destructive" });
      return;
    }

    if (data) {
      setMenuItems(data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price),
        category: item.category,
        available: item.is_available,
        soldOut: !item.is_available
      })));
    }
  };

  const fetchCategories = async () => {
    if (!selectedBranch?.id) return;

    const { data, error } = await supabase
      .from('menu_items')
      .select('category')
      .eq('branch_id', selectedBranch.id);

    if (error) return;

    if (data) {
      const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
      const categoryList = [
        { value: "all", label: t('menu.allItems') },
        ...uniqueCategories.map(cat => ({
          value: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1)
        }))
      ];
      setCategories(categoryList);
    }
  };

  const handleCreateCategory = (categoryValue: string, categoryLabel: string) => {
    setCategories(prev => [...prev, { value: categoryValue, label: categoryLabel }]);
    toast({ title: `Category "${categoryLabel}" created` });
  };

  const handleCreateItem = async (item: {
    name: string;
    description: string;
    price: number;
    category: string;
    printer_ids: string[];
  }) => {
    if (!selectedBranch?.id) {
      toast({ title: "No branch selected", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        branch_id: selectedBranch.id,
        is_available: true,
        printer_ids: item.printer_ids
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error creating menu item", variant: "destructive" });
      return;
    }

    if (data) {
      const newItem: MenuItem = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        price: typeof data.price === 'string' ? parseFloat(data.price) : Number(data.price),
        category: data.category,
        available: data.is_available,
        soldOut: !data.is_available
      };
      setMenuItems(prev => [...prev, newItem]);
      toast({ title: `"${item.name}" added to menu` });
    }
  };

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

  const toggleSoldOut = async (itemId: string) => {
    const item = menuItems.find(item => item.id === itemId);
    if (!item) return;

    const newAvailability = !item.available;

    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: newAvailability })
      .eq('id', itemId);

    if (error) {
      toast({ title: "Error updating item", variant: "destructive" });
      return;
    }

    setMenuItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, available: newAvailability, soldOut: !newAvailability } : i
    ));
    
    toast({ 
      title: `${item.name} marked as ${newAvailability ? 'available' : 'sold out'}` 
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('menu.title') || 'Menu'}
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            {t('calculator.title') || 'Sales Calculator'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-6 mt-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
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
            <div className="flex gap-2 items-center">
              {canManageMenu && !isEditingOrder && (
                <>
                  <CreateCategoryDialog onCategoryCreate={handleCreateCategory} />
                  <CreateMenuItemDialog categories={categories} onItemCreate={handleCreateItem} />
                </>
              )}
              {isEditingOrder && (
                <>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="border-border text-muted-foreground"
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
                  canManageMenu={canManageMenu}
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
                  canManageMenu={canManageMenu}
                />
              </div>
              {currentOrder.length > 0 && (
                <div className="space-y-6">
                  <OrderSummary />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calculator" className="mt-6">
          <SalesCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
