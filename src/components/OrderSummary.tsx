
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2, ShoppingCart, User, Phone, MapPin } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { useBranch } from "@/contexts/BranchContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

export const OrderSummary = () => {
  const { 
    currentOrder, 
    selectedTable, 
    orderType,
    customerInfo,
    removeItemFromOrder, 
    updateItemQuantity, 
    setOrderType,
    setCustomerInfo,
    submitOrder, 
    clearCurrentOrder 
  } = useOrder();
  const { selectedBranch } = useBranch();
  const { toast } = useToast();
  const { t } = useTranslation();

  const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = () => {
    if (currentOrder.length === 0) {
      toast({ title: t('orderSummary.cannotSubmitEmpty'), variant: "destructive" });
      return;
    }
    
    if (orderType !== 'dine-in' && (!customerInfo?.name || !customerInfo?.phone)) {
      toast({ title: t('orderSummary.customerInfoRequired'), variant: "destructive" });
      return;
    }
    
    submitOrder();
    toast({ title: t('orderSummary.orderSubmitted') });
  };

  if (currentOrder.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="text-center text-gray-400">
          <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t('orderSummary.noItems')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{t('orderSummary.currentOrder')}</h3>
        <div className="flex items-center space-x-2">
          {selectedBranch && (
            <Badge className="bg-blue-600">{selectedBranch.name}</Badge>
          )}
          {selectedTable && orderType === 'dine-in' && (
            <Badge className="bg-green-600">{t('tables.tableNumber')} {selectedTable}</Badge>
          )}
        </div>
      </div>

      {/* Order Type Selection */}
      <div className="mb-4">
        <Label className="text-white mb-2 block">{t('orderSummary.orderType')}</Label>
        <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="dine-in" className="text-white">{t('orders.dineIn')}</SelectItem>
            <SelectItem value="takeout" className="text-white">{t('orders.takeout')}</SelectItem>
            <SelectItem value="delivery" className="text-white">{t('orders.delivery')}</SelectItem>
            <SelectItem value="phone" className="text-white">{t('orderSummary.phoneOrder')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Information for non-dine-in orders */}
      {orderType !== 'dine-in' && (
        <div className="mb-4 space-y-3 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center space-x-2 text-white">
            <User size={16} />
            <span className="font-medium">{t('orderSummary.customerInfo')}</span>
          </div>
          <div>
            <Label className="text-gray-300 text-sm">{t('common.name')}</Label>
            <Input
              value={customerInfo?.name || ''}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="bg-gray-600 border-gray-500 text-white"
              placeholder={t('orderSummary.customerName')}
            />
          </div>
          <div>
            <Label className="text-gray-300 text-sm">{t('employees.phone')}</Label>
            <Input
              value={customerInfo?.phone || ''}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="bg-gray-600 border-gray-500 text-white"
              placeholder={t('orderSummary.phoneNumber')}
            />
          </div>
          {orderType === 'delivery' && (
            <div>
              <Label className="text-gray-300 text-sm">{t('callCenter.address')}</Label>
              <Input
                value={customerInfo?.address || ''}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="bg-gray-600 border-gray-500 text-white"
                placeholder={t('orderSummary.deliveryAddress')}
              />
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {currentOrder.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
            <div className="flex-1">
              <h4 className="text-white font-medium">{item.name}</h4>
              <p className="text-gray-300 text-sm">${item.price.toFixed(2)} {t('orderSummary.each')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                className="text-gray-300 hover:text-white p-1"
              >
                <Minus size={16} />
              </Button>
              <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                className="text-gray-300 hover:text-white p-1"
              >
                <Plus size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeItemFromOrder(item.id)}
                className="text-red-400 hover:text-red-300 p-1 ml-2"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-600 pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-white">{t('common.total')}:</span>
          <span className="text-lg font-bold text-green-400">${total.toFixed(2)}</span>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={clearCurrentOrder}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300"
          >
            {t('orderSummary.clearOrder')}
          </Button>
          <Button
            onClick={handleSubmitOrder}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {t('orderSummary.submitOrder')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
