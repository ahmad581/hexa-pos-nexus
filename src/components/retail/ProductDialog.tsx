import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { RetailProduct, RetailProductInsert } from "@/hooks/useRetailProducts";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: RetailProduct | null;
  onSave: (product: RetailProductInsert | (Partial<RetailProduct> & { id: string })) => void;
  businessId: string;
  branchId: string;
}

export const ProductDialog = ({ open, onOpenChange, product, onSave, businessId, branchId }: ProductDialogProps) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    category: 'General',
    brand: '',
    cost_price: 0,
    selling_price: 0,
    sale_price: 0,
    is_on_sale: false,
    stock_quantity: 0,
    min_stock: 0,
    size: '',
    color: '',
    material: '',
    weight: 0,
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        barcode: product.barcode || '',
        category: product.category,
        brand: product.brand || '',
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        sale_price: product.sale_price || 0,
        is_on_sale: product.is_on_sale,
        stock_quantity: product.stock_quantity,
        min_stock: product.min_stock,
        size: product.size || '',
        color: product.color || '',
        material: product.material || '',
        weight: product.weight || 0,
      });
    } else {
      setForm({
        name: '', description: '', sku: `SKU-${Date.now().toString(36).toUpperCase()}`, barcode: '',
        category: 'General', brand: '', cost_price: 0, selling_price: 0, sale_price: 0,
        is_on_sale: false, stock_quantity: 0, min_stock: 0, size: '', color: '', material: '', weight: 0,
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      onSave({
        id: product.id,
        ...form,
        description: form.description || null,
        barcode: form.barcode || null,
        brand: form.brand || null,
        sale_price: form.is_on_sale ? form.sale_price : null,
        size: form.size || null,
        color: form.color || null,
        material: form.material || null,
        weight: form.weight || null,
      });
    } else {
      onSave({
        ...form,
        business_id: businessId,
        branch_id: branchId,
        description: form.description || null,
        barcode: form.barcode || null,
        brand: form.brand || null,
        sale_price: form.is_on_sale ? form.sale_price : null,
        size: form.size || null,
        color: form.color || null,
        material: form.material || null,
        weight: form.weight || null,
        image_url: null,
        is_active: true,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>SKU *</Label>
              <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cost Price</Label>
              <Input type="number" step="0.01" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Selling Price *</Label>
              <Input type="number" step="0.01" value={form.selling_price} onChange={e => setForm(f => ({ ...f, selling_price: parseFloat(e.target.value) || 0 }))} required />
            </div>
            <div className="space-y-2">
              <Label>Stock Quantity</Label>
              <Input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Min Stock</Label>
              <Input type="number" value={form.min_stock} onChange={e => setForm(f => ({ ...f, min_stock: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Input value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_on_sale} onCheckedChange={v => setForm(f => ({ ...f, is_on_sale: v }))} />
              <Label>On Sale</Label>
            </div>
            {form.is_on_sale && (
              <div className="space-y-2">
                <Label>Sale Price</Label>
                <Input type="number" step="0.01" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: parseFloat(e.target.value) || 0 }))} />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{product ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
