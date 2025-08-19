import { useState } from "react";
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  status: "Normal" | "Low Stock" | "Out of Stock" | "Overstock" | "Expired";
}

const initialInventory: InventoryItem[] = [
  {
    id: "1",
    name: "Tomatoes",
    category: "Vegetables",
    currentStock: 50,
    minStock: 20,
    maxStock: 100,
    unit: "kg",
    unitPrice: 3.50,
    supplier: "Fresh Farm Co",
    lastRestocked: "2024-01-15",
    expiryDate: "2024-01-20",
    status: "Normal",
  },
  {
    id: "2",
    name: "Chicken Breast",
    category: "Meat",
    currentStock: 15,
    minStock: 20,
    maxStock: 80,
    unit: "kg",
    unitPrice: 12.99,
    supplier: "Quality Meats Ltd",
    lastRestocked: "2024-01-14",
    expiryDate: "2024-01-18",
    status: "Low Stock",
  },
  {
    id: "3",
    name: "Olive Oil",
    category: "Condiments",
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unit: "bottles",
    unitPrice: 8.99,
    supplier: "Mediterranean Imports",
    lastRestocked: "2024-01-10",
    status: "Normal",
  },
  {
    id: "4",
    name: "Bread Flour",
    category: "Baking",
    currentStock: 0,
    minStock: 15,
    maxStock: 60,
    unit: "kg",
    unitPrice: 2.99,
    supplier: "Baker's Supply",
    lastRestocked: "2024-01-05",
    status: "Out of Stock",
  },
];

export default function RestaurantInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: "Vegetables",
    unit: "kg",
    status: "Normal",
  });
  const { toast } = useToast();

  const categories = ["All", "Vegetables", "Meat", "Condiments", "Baking", "Dairy", "Beverages"];

  const getStatusColor = (status: InventoryItem["status"]) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      case "Overstock":
        return "bg-blue-100 text-blue-800";
      case "Expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.currentStock || !newItem.unitPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name!,
      category: newItem.category!,
      currentStock: newItem.currentStock!,
      minStock: newItem.minStock || 10,
      maxStock: newItem.maxStock || 100,
      unit: newItem.unit!,
      unitPrice: newItem.unitPrice!,
      supplier: newItem.supplier || "Unknown",
      lastRestocked: new Date().toISOString().split('T')[0],
      expiryDate: newItem.expiryDate,
      status: newItem.status as InventoryItem["status"],
    };

    setInventory([...inventory, item]);
    setNewItem({
      category: "Vegetables",
      unit: "kg",
      status: "Normal",
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Inventory item added successfully.",
    });
  };

  const handleStockUpdate = (id: string, change: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.currentStock + change);
        let newStatus: InventoryItem["status"] = "Normal";
        
        if (newStock === 0) {
          newStatus = "Out of Stock";
        } else if (newStock <= item.minStock) {
          newStatus = "Low Stock";
        } else if (newStock >= item.maxStock) {
          newStatus = "Overstock";
        }
        
        return { ...item, currentStock: newStock, status: newStatus };
      }
      return item;
    }));

    toast({
      title: "Stock Updated",
      description: "Inventory quantity has been updated.",
    });
  };

  const lowStockCount = inventory.filter(item => item.status === "Low Stock" || item.status === "Out of Stock").length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Restaurant Inventory</h1>
          <p className="text-muted-foreground">Manage your restaurant's ingredient inventory</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new ingredient or supply to your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={newItem.name || ""}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Fresh Basil"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="currentStock">Current Stock *</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={newItem.currentStock || ""}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                      <SelectItem value="bottles">bottles</SelectItem>
                      <SelectItem value="cans">cans</SelectItem>
                      <SelectItem value="liters">liters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newItem.minStock || ""}
                    onChange={(e) => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxStock">Max Stock</Label>
                  <Input
                    id="maxStock"
                    type="number"
                    value={newItem.maxStock || ""}
                    onChange={(e) => setNewItem({ ...newItem, maxStock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={newItem.unitPrice || ""}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={newItem.supplier || ""}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newItem.expiryDate || ""}
                  onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage your restaurant's ingredient stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.expiryDate && (
                        <div className="text-sm text-muted-foreground">
                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Min: {item.minStock} | Max: {item.maxStock}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockUpdate(item.id, -1)}
                        disabled={item.currentStock === 0}
                      >
                        -
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStockUpdate(item.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}