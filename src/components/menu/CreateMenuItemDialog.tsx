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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Printer } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useSettings } from "@/contexts/SettingsContext";

interface Category {
  value: string;
  label: string;
}

interface CreateMenuItemDialogProps {
  categories: Category[];
  onItemCreate: (item: {
    name: string;
    description: string;
    price: number;
    category: string;
    printer_ids: string[];
  }) => void;
}

export const CreateMenuItemDialog = ({ categories, onItemCreate }: CreateMenuItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [selectedPrinters, setSelectedPrinters] = useState<string[]>([]);
  const { t } = useTranslation();
  const { settings } = useSettings();

  // Get printers from settings, excluding the default printer (it always prints all items)
  const availablePrinters = settings.printers.filter(p => !p.is_default);
  const defaultPrinter = settings.printers.find(p => p.is_default);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && price && category) {
      onItemCreate({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        printer_ids: selectedPrinters,
      });
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setSelectedPrinters([]);
      setOpen(false);
    }
  };

  const togglePrinter = (printerId: string) => {
    setSelectedPrinters(prev => 
      prev.includes(printerId)
        ? prev.filter(id => id !== printerId)
        : [...prev, printerId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Plus size={16} className="mr-2" />
          Add Menu Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cheeseburger"
              className="bg-muted border-border"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Juicy beef patty with cheese"
              className="bg-muted border-border"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              className="bg-muted border-border"
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {categories.filter(cat => cat.value !== 'all').map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Printer Routing Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Printer size={16} className="text-muted-foreground" />
              <Label>Print to Additional Printers</Label>
            </div>
            
            {defaultPrinter && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">{defaultPrinter.name}</span> (default) will always print this item.
              </p>
            )}
            
            {availablePrinters.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No additional printers configured. Add printers in Settings to enable routing.
              </p>
            ) : (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg border border-border">
                {availablePrinters.map((printer) => (
                  <div key={printer.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`printer-${printer.id}`}
                      checked={selectedPrinters.includes(printer.id)}
                      onCheckedChange={() => togglePrinter(printer.id)}
                    />
                    <label
                      htmlFor={`printer-${printer.id}`}
                      className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                    >
                      {printer.name}
                      <span className="text-xs text-muted-foreground">
                        {printer.use_for_kitchen && "(Kitchen)"}
                        {printer.use_for_receipts && "(Receipts)"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Add Item
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
