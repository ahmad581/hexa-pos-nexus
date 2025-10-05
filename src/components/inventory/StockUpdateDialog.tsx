import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/hooks/useInventory";
import { useTranslation } from "@/contexts/TranslationContext";

interface StockUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  onUpdate: (id: string, quantity: number, type: 'Add' | 'Remove' | 'Adjustment', reason?: string) => Promise<void>;
}

export const StockUpdateDialog = ({
  isOpen,
  onClose,
  item,
  onUpdate
}: StockUpdateDialogProps) => {
  const [transactionType, setTransactionType] = useState<'Add' | 'Remove' | 'Adjustment'>('Add');
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !quantity) return;

    setLoading(true);
    try {
      await onUpdate(item.id, parseInt(quantity), transactionType, reason || undefined);
      onClose();
      setQuantity("");
      setReason("");
      setTransactionType('Add');
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNewStock = () => {
    if (!item || !quantity) return item?.current_stock || 0;
    
    const qty = parseInt(quantity);
    switch (transactionType) {
      case 'Add':
        return item.current_stock + qty;
      case 'Remove':
        return Math.max(0, item.current_stock - qty);
      case 'Adjustment':
        return qty;
      default:
        return item.current_stock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal": return "bg-green-500/20 text-green-400";
      case "Low Stock": return "bg-yellow-500/20 text-yellow-400";
      case "Out of Stock": return "bg-red-500/20 text-red-400";
      case "Overstock": return "bg-blue-500/20 text-blue-400";
      case "Expired": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>{t('inventory.stockDialog.title')} - {item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Item Info */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{item.name}</h3>
              <Badge className={getStatusColor(item.status)}>
                {item.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>SKU: {item.sku}</div>
              <div>Current Stock: {item.current_stock} units</div>
              <div>Min: {item.min_stock} | Max: {item.max_stock}</div>
              <div>Warehouse: {item.warehouse?.name}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_type">{t('inventory.stockDialog.transactionType')}</Label>
              <Select
                value={transactionType}
                onValueChange={(value: 'Add' | 'Remove' | 'Adjustment') => setTransactionType(value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Add">{t('inventory.stockDialog.addStock')}</SelectItem>
                  <SelectItem value="Remove">{t('inventory.stockDialog.removeStock')}</SelectItem>
                  <SelectItem value="Adjustment">{t('inventory.stockDialog.setExact')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                {transactionType === 'Adjustment' ? t('inventory.stockDialog.newStockLevel') : t('inventory.stockDialog.quantity')}
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                min={transactionType === 'Adjustment' ? "0" : "1"}
                required
              />
            </div>

            {quantity && (
              <div className="bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-300">
                <div>{t('inventory.stockDialog.currentStock')}: {item.current_stock}</div>
                <div className="font-semibold">{t('inventory.stockDialog.newStock')}: {getNewStock()}</div>
              </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">{t('inventory.stockDialog.reason')}</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder=""
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                {t('inventory.itemDialog.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !quantity}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? t('inventory.stockDialog.updating') : t('inventory.stockDialog.update')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};