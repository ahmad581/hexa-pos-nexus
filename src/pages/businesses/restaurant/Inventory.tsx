import { useState, useEffect } from "react";
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
  Package,
  Truck,
  FileText,
  Edit,
  Warehouse,
  FolderPlus
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useInventoryPermissions } from "@/hooks/useInventoryPermissions";
import { InventoryItemDialog } from "@/components/inventory/InventoryItemDialog";
import { StockUpdateDialog } from "@/components/inventory/StockUpdateDialog";
import { RequestStockDialog } from "@/components/inventory/RequestStockDialog";
import { InventoryRequests } from "@/components/inventory/InventoryRequests";
import { InventoryReports } from "@/components/inventory/InventoryReports";
import { CreateWarehouseDialog } from "@/components/inventory/CreateWarehouseDialog";
import { CreateCategoryDialog } from "@/components/inventory/CreateCategoryDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function RestaurantInventory() {
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const {
    hasInventoryFeature,
    hasFullAccess,
    canManageItems,
    canManageWarehouses,
    canUpdateStock,
    canRequestStock,
    canManageRequests,
    isCashier,
    getCashierBranchId
  } = useInventoryPermissions();

  // For cashiers, filter to their branch only
  const branchIdFilter = isCashier() ? getCashierBranchId() : selectedBranch?.id;

  const {
    items,
    warehouses,
    requests,
    loading,
    updateStock,
    addItem,
    updateItem,
    deleteItem,
    requestStock,
    approveRequest,
    fulfillRequest,
    addWarehouse
  } = useInventory(branchIdFilter || undefined);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Load custom categories from localStorage on mount
  useEffect(() => {
    if (userProfile?.business_id) {
      const storageKey = `inventory_categories_${userProfile.business_id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setCustomCategories(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored categories', e);
        }
      }
    }
  }, [userProfile?.business_id]);

  // Combine item categories with custom categories
  const itemCategories = [...new Set(items.map((i) => i.category))];
  const categories = [...new Set([...itemCategories, ...customCategories])].sort();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-500/20 text-green-400";
      case "Low Stock":
        return "bg-yellow-500/20 text-yellow-400";
      case "Out of Stock":
        return "bg-red-500/20 text-red-400";
      case "Overstock":
        return "bg-blue-500/20 text-blue-400";
      case "Expired":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
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

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = selectedWarehouse === "all" || item.warehouse_id === selectedWarehouse;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesWarehouse && matchesCategory;
  });

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

  const handleCategoryCreate = (categoryName: string) => {
    if (!userProfile?.business_id) {
      toast.error("Unable to create category - no business found");
      return;
    }
    
    // Add to custom categories and save to localStorage
    const updatedCategories = [...new Set([...customCategories, categoryName])];
    setCustomCategories(updatedCategories);
    
    const storageKey = `inventory_categories_${userProfile.business_id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedCategories));
    
    toast.success(`Category "${categoryName}" created successfully`);
    setIsCategoryDialogOpen(false);
  };

  // Check if user has access to inventory feature
  if (!hasInventoryFeature()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Inventory Feature Not Available</h2>
          <p className="text-gray-400">This business doesn't have the inventory feature enabled.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Restaurant Inventory</h1>
          <p className="text-gray-400">
            {isCashier() 
              ? "View inventory and request items for your branch" 
              : "Manage your restaurant's ingredient stock levels"
            }
          </p>
        </div>
        
        {/* Action Buttons - Only show for users with full access */}
        {hasFullAccess() && (
          <div className="flex gap-2">
            {canManageWarehouses() && (
              <Button 
                onClick={() => setIsWarehouseDialogOpen(true)} 
                variant="outline"
              >
                <Warehouse className="h-4 w-4 mr-2" /> New Warehouse
              </Button>
            )}
            {canManageItems() && (
              <>
                <Button 
                  onClick={() => setIsCategoryDialogOpen(true)} 
                  variant="outline"
                >
                  <FolderPlus className="h-4 w-4 mr-2" /> New Category
                </Button>
                <Button onClick={() => setIsItemDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Inventory
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> Requests
          </TabsTrigger>
          {hasFullAccess() && (
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Reports
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
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
                    <span className="text-sm">SKU: {item.sku}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-sm">Category: {item.category}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-sm">Warehouse: {item.warehouse?.name}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-2xl font-bold text-white">{item.current_stock}</span>
                    <span className="text-sm ml-2">units in stock</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    <div>Min: {item.min_stock} | Max: {item.max_stock}</div>
                    {item.unit_price && <div>Price: ${item.unit_price}</div>}
                    {item.last_restocked && (
                      <div>Last Restocked: {new Date(item.last_restocked).toLocaleDateString()}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {canUpdateStock() && (
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateStock(item)}>
                      Update Stock
                    </Button>
                  )}
                  {canManageItems() && (
                    <Button size="sm" variant="ghost" onClick={() => handleEditItem(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {canRequestStock() && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full mt-2"
                    onClick={() => handleRequestStock(item)}
                  >
                    <Truck className="h-4 w-4 mr-2" /> Request Stock
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No inventory items found</h3>
              <p className="text-gray-400">
                {hasFullAccess() 
                  ? "Get started by adding your first inventory item."
                  : "No inventory items are available for your branch."
                }
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <InventoryRequests
            requests={requests}
            loading={loading}
            onApproveRequest={canManageRequests() ? approveRequest : undefined}
            onFulfillRequest={canManageRequests() ? fulfillRequest : undefined}
          />
        </TabsContent>

        {hasFullAccess() && (
          <TabsContent value="reports">
            <InventoryReports />
          </TabsContent>
        )}
      </Tabs>

      {/* Dialogs */}
      {canManageItems() && (
        <InventoryItemDialog
          isOpen={isItemDialogOpen}
          onClose={() => {
            setIsItemDialogOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          warehouses={warehouses}
          categories={categories}
          onSave={async (data: any) => {
            if (selectedItem) {
              await updateItem(selectedItem.id, data);
            } else {
              await addItem(data);
            }
          }}
          onDelete={selectedItem ? deleteItem : undefined}
        />
      )}

      {canUpdateStock() && (
        <StockUpdateDialog
          isOpen={isStockDialogOpen}
          onClose={() => {
            setIsStockDialogOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onUpdate={updateStock}
        />
      )}

      {canRequestStock() && (
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
      )}

      {canManageWarehouses() && (
        <CreateWarehouseDialog
          isOpen={isWarehouseDialogOpen}
          onClose={() => setIsWarehouseDialogOpen(false)}
          onSave={addWarehouse}
        />
      )}

      {canManageItems() && (
        <CreateCategoryDialog
          isOpen={isCategoryDialogOpen}
          onClose={() => setIsCategoryDialogOpen(false)}
          onSave={handleCategoryCreate}
          existingCategories={categories}
        />
      )}
    </div>
  );
}
