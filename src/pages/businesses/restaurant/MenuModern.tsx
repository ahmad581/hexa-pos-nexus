import { useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
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

interface MenuModernProps {
  menuItems: MenuItem[];
  categories: Category[];
  toggleSoldOut: (itemId: string) => void;
  isEditingOrder: boolean;
  canManageMenu: boolean;
}

export const MenuModern = ({ menuItems, categories, toggleSoldOut, isEditingOrder, canManageMenu }: MenuModernProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { addItemToOrder } = useOrder();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  const handleCategorySelect = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setSearchTerm("");
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchTerm("");
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Show categories first
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('menu.categories')}</h2>
          <p className="text-gray-400">{t('menu.selectCategory')}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.filter(cat => cat.value !== 'all').map((category) => {
            const itemCount = menuItems.filter(item => item.category === category.value).length;
            return (
              <Card 
                key={category.value} 
                className="bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors p-6"
                onClick={() => handleCategorySelect(category.value)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">
                    {category.value === 'burgers' && '🍔'}
                    {category.value === 'pizza' && '🍕'}
                    {category.value === 'salads' && '🥗'}
                    {category.value === 'mains' && '🍽️'}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{category.label}</h3>
                  <p className="text-sm text-gray-400">{itemCount} {t('menu.items')}</p>
                </div>
              </Card>
            );
          })}
          
          {/* View All Items */}
          <Card 
            className="bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors p-6"
            onClick={() => handleCategorySelect('all')}
          >
              <div className="text-center">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-lg font-semibold text-white mb-1">{t('menu.allItems')}</h3>
                <p className="text-sm text-gray-400">{menuItems.length} {t('menu.items')}</p>
              </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show items for selected category
  const selectedCategoryLabel = categories.find(cat => cat.value === selectedCategory)?.label || t('menu.allItems');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleBackToCategories}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <ArrowLeft size={16} className="mr-2" />
          {t('menu.backToCategories')}
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">{selectedCategoryLabel}</h2>
          <p className="text-gray-400">{filteredItems.length} {t('menu.itemsAvailable')}</p>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder={t('menu.searchInCategory')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600"
          />
        </div>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-gray-800 border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                <div className="flex gap-2">
                  {item.soldOut && (
                    <Badge className="bg-red-600 text-white">{t('menu.soldOut')}</Badge>
                  )}
                  <Badge className={item.available ? "bg-green-600" : "bg-red-600"}>
                    {item.available ? t('menu.available') : t('menu.unavailable')}
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4">{item.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-green-400">{formatCurrency(item.price)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => addItemToOrder({ name: item.name, price: item.price })}
                  disabled={!item.available || item.soldOut}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                >
                  <Plus size={16} className="mr-2" />
                  {t('menu.addToOrder')}
                </Button>
                
                {!isEditingOrder && canManageMenu && (
                  <Button
                    onClick={() => toggleSoldOut(item.id)}
                    variant="outline"
                    size="sm"
                    className={`${item.soldOut ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}
                  >
                    {item.soldOut ? t('menu.markAvailable') : t('menu.markSoldOut')}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-gray-800 border-gray-700 p-8 text-center">
          <p className="text-gray-400">{t('menu.noItemsFound')}</p>
        </Card>
      )}
    </div>
  );
};