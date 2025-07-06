import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Search, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OrderSummary } from "@/components/OrderSummary";
import { useOrder } from "@/contexts/OrderContext";
import { useCall } from "@/contexts/CallContext";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  description: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

const initialCategories: Category[] = [
  { id: "1", name: "Burgers", description: "Delicious burgers and sandwiches" },
  { id: "2", name: "Pizza", description: "Fresh pizza with various toppings" },
  { id: "3", name: "Drinks", description: "Refreshing beverages" },
  { id: "4", name: "Desserts", description: "Sweet treats and desserts" }
];

const initialMenuItems: MenuItem[] = [
  { id: "1", name: "Classic Burger", description: "Beef patty with lettuce, tomato, and cheese", price: 12.99, category: "Burgers", available: true },
  { id: "2", name: "Margherita Pizza", description: "Fresh mozzarella, tomato sauce, and basil", price: 16.99, category: "Pizza", available: true },
  { id: "3", name: "Coca Cola", description: "Classic soft drink", price: 2.99, category: "Drinks", available: true },
  { id: "4", name: "Chocolate Cake", description: "Rich chocolate cake with frosting", price: 6.99, category: "Desserts", available: false }
];

export const Menu = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All Items");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [itemForm, setItemForm] = useState({ name: "", description: "", price: 0, category: "", available: true });
  const { toast } = useToast();
  const { addItemToOrder, setOrderType, setCustomerInfo } = useOrder();
  const { activeCallInfo } = useCall();

  // Auto-populate customer info if coming from call center
  useEffect(() => {
    if (activeCallInfo) {
      setOrderType('phone');
      setCustomerInfo({
        name: activeCallInfo.customerName,
        phone: activeCallInfo.phoneNumber,
        address: activeCallInfo.address
      });
      toast({ 
        title: `Taking order for ${activeCallInfo.customerName}`,
        description: `Phone: ${activeCallInfo.phoneNumber}`
      });
    }
  }, [activeCallInfo, setOrderType, setCustomerInfo, toast]);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All Items" || item.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategoryFilter(categoryName);
  };

  const handleSaveCategory = () => {
    if (selectedCategory) {
      setCategories(categories.map(cat => 
        cat.id === selectedCategory.id ? { ...cat, ...categoryForm } : cat
      ));
      toast({ title: "Category updated successfully!" });
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryForm
      };
      setCategories([...categories, newCategory]);
      toast({ title: "Category added successfully!" });
    }
    setCategoryDialogOpen(false);
    setSelectedCategory(null);
    setCategoryForm({ name: "", description: "" });
  };

  const handleSaveItem = () => {
    if (selectedItem) {
      setMenuItems(menuItems.map(item => 
        item.id === selectedItem.id ? { ...item, ...itemForm } : item
      ));
      toast({ title: "Menu item updated successfully!" });
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...itemForm
      };
      setMenuItems([...menuItems, newItem]);
      toast({ title: "Menu item added successfully!" });
    }
    setItemDialogOpen(false);
    setSelectedItem(null);
    setItemForm({ name: "", description: "", price: 0, category: "", available: true });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Call Center Info Banner */}
      {activeCallInfo && (
        <div className="lg:col-span-3 mb-6">
          <Card className="bg-blue-800 border-blue-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Phone className="text-blue-300" size={24} />
                <div>
                  <h3 className="text-white font-medium">Active Call Order</h3>
                  <p className="text-blue-200 text-sm">
                    {activeCallInfo.customerName} - {activeCallInfo.phoneNumber}
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white">Phone Order</Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Main Menu Content */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Menu Management</h1>
            <p className="text-gray-400">Manage categories and menu items</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Plus size={16} className="mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>{selectedCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Name</Label>
                    <Input
                      id="categoryName"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryDescription">Description</Label>
                    <Textarea
                      id="categoryDescription"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <Button onClick={handleSaveCategory} className="w-full bg-green-600 hover:bg-green-700">
                    {selectedCategory ? "Update" : "Add"} Category
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus size={16} className="mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>{selectedItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="itemName">Name</Label>
                    <Input
                      id="itemName"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemDescription">Description</Label>
                    <Textarea
                      id="itemDescription"
                      value={itemForm.description}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemPrice">Price ($)</Label>
                    <Input
                      id="itemPrice"
                      type="number"
                      step="0.01"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="itemCategory">Category</Label>
                    <select
                      id="itemCategory"
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleSaveItem} className="w-full bg-green-600 hover:bg-green-700">
                    {selectedItem ? "Update" : "Add"} Menu Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* All Items Category */}
            <div 
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedCategoryFilter === "All Items" 
                  ? "bg-green-600 text-white" 
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => handleCategoryClick("All Items")}
            >
              <h4 className="font-medium text-white">All Items</h4>
              <p className="text-gray-300 text-sm">Show all menu items</p>
            </div>
            
            {categories.map((category) => (
              <div 
                key={category.id} 
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedCategoryFilter === category.name 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{category.name}</h4>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(category);
                        setCategoryForm({ name: category.name, description: category.description });
                        setCategoryDialogOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategories(categories.filter(cat => cat.id !== category.id));
                        toast({ title: "Category deleted successfully!", variant: "destructive" });
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{category.description}</p>
              </div>
            ))}
          </div>

          {/* Selected Category Display */}
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <p className="text-white">
              <span className="font-medium">Active Filter:</span> 
              <span className="ml-2 px-2 py-1 bg-green-600 rounded text-sm">{selectedCategoryFilter}</span>
            </p>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Menu Items</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Description</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Category</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Price</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700">
                    <td className="py-3 text-white font-medium">{item.name}</td>
                    <td className="py-3 text-gray-300 max-w-xs truncate">{item.description}</td>
                    <td className="py-3 text-gray-300">{item.category}</td>
                    <td className="py-3 text-white font-semibold">${item.price.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.available 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        {item.available && (
                          <Button
                            size="sm"
                            onClick={() => addItemToOrder({ name: item.name, price: item.price })}
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            Add to Order
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedItem(item);
                            setItemForm({
                              name: item.name,
                              description: item.description,
                              price: item.price,
                              category: item.category,
                              available: item.available
                            });
                            setItemDialogOpen(true);
                          }}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setMenuItems(menuItems.filter(i => i.id !== item.id));
                            toast({ title: "Menu item deleted successfully!", variant: "destructive" });
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <OrderSummary />
      </div>
    </div>
  );
};
