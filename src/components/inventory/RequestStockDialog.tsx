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

interface RequestStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  warehouses: Warehouse[];
}

export const RequestStockDialog = ({
  isOpen,
  onClose,
  item,
  warehouses
}: RequestStockDialogProps) => {
  const { selectedBranch } = useBranch();
  const { requestStock } = useInventory();
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !selectedBranch || !selectedWarehouse || !requestedQuantity) return;

    setLoading(true);
    try {
      await requestStock({
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
          <DialogTitle>Request Stock Transfer</DialogTitle>
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
              <div>SKU: {item.sku}</div>
              <div>Requesting Branch: {selectedBranch.name}</div>
              <div>Current Warehouse Stock: {item.current_stock} units</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse">Select Warehouse</Label>
              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
                required
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Choose warehouse to request from" />
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
              <Label htmlFor="quantity">Requested Quantity</Label>
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
                Maximum available: {item.current_stock} units
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Request Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Add any additional information about this request..."
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !selectedWarehouse || !requestedQuantity}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};