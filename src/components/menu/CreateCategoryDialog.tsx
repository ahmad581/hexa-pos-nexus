import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface CreateCategoryDialogProps {
  onCategoryCreate: (categoryValue: string, categoryLabel: string) => void;
}

export const CreateCategoryDialog = ({ onCategoryCreate }: CreateCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryValue.trim() && categoryLabel.trim()) {
      onCategoryCreate(categoryValue.trim().toLowerCase(), categoryLabel.trim());
      setCategoryValue("");
      setCategoryLabel("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="categoryValue">Category Key</Label>
            <Input
              id="categoryValue"
              value={categoryValue}
              onChange={(e) => setCategoryValue(e.target.value)}
              placeholder="e.g., desserts"
              className="bg-gray-700 border-gray-600"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Used internally (lowercase, no spaces)</p>
          </div>
          <div>
            <Label htmlFor="categoryLabel">Display Name</Label>
            <Input
              id="categoryLabel"
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              placeholder="e.g., Desserts"
              className="bg-gray-700 border-gray-600"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Shown to customers</p>
          </div>
          <Button type="submit" className="w-full">
            Add Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
