import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryName: string) => void;
  existingCategories: string[];
}

export const CreateCategoryDialog = ({
  isOpen,
  onClose,
  onSave,
  existingCategories,
}: CreateCategoryDialogProps) => {
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = categoryName.trim();
    
    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    if (existingCategories.some(c => c.toLowerCase() === trimmedName.toLowerCase())) {
      setError("This category already exists");
      return;
    }

    onSave(trimmedName);
    setCategoryName("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setCategoryName("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name *</Label>
            <Input
              id="category-name"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError("");
              }}
              placeholder="e.g., Beverages, Dairy, Produce"
              className="bg-muted border-border text-foreground"
              required
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>

          {existingCategories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Existing Categories:</Label>
              <div className="flex flex-wrap gap-2">
                {existingCategories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-1 bg-muted rounded text-sm text-muted-foreground"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!categoryName.trim()}
            >
              Create Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
