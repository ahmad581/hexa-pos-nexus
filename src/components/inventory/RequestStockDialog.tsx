import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useBranch } from "@/contexts/BranchContext";
import { useInventory } from "@/hooks/useInventory";
import type { InventoryItem, Warehouse } from "@/hooks/useInventory";
import { useTranslation } from "@/contexts/TranslationContext";

interface RequestStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  warehouses: Warehouse[];
  onRequestStock: (request: any) => Promise<any>;
}

export const RequestStockDialog = ({
  isOpen,
  onClose,
  item,
  warehouses,
  onRequestStock
}: RequestStockDialogProps) => {
  const { selectedBranch } = useBranch();
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !selectedBranch || !selectedWarehouse || !requestedQuantity) return;

    setLoading(true);
    try {
      await onRequestStock({
        branch_id: selectedBranch.id,
        warehouse_id: selectedWarehouse,
        inventory_item_id: item.id,
        requested_quantity: parseInt(requestedQuantity),
        request_notes: notes || undefined
      });
      
      onClose();
      setSelectedWarehouse("");
      setRequestedQuantity("");
      setNotes("");
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
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

  if (!item || !selectedBranch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>{t('inventory.requestDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Info */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{item.name}</h3>
              <Badge className={getStatusColor(item.status)}>
                {item.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div>{t('inventory.sku')}: {item.sku}</div>
              <div>{t('inventory.requestDialog.requestingBranch')}: {selectedBranch.name}</div>
              <div>{t('inventory.requestDialog.currentWarehouseStock')}: {item.current_stock} {t('inventoryReports.units')}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">{t('inventory.requestDialog.selectWarehouse')}</Label>
              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
                required
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder={t('inventory.requestDialog.chooseWarehouse')} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">{t('inventory.requestDialog.requestedQuantity')}</Label>
              <Input
                id="quantity"
                type="number"
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                min="1"
                max={item.current_stock}
                required
              />
              <div className="text-xs text-gray-400">
                {t('inventory.requestDialog.maximumAvailable')}: {item.current_stock} {t('inventoryReports.units')}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('inventory.requestDialog.requestNotes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder=""
                rows={3}
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
                disabled={loading || !selectedWarehouse || !requestedQuantity}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? t('inventory.requestDialog.submitting') : t('inventory.requestDialog.submit')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};