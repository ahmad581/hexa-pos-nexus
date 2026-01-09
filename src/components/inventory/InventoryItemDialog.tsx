import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import type { InventoryItem, Warehouse } from "@/hooks/useInventory";
import { useTranslation } from "@/contexts/TranslationContext";

interface InventoryItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  warehouses: Warehouse[];
  categories: string[];
  onSave: (data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const InventoryItemDialog = ({
  isOpen,
  onClose,
  item,
  warehouses,
  categories,
  onSave,
  onDelete
}: InventoryItemDialogProps) => {
  const [formData, setFormData] = useState({
    warehouse_id: "",
    name: "",
    sku: "",
    category: "",
    description: "",
    current_stock: 0,
    min_stock: 0,
    max_stock: 100,
    unit_price: "",
    supplier: "",
    expiry_date: ""
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (item) {
      setFormData({
        warehouse_id: item.warehouse_id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        description: item.description || "",
        current_stock: item.current_stock,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        unit_price: item.unit_price?.toString() || "",
        supplier: item.supplier || "",
        expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : ""
      });
    } else {
      setFormData({
        warehouse_id: "",
        name: "",
        sku: "",
        category: "",
        description: "",
        current_stock: 0,
        min_stock: 0,
        max_stock: 100,
        unit_price: "",
        supplier: "",
        expiry_date: ""
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        expiry_date: formData.expiry_date || null
      };

      if (item) {
        await onSave(submitData);
      } else {
        await onSave(submitData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !onDelete) return;
    
    setLoading(true);
    try {
      await onDelete(item.id);
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {item ? t('inventory.itemDialog.titleEdit') : t('inventory.itemDialog.titleAdd')}
            </DialogTitle>
            {item && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('inventory.itemDialog.delete')}</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        {t('inventory.itemDialog.deleteConfirm')} "{item.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
                        {t('inventory.itemDialog.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {t('inventory.itemDialog.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">{t('inventory.itemDialog.warehouse')}</Label>
              <Select
                value={formData.warehouse_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, warehouse_id: value }))}
                required
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder={t('inventory.selectWarehouse')} />
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
              <Label htmlFor="category">{t('inventory.itemDialog.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder={t('inventory.selectCategory')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('inventory.itemDialog.itemName')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">{t('inventory.itemDialog.sku')}</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('inventory.itemDialog.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-gray-700 border-gray-600 text-white"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_stock">{t('inventory.itemDialog.currentStock')}</Label>
              <Input
                id="current_stock"
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                className="bg-gray-700 border-gray-600 text-white"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_stock">{t('inventory.itemDialog.minStock')}</Label>
              <Input
                id="min_stock"
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                className="bg-gray-700 border-gray-600 text-white"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_stock">{t('inventory.itemDialog.maxStock')}</Label>
              <Input
                id="max_stock"
                type="number"
                value={formData.max_stock}
                onChange={(e) => setFormData(prev => ({ ...prev, max_stock: parseInt(e.target.value) || 0 }))}
                className="bg-gray-700 border-gray-600 text-white"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price">{t('inventory.itemDialog.unitPrice')}</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">{t('inventory.itemDialog.supplier')}</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
              <Label htmlFor="expiry_date">{t('inventory.itemDialog.expiryDate')}</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
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
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? t('inventory.itemDialog.saving') : item ? t('inventory.itemDialog.update') : t('inventory.itemDialog.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};