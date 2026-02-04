import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOrder } from "@/contexts/OrderContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/hooks/useCurrency";

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
  canManageMenu: boolean;
}

export const MenuSimple = ({ menuItems, categories, toggleSoldOut, isEditingOrder, canManageMenu }: MenuSimpleProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { addItemToOrder } = useOrder();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedCategoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || t('menu.allItems');

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Upper Part - Items Display (70% height) */}  
      <div className="flex-1 min-h-0 mb-6">
        <div className="h-full flex flex-col">
          {/* Items Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-muted border border-border rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-semibold text-foreground truncate">{item.name}</h3>
                      <div className="flex gap-1 ml-2">
                        {item.soldOut && (
                          <Badge className="bg-red-600 text-white text-xs">{t('menu.soldOut')}</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-lg font-bold text-green-400">{formatCurrency(item.price)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => addItemToOrder({ name: item.name, price: item.price })}
                        disabled={!item.available || item.soldOut}
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-secondary text-xs"
                      >
                        <Plus size={14} className="mr-1" />
                        {t('common.add')}
                      </Button>
                      
                      {!isEditingOrder && canManageMenu && (
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
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t('menu.noItemsFound')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-4"></div>

      {/* Bottom Part - Categories (30% height) */}
      <div className="h-48">
        <div className="p-4 h-full">
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
                      : "bg-muted border-border text-muted-foreground hover:bg-accent"
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
                  <span className="text-xs text-muted-foreground">{itemCount}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
