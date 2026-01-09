import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/contexts/TranslationContext";

interface CreateWarehouseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    address: string;
    phone?: string;
    manager_name?: string;
  }) => Promise<any>;
}

export const CreateWarehouseDialog = ({
  isOpen,
  onClose,
  onSave,
}: CreateWarehouseDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    manager_name: "",
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) return;

    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim() || undefined,
        manager_name: formData.manager_name.trim() || undefined,
      });
      setFormData({ name: "", address: "", phone: "", manager_name: "" });
      onClose();
    } catch (error) {
      console.error("Error creating warehouse:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", address: "", phone: "", manager_name: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Warehouse</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="warehouse-name">Warehouse Name *</Label>
            <Input
              id="warehouse-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Main Warehouse"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse-address">Address *</Label>
            <Input
              id="warehouse-address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="e.g., 123 Storage St, City"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse-phone">Phone</Label>
            <Input
              id="warehouse-phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="e.g., +1 234 567 8900"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse-manager">Manager Name</Label>
            <Input
              id="warehouse-manager"
              value={formData.manager_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, manager_name: e.target.value }))
              }
              placeholder="e.g., John Smith"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.address.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Creating..." : "Create Warehouse"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
