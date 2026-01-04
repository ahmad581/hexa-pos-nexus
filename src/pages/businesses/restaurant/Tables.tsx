import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, UtensilsCrossed } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useOrder } from "@/contexts/OrderContext";

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: "Available" | "Occupied" | "Reserved" | "Cleaning";
  currentOrder?: {
    customerName: string;
    orderTime: string;
    items: number;
    total: number;
  };
}

const initialTables: Table[] = [
  { id: "1", number: 1, capacity: 2, status: "Available" },
  { id: "2", number: 2, capacity: 4, status: "Occupied", currentOrder: { customerName: "John Doe", orderTime: "12:30 PM", items: 3, total: 45.50 } },
  { id: "3", number: 3, capacity: 6, status: "Reserved" },
  { id: "4", number: 4, capacity: 2, status: "Cleaning" },
  { id: "5", number: 5, capacity: 4, status: "Available" },
  { id: "6", number: 6, capacity: 8, status: "Occupied", currentOrder: { customerName: "Jane Smith", orderTime: "1:15 PM", items: 5, total: 78.25 } },
];

export const Tables = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSelectedTable, setOrderType } = useOrder();

  const handleTakeOrder = (table: Table) => {
    setOrderType('dine-in');
    setSelectedTable(table.number);
    navigate('/menu');
  };

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "Available": return "bg-green-500/20 text-green-400";
      case "Occupied": return "bg-red-500/20 text-red-400";
      case "Reserved": return "bg-yellow-500/20 text-yellow-400";
      case "Cleaning": return "bg-blue-500/20 text-blue-400";
    }
  };

  const getStatusLabel = (status: Table["status"]) => {
    switch (status) {
      case "Available": return t('tables.available');
      case "Occupied": return t('tables.occupied');
      case "Reserved": return t('tables.reserved');
      case "Cleaning": return t('tables.cleaning');
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{t('tables.tableNumber')} {table.number}</h3>
              <Badge className={getStatusColor(table.status)}>
                {getStatusLabel(table.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Users size={16} className="mr-2" />
                <span className="text-sm">{t('tables.seats')} {table.capacity}</span>
              </div>

              {table.currentOrder && (
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-gray-300 mb-2">
                    <span className="text-sm font-medium">{table.currentOrder.customerName}</span>
                  </div>
                  <div className="flex items-center text-gray-300 mb-2">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">{t('tables.since')} {table.currentOrder.orderTime}</span>
                  </div>
                  <div className="text-green-400">
                    <span className="text-sm">{table.currentOrder.items} {t('ordersPage.itemsCount')} • ${table.currentOrder.total}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleTakeOrder(table)}
                className="w-full mt-4"
                variant="default"
              >
                <UtensilsCrossed size={16} className="mr-2" />
                {t('tables.takeOrder') || 'Take Order'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
