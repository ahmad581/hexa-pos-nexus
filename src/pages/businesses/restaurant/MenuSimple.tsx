import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrder } from "@/contexts/OrderContext";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  soldOut: boolean;
}

interface Category {
  value: string;
  label: string;
  icon?: string;
}

interface MenuSimpleProps {
  menuItems: MenuItem[];
  categories: Category[];
  toggleSoldOut: (itemId: string) => void;
  isEditingOrder: boolean;
}

export const MenuSimple = ({ menuItems, categories, toggleSoldOut, isEditingOrder }: MenuSimpleProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { addItemToOrder } = useOrder();

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedCategoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || 'All Items';

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Upper Part - Items Display (70% height) */}  
      <div className="flex-1 min-h-0 mb-6">
        <Card className="bg-gray-800 border-gray-700 h-full">
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedCategoryLabel}</h2>
                <p className="text-gray-400">{filteredItems.length} items available</p>
              </div>
              
              {/* Search */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600"
                />
              </div>
            </div>

            {/* Items Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="bg-gray-700 border-gray-600 overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-base font-semibold text-white truncate">{item.name}</h3>
                        <div className="flex gap-1 ml-2">
                          {item.soldOut && (
                            <Badge className="bg-red-600 text-white text-xs">Sold Out</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-green-400">${item.price}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => addItemToOrder({ name: item.name, price: item.price })}
                          disabled={!item.available || item.soldOut}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-xs"
                        >
                          <Plus size={14} className="mr-1" />
                          Add
                        </Button>
                        
                        {!isEditingOrder && (
                          <Button
                            onClick={() => toggleSoldOut(item.id)}
                            variant="outline"
                            size="sm"
                            className={`text-xs px-2 ${item.soldOut ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
                          >
                            {item.soldOut ? '✓' : '✕'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No items found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Part - Categories (30% height) */}
      <div className="h-48">
        <Card className="bg-gray-800 border-gray-700 h-full">
          <div className="p-4 h-full">
            <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
            <div className="grid grid-cols-5 gap-3 h-full">
              {categories.map((category) => {
                const itemCount = category.value === 'all' 
                  ? menuItems.length 
                  : menuItems.filter(item => item.category === category.value).length;
                
                return (
                  <Button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    className={`h-full flex flex-col justify-center items-center p-2 ${
                      selectedCategory === category.value 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {category.value === 'all' && '📋'}
                      {category.value === 'burgers' && '🍔'}
                      {category.value === 'pizza' && '🍕'}
                      {category.value === 'salads' && '🥗'}
                      {category.value === 'mains' && '🍽️'}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">{category.label}</span>
                    <span className="text-xs text-gray-400">{itemCount}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};