import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, ShoppingCart, Clock, TrendingUp } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useBranch } from "@/contexts/BranchContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, setHours, setMinutes } from "date-fns";

type CalculationType = 'all-today' | 'item-today' | 'items-timerange';

interface SalesResult {
  totalSales: number;
  totalOrders: number;
  itemBreakdown: { name: string; quantity: number; total: number }[];
}

export const SalesCalculator = () => {
  const { t } = useTranslation();
  const { selectedBranch } = useBranch();
  
  const [calculationType, setCalculationType] = useState<CalculationType>('all-today');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [result, setResult] = useState<SalesResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch menu items for item selection
  const { data: menuItems = [] } = useQuery({
    queryKey: ['menu-items-calculator', selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, price')
        .eq('branch_id', selectedBranch.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedBranch?.id,
  });

  // Fetch orders with items
  const { data: ordersData = [] } = useQuery({
    queryKey: ['orders-calculator', selectedBranch?.id, selectedDate],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      
      const startOfSelectedDay = `${selectedDate}T00:00:00`;
      const endOfSelectedDay = `${selectedDate}T23:59:59`;
      
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          status,
          order_items (
            id,
            product_name,
            quantity,
            total_price
          )
        `)
        .eq('branch_id', selectedBranch.id)
        .gte('created_at', startOfSelectedDay)
        .lte('created_at', endOfSelectedDay)
        .neq('status', 'cancelled');
      
      if (ordersError) throw ordersError;
      return orders || [];
    },
    enabled: !!selectedBranch?.id,
  });

  const handleCalculate = () => {
    setIsCalculating(true);
    
    let filteredOrders = [...ordersData];
    
    // Filter by time range if needed
    if (calculationType === 'items-timerange') {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);
      
      filteredOrders = ordersData.filter(order => {
        const orderDate = parseISO(order.created_at);
        const orderHour = orderDate.getHours();
        const orderMin = orderDate.getMinutes();
        const orderTimeInMinutes = orderHour * 60 + orderMin;
        const startTimeInMinutes = startHour * 60 + startMin;
        const endTimeInMinutes = endHour * 60 + endMin;
        
        return orderTimeInMinutes >= startTimeInMinutes && orderTimeInMinutes <= endTimeInMinutes;
      });
    }
    
    // Calculate totals
    let totalSales = 0;
    let totalOrders = filteredOrders.length;
    const itemMap = new Map<string, { quantity: number; total: number }>();
    
    filteredOrders.forEach(order => {
      const orderItems = order.order_items || [];
      
      orderItems.forEach((item: any) => {
        const shouldInclude = 
          calculationType === 'all-today' ||
          (calculationType === 'item-today' && selectedItems.includes(item.product_name)) ||
          (calculationType === 'items-timerange' && (selectedItems.length === 0 || selectedItems.includes(item.product_name)));
        
        if (shouldInclude) {
          totalSales += item.total_price;
          
          const existing = itemMap.get(item.product_name) || { quantity: 0, total: 0 };
          itemMap.set(item.product_name, {
            quantity: existing.quantity + item.quantity,
            total: existing.total + item.total_price
          });
        }
      });
    });
    
    const itemBreakdown = Array.from(itemMap.entries()).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      total: data.total
    })).sort((a, b) => b.total - a.total);
    
    setResult({
      totalSales,
      totalOrders,
      itemBreakdown
    });
    
    setIsCalculating(false);
  };

  const handleItemToggle = (itemName: string) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(i => i !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calculator className="h-5 w-5" />
            {t('calculator.title') || 'Sales Calculator'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calculation Type */}
          <div className="space-y-2">
            <Label className="text-foreground">{t('calculator.calculationType') || 'Calculation Type'}</Label>
            <Select value={calculationType} onValueChange={(v) => setCalculationType(v as CalculationType)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-today">{t('calculator.allSalesToday') || 'All Sales for Today'}</SelectItem>
                <SelectItem value="item-today">{t('calculator.itemSalesToday') || 'Specific Item(s) Sales Today'}</SelectItem>
                <SelectItem value="items-timerange">{t('calculator.itemsTimeRange') || 'Item(s) Sales by Time Range'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">{t('calculator.date') || 'Date'}</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          {/* Item Selection - shown for item-based calculations */}
          {(calculationType === 'item-today' || calculationType === 'items-timerange') && (
            <div className="space-y-2">
              <Label className="text-foreground">{t('calculator.selectItems') || 'Select Items'}</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg max-h-40 overflow-y-auto">
                {menuItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant={selectedItems.includes(item.name) ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleItemToggle(item.name)}
                  >
                    {item.name}
                  </Badge>
                ))}
                {menuItems.length === 0 && (
                  <span className="text-muted-foreground text-sm">
                    {t('calculator.noItems') || 'No menu items found'}
                  </span>
                )}
              </div>
              {selectedItems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('calculator.selectedCount') || 'Selected'}: {selectedItems.length} {t('calculator.items') || 'items'}
                </p>
              )}
            </div>
          )}

          {/* Time Range - shown for time-based calculations */}
          {calculationType === 'items-timerange' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">{t('calculator.startTime') || 'Start Time'}</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{t('calculator.endTime') || 'End Time'}</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleCalculate} 
            className="w-full"
            disabled={isCalculating || (calculationType !== 'all-today' && selectedItems.length === 0 && calculationType === 'item-today')}
          >
            <Calculator className="h-4 w-4 mr-2" />
            {isCalculating ? (t('calculator.calculating') || 'Calculating...') : (t('calculator.calculate') || 'Calculate')}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">{t('calculator.results') || 'Results'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">{t('calculator.totalSales') || 'Total Sales'}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">${result.totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-secondary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-5 w-5 text-secondary-foreground" />
                  <span className="text-sm text-muted-foreground">{t('calculator.totalOrders') || 'Orders'}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{result.totalOrders}</p>
              </div>
            </div>

            {/* Item Breakdown */}
            {result.itemBreakdown.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('calculator.itemBreakdown') || 'Item Breakdown'}
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.itemBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('calculator.quantity') || 'Qty'}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-primary">${item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.itemBreakdown.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {t('calculator.noSalesFound') || 'No sales found for the selected criteria'}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
