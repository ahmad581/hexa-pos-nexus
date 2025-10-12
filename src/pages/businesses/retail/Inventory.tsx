
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search,
  Filter,
  Package,
  Truck,
  FileText,
  Edit
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { InventoryItemDialog } from "@/components/inventory/InventoryItemDialog";
import { StockUpdateDialog } from "@/components/inventory/StockUpdateDialog";
import { RequestStockDialog } from "@/components/inventory/RequestStockDialog";
import { InventoryRequests } from "@/components/inventory/InventoryRequests";
import { InventoryReports } from "@/components/inventory/InventoryReports";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";

export const Inventory = () => {
  const { userBranchId } = useAuth();
  const { t } = useTranslation();
  const { items, warehouses, requests, loading, updateStock, addItem, updateItem, deleteItem, requestStock, approveRequest, fulfillRequest } = useInventory(userBranchId || undefined);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Low Stock":
      case "Out of Stock":
      case "Expired":
        return <AlertTriangle size={16} />;
      case "Overstock":
        return <TrendingUp size={16} />;
      default:
        return <TrendingDown size={16} />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = selectedWarehouse === "all" || item.warehouse_id === selectedWarehouse;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesWarehouse && matchesCategory;
  });

  const categories = [...new Set(items.map(item => item.category))];

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setIsItemDialogOpen(true);
  };

  const handleUpdateStock = (item: any) => {
    setSelectedItem(item);
    setIsStockDialogOpen(true);
  };

  const handleRequestStock = (item: any) => {
    setSelectedItem(item);
    setIsRequestDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('inventory.title')}</h1>
          <p className="text-gray-400">{t('inventory.subtitle')}</p>
        </div>
        <Button 
          onClick={() => setIsItemDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('inventory.addItem')}
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('inventory.tabs.inventory')}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            {t('inventory.tabs.requests')}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('inventory.tabs.reports')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('inventory.searchItems')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder={t('inventory.selectWarehouse')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('inventory.allWarehouses')}</SelectItem>
                {warehouses.map(warehouse => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder={t('inventory.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('inventory.allCategories')}</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="bg-gray-800 border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <Badge className={getStatusColor(item.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      {item.status}
                    </span>
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="text-gray-300">
                    <span className="text-sm">{t('inventory.sku')}: {item.sku}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-sm">{t('inventory.category')}: {item.category}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-sm">{t('inventory.warehouse')}: {item.warehouse?.name}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-2xl font-bold text-white">{item.current_stock}</span>
                    <span className="text-sm ml-2">{t('inventory.unitsInStock')}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    <div>{t('inventory.min')}: {item.min_stock} | {t('inventory.max')}: {item.max_stock}</div>
                    {item.unit_price && <div>{t('inventory.price')}: ${item.unit_price}</div>}
                    {item.last_restocked && (
                      <div>{t('inventory.lastRestocked')}: {new Date(item.last_restocked).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleUpdateStock(item)}
                  >
                    {t('inventory.updateStock')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleEditItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={() => handleRequestStock(item)}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {t('inventory.requestFromBranch')}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <InventoryRequests 
            requests={requests}
            loading={loading}
            onApproveRequest={approveRequest}
            onFulfillRequest={fulfillRequest}
          />
        </TabsContent>

        <TabsContent value="reports">
          <InventoryReports />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <InventoryItemDialog
        isOpen={isItemDialogOpen}
        onClose={() => {
          setIsItemDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        warehouses={warehouses}
        onSave={async (data: any) => {
          if (selectedItem) {
            await updateItem(selectedItem.id, data);
          } else {
            await addItem(data);
          }
        }}
        onDelete={selectedItem ? deleteItem : undefined}
      />

      <StockUpdateDialog
        isOpen={isStockDialogOpen}
        onClose={() => {
          setIsStockDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onUpdate={updateStock}
      />

      <RequestStockDialog
        isOpen={isRequestDialogOpen}
        onClose={() => {
          setIsRequestDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        warehouses={warehouses}
        onRequestStock={requestStock}
      />
    </div>
  );
};
