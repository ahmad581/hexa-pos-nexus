import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRetailOrders } from "@/hooks/useRetailOrders";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const RetailOrders = () => {
  const { orders, isLoading, updateOrderStatus } = useRetailOrders();
  const { formatCurrency: formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'draft': return 'outline';
      case 'returned': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Retail Orders</h1>
        <p className="text-muted-foreground">View order history ({orders.length} orders)</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search by order number, customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-lg font-medium text-foreground">No orders found</h3>
          <p className="text-muted-foreground mt-1">Orders will appear here after checkout.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <Card key={order.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{order.order_number}</h3>
                    <Badge variant={statusColor(order.status)}>{order.status}</Badge>
                    <Badge variant="outline">{order.payment_status}</Badge>
                  </div>
                  {order.customer_name && (
                    <p className="text-sm text-muted-foreground mt-1">{order.customer_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'PPp')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{formatPrice(order.total_amount)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{order.payment_method || 'N/A'}</p>
                  {order.status === 'pending' && (
                    <Button size="sm" className="mt-2" onClick={() => updateOrderStatus.mutate({ id: order.id, status: 'completed', payment_status: 'paid' })}>
                      Complete
                    </Button>
                  )}
                </div>
              </div>
              {order.retail_order_items && order.retail_order_items.length > 0 && (
                <div className="mt-3 border-t border-border pt-2">
                  {order.retail_order_items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-foreground">{item.product_name} × {item.quantity}</span>
                      <span className="text-muted-foreground">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
