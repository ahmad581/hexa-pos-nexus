
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, DollarSign } from "lucide-react";
import { useOrder } from "@/contexts/OrderContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/contexts/TranslationContext";
import { useCurrency } from "@/hooks/useCurrency";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved";
  currentOrder?: {
    id: string;
    items: number;
    total: number;
    startTime: string;
  };
}

const initialTables: Table[] = [
  { id: "1", number: 1, capacity: 2, status: "Available" },
  { id: "2", number: 2, capacity: 4, status: "Occupied", currentOrder: { id: "ORD-001", items: 3, total: 45.50, startTime: "1:30 PM" } },
  { id: "3", number: 3, capacity: 6, status: "Reserved" },
  { id: "4", number: 4, capacity: 2, status: "Available" },
  { id: "5", number: 5, capacity: 4, status: "Available" },
  { id: "6", number: 6, capacity: 8, status: "Occupied", currentOrder: { id: "ORD-002", items: 5, total: 89.25, startTime: "12:45 PM" } },
  { id: "7", number: 7, capacity: 4, status: "Available" },
  { id: "8", number: 8, capacity: 2, status: "Reserved" },
];

export const Tables = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const { orders, setSelectedTable, updateOrderStatus, setOrderType } = useOrder();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "Available": return "bg-green-500/20 text-green-400";
      case "Occupied": return "bg-red-500/20 text-red-400";
      case "Reserved": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleStatusChange = (tableId: string, newStatus: Table["status"]) => {
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, status: newStatus, ...(newStatus !== "Occupied" && { currentOrder: undefined }) }
        : table
    ));
  };

  const handleTakeOrder = (tableNumber: number) => {
    setOrderType('dine-in');
    setSelectedTable(tableNumber.toString());
    navigate('/menu');
  };

  const getTableOrders = (tableNumber: number) => {
    return orders.filter(order => order.tableNumber === tableNumber.toString());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('tablesPage.title')}</h1>
          <p className="text-gray-400">{t('tablesPage.monitor')}</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-300">{t('tables.available')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-300">{t('tables.occupied')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-300">{t('tables.reserved')}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {tables.filter(t => t.status === "Available").length}
            </div>
            <div className="text-gray-400 text-sm">{t('tables.available')}</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {tables.filter(t => t.status === "Occupied").length}
            </div>
            <div className="text-gray-400 text-sm">{t('tables.occupied')}</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {tables.filter(t => t.status === "Reserved").length}
            </div>
            <div className="text-gray-400 text-sm">{t('tables.reserved')}</div>
          </div>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const tableOrders = getTableOrders(table.number);
          const activeOrder = tableOrders.find(order => order.status !== 'served');

          return (
            <Card key={table.id} className="bg-gray-800 border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{t('tables.tableNumber')} {table.number}</h3>
                <Badge className={getStatusColor(table.status)}>
                  {t(`tables.${table.status.toLowerCase()}`)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
                  <Users size={16} className="mr-2" />
                  <span className="text-sm">{t('tablesPage.capacity')}: {table.capacity} {t('tables.guests')}</span>
                </div>

                {activeOrder && (
                  <>
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex items-center text-gray-300 mb-2">
                        <Clock size={16} className="mr-2" />
                        <span className="text-sm">{t('tablesPage.orderPlaced')} {activeOrder.timestamp}</span>
                      </div>
                      <div className="flex items-center text-gray-300 mb-2">
                        <span className="text-sm">{activeOrder.items.length} {t('tablesPage.itemsOrdered')}</span>
                      </div>
                      <div className="flex items-center text-green-400 mb-2">
                        <DollarSign size={16} className="mr-1" />
                        <span className="font-semibold">{formatCurrency(activeOrder.total)}</span>
                      </div>
                      <Badge className={`text-xs ${
                        activeOrder.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        activeOrder.status === 'preparing' ? 'bg-blue-500/20 text-blue-400' :
                        activeOrder.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {activeOrder.status.charAt(0).toUpperCase() + activeOrder.status.slice(1)}
                      </Badge>
                    </div>
                  </>
                )}

                <div className="pt-4 space-y-2">
                  {table.status === "Available" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(table.id, "Occupied")}
                        className="bg-red-600 hover:bg-red-700 text-xs"
                      >
                        {t('tablesPage.seatGuests')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(table.id, "Reserved")}
                        className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-xs"
                      >
                        {t('tablesPage.reserve')}
                      </Button>
                    </div>
                  )}

                  {table.status === "Occupied" && (
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleTakeOrder(table.number)}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        {t('tablesPage.takeOrder')}
                      </Button>
                      {activeOrder && (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(activeOrder.id, 'preparing')}
                            className="bg-blue-600 hover:bg-blue-700 text-xs"
                            disabled={activeOrder.status !== 'pending'}
                          >
                            {t('tablesPage.startPreparing')}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(activeOrder.id, 'ready')}
                            className="bg-orange-600 hover:bg-orange-700 text-xs"
                            disabled={activeOrder.status !== 'preparing'}
                          >
                            {t('tablesPage.markReady')}
                          </Button>
                        </div>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(table.id, "Available")}
                        className="bg-gray-600 hover:bg-gray-700 text-xs"
                      >
                        {t('tablesPage.clearTable')}
                      </Button>
                    </div>
                  )}

                  {table.status === "Reserved" && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(table.id, "Occupied")}
                        className="bg-red-600 hover:bg-red-700 text-xs"
                      >
                        {t('tablesPage.seatGuests')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(table.id, "Available")}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
