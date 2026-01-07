import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UtensilsCrossed, ShoppingCart, DollarSign } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useOrder } from "@/contexts/OrderContext";
import { useBranch } from "@/contexts/BranchContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AddUnitDialog } from "@/components/AddUnitDialog";

export const Tables = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSelectedTable, setOrderType } = useOrder();
  const { selectedBranch } = useBranch();

  const { data: tables = [], refetch } = useQuery({
    queryKey: ["tables", selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data, error } = await supabase
        .from("tables")
        .select("*")
        .eq("branch_id", selectedBranch.id)
        .order("table_number");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBranch?.id,
  });

  const { data: activeOrders = [] } = useQuery({
    queryKey: ["table-orders", selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data: orders, error } = await supabase
        .from("orders")
        .select(`
          id,
          table_id,
          status,
          total_amount,
          order_items (id, quantity)
        `)
        .eq("branch_id", selectedBranch.id)
        .in("status", ["pending", "preparing", "ready"]);
      if (error) throw error;
      return orders;
    },
    enabled: !!selectedBranch?.id,
    refetchInterval: 10000,
  });

  const getTableOrders = (tableId: string) => {
    return activeOrders.filter((order) => order.table_id === tableId);
  };

  const handleTakeOrder = (tableNumber: string) => {
    setOrderType('dine-in');
    setSelectedTable(parseInt(tableNumber) || 1);
    navigate('/menu');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available": return "bg-green-500/20 text-green-400";
      case "occupied": return "bg-red-500/20 text-red-400";
      case "reserved": return "bg-yellow-500/20 text-yellow-400";
      case "cleaning": return "bg-blue-500/20 text-blue-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "available": return t('tables.available') || 'Available';
      case "occupied": return t('tables.occupied') || 'Occupied';
      case "reserved": return t('tables.reserved') || 'Reserved';
      case "cleaning": return t('tables.cleaning') || 'Cleaning';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('tables.title')}</h1>
          <p className="text-gray-400">{t('tablesPage.monitor')}</p>
        </div>
        <AddUnitDialog unitType="table" onSuccess={() => refetch()} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{t('tables.tableNumber')} {table.table_number}</h3>
              <Badge className={getStatusColor(table.status)}>
                {getStatusLabel(table.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Users size={16} className="mr-2" />
                <span className="text-sm">{t('tables.seats')} {table.capacity}</span>
              </div>

              {table.location && (
                <div className="text-gray-400 text-sm">
                  Location: {table.location}
                </div>
              )}

              {(() => {
                const tableOrders = getTableOrders(table.id);
                if (tableOrders.length > 0) {
                  const totalItems = tableOrders.reduce((sum, order) => 
                    sum + (order.order_items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);
                  const totalAmount = tableOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
                  return (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary">
                          <ShoppingCart size={14} className="mr-1.5" />
                          <span className="text-sm font-medium">{totalItems} items</span>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {tableOrders.length} order{tableOrders.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="flex items-center text-green-400">
                        <DollarSign size={14} className="mr-1" />
                        <span className="text-sm font-semibold">{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <Button
                onClick={() => handleTakeOrder(table.table_number)}
                className="w-full mt-4"
                variant="default"
              >
                <UtensilsCrossed size={16} className="mr-2" />
                {getTableOrders(table.id).length > 0 ? (t('tables.addOrder') || 'Add Order') : (t('tables.takeOrder') || 'Take Order')}
              </Button>
            </div>
          </Card>
        ))}

        {tables.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No tables found. Add your first table to get started.
          </div>
        )}
      </div>
    </div>
  );
};
