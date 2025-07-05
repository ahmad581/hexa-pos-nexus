
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { useToast } from "@/hooks/use-toast";

export const OrderSummary = () => {
  const { 
    currentOrder, 
    selectedTable, 
    removeItemFromOrder, 
    updateItemQuantity, 
    submitOrder, 
    clearCurrentOrder 
  } = useOrder();
  const { toast } = useToast();

  const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = () => {
    if (currentOrder.length === 0) {
      toast({ title: "Cannot submit empty order", variant: "destructive" });
      return;
    }
    
    submitOrder();
    toast({ title: "Order submitted successfully!" });
  };

  if (currentOrder.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="text-center text-gray-400">
          <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
          <p>No items in current order</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Current Order</h3>
        {selectedTable && (
          <Badge className="bg-green-600">Table {selectedTable}</Badge>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {currentOrder.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
            <div className="flex-1">
              <h4 className="text-white font-medium">{item.name}</h4>
              <p className="text-gray-300 text-sm">${item.price.toFixed(2)} each</p>
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
          <span className="text-lg font-semibold text-white">Total:</span>
          <span className="text-lg font-bold text-green-400">${total.toFixed(2)}</span>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={clearCurrentOrder}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300"
          >
            Clear Order
          </Button>
          <Button
            onClick={handleSubmitOrder}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Submit Order
          </Button>
        </div>
      </div>
    </Card>
  );
};
