import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Download,
  Calendar,
  DollarSign
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";

interface MonthlyReport {
  month: string;
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  transactions: number;
}

interface TransactionSummary {
  type: string;
  count: number;
  totalQuantity: number;
}

export const InventoryReports = () => {
  const { t } = useTranslation();
  const { items, warehouses } = useInventory();
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateReport();
  }, [selectedWarehouse, selectedMonth]);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Get current inventory summary
      const filteredItems = selectedWarehouse === "all" 
        ? items 
        : items.filter(item => item.warehouse_id === selectedWarehouse);

      const totalItems = filteredItems.length;
      const totalValue = filteredItems.reduce((sum, item) => {
        return sum + (item.current_stock * (item.unit_price || 0));
      }, 0);
      const lowStockItems = filteredItems.filter(item => item.status === 'Low Stock').length;
      const outOfStockItems = filteredItems.filter(item => item.status === 'Out of Stock').length;

      // Get transaction data for the selected month
      const startDate = new Date(selectedMonth + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      let query = supabase
        .from('inventory_transactions')
        .select('*')
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString());

      if (selectedWarehouse !== "all") {
        // We need to join with inventory_items to filter by warehouse
        query = supabase
          .from('inventory_transactions')
          .select(`
            *,
            inventory_item:inventory_items!inner(warehouse_id)
          `)
          .eq('inventory_item.warehouse_id', selectedWarehouse)
          .gte('transaction_date', startDate.toISOString())
          .lte('transaction_date', endDate.toISOString());
      }

      const { data: transactionData, error } = await query;
      
      if (error) throw error;

      // Summarize transactions by type
      const transactionSummary = transactionData?.reduce((acc, transaction) => {
        const existing = acc.find(t => t.type === transaction.transaction_type);
        if (existing) {
          existing.count++;
          existing.totalQuantity += Math.abs(transaction.quantity);
        } else {
          acc.push({
            type: transaction.transaction_type,
            count: 1,
            totalQuantity: Math.abs(transaction.quantity)
          });
        }
        return acc;
      }, [] as TransactionSummary[]) || [];

      setMonthlyReport({
        month: startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        transactions: transactionData?.length || 0
      });

      setTransactions(transactionSummary);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!monthlyReport) return;

    const csvContent = [
      ['Inventory Report', monthlyReport.month],
      ['Warehouse', selectedWarehouse === 'all' ? 'All Warehouses' : warehouses.find(w => w.id === selectedWarehouse)?.name || 'Unknown'],
      [''],
      ['Summary'],
      ['Total Items', monthlyReport.totalItems.toString()],
      ['Total Value', `$${monthlyReport.totalValue.toFixed(2)}`],
      ['Low Stock Items', monthlyReport.lowStockItems.toString()],
      ['Out of Stock Items', monthlyReport.outOfStockItems.toString()],
      ['Total Transactions', monthlyReport.transactions.toString()],
      [''],
      ['Transaction Summary'],
      ['Type', 'Count', 'Total Quantity'],
      ...transactions.map(t => [t.type, t.count.toString(), t.totalQuantity.toString()])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Add': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'Remove': return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'Transfer': return <Package className="h-4 w-4 text-blue-400" />;
      case 'Adjustment': return <BarChart3 className="h-4 w-4 text-yellow-400" />;
      default: return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryBreakdown = () => {
    const filteredItems = selectedWarehouse === "all" 
      ? items 
      : items.filter(item => item.warehouse_id === selectedWarehouse);

    const categories = filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, value: 0, stock: 0 };
      }
      acc[item.category].count++;
      acc[item.category].value += item.current_stock * (item.unit_price || 0);
      acc[item.category].stock += item.current_stock;
      return acc;
    }, {} as Record<string, { count: number; value: number; stock: number }>);

    return Object.entries(categories).map(([category, data]) => ({
      category,
      ...data
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Generating report...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('inventoryReports.title')}</h2>
          <p className="text-gray-400">{t('inventoryReports.subtitle')}</p>
        </div>
        <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          {t('inventoryReports.exportCsv')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
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

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px] bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder={t('inventoryReports.selectMonth')} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date();
              date.setMonth(date.getMonth() - i);
              const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              return (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {monthlyReport && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{t('inventoryReports.totalItems')}</p>
                  <p className="text-2xl font-bold text-white">{monthlyReport.totalItems}</p>
                </div>
                <Package className="h-8 w-8 text-blue-400" />
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{t('inventoryReports.totalValue')}</p>
                  <p className="text-2xl font-bold text-white">${monthlyReport.totalValue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{t('inventoryReports.lowStockAlert')}</p>
                  <p className="text-2xl font-bold text-yellow-400">{monthlyReport.lowStockItems}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </Card>

            <Card className="bg-gray-800 border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{t('inventoryReports.transactions')}</p>
                  <p className="text-2xl font-bold text-white">{monthlyReport.transactions}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </Card>
          </div>

          {/* Transaction Summary */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">{t('inventoryReports.transactionSummary')}</h3>
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction.type} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <span className="text-white font-medium">{transaction.type}</span>
                    </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{transaction.count} {t('inventoryReports.transactions').toLowerCase()}</div>
                    <div className="text-sm text-gray-400">{transaction.totalQuantity} {t('inventoryReports.units')}</div>
                  </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No transactions found for this period.</p>
              )}
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-4">{t('inventoryReports.categoryBreakdown')}</h3>
            <div className="space-y-3">
              {getCategoryBreakdown().map((category) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div>
                    <span className="text-white font-medium">{category.category}</span>
                    <p className="text-sm text-gray-400">{category.count} {t('inventoryReports.items')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">${category.value.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">{category.stock} {t('inventoryReports.units')}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};