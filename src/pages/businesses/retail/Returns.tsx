import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Package } from "lucide-react";
import { useRetailReturns } from "@/hooks/useRetailReturns";
import { useRetailOrders } from "@/hooks/useRetailOrders";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export const RetailReturns = () => {
  const { returns, isLoading, createReturn, updateReturnStatus } = useRetailReturns();
  const { orders } = useRetailOrders();
  const { userProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const { formatCurrency: formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [reason, setReason] = useState("");
  const [refundType, setRefundType] = useState("original_payment");
  const [notes, setNotes] = useState("");

  const filtered = returns.filter(r =>
    r.return_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedOrders = orders.filter(o => o.status === 'completed');

  const handleCreateReturn = () => {
    const order = orders.find(o => o.id === selectedOrder);
    if (!order || !userProfile?.business_id || !selectedBranch) return;

    const items = (order.retail_order_items || []).map(item => ({
      product_id: item.product_id,
      order_item_id: item.id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      refund_amount: item.total_price,
      condition: 'good' as const,
      return_to_stock: true,
    }));

    createReturn.mutate({
      returnData: {
        business_id: userProfile.business_id,
        branch_id: selectedBranch.id,
        order_id: selectedOrder,
        customer_id: order.customer_id,
        return_number: `RET-${Date.now().toString(36).toUpperCase()}`,
        reason,
        status: 'pending',
        refund_type: refundType,
        refund_amount: order.total_amount,
        store_credit_amount: refundType === 'store_credit' ? order.total_amount : 0,
        notes: notes || null,
        processed_by: userProfile.email,
      },
      items,
    });

    setDialogOpen(false);
    setSelectedOrder('');
    setReason('');
    setNotes('');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Returns & Exchanges</h1>
          <p className="text-muted-foreground">Process returns and issue refunds ({returns.length} returns)</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <RotateCcw className="h-4 w-4 mr-2" />Process Return
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search returns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading returns...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No returns yet</h3>
          <p className="text-muted-foreground mt-1">Process your first return when needed.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((ret) => (
            <Card key={ret.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{ret.return_number}</h3>
                    <Badge variant={statusColor(ret.status)}>{ret.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Reason: {ret.reason}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(ret.created_at), 'PPp')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{formatPrice(ret.refund_amount)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{ret.refund_type.replace('_', ' ')}</p>
                  {ret.status === 'pending' && (
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline" onClick={() => updateReturnStatus.mutate({ id: ret.id, status: 'completed' })}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => updateReturnStatus.mutate({ id: ret.id, status: 'rejected' })}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {ret.retail_return_items && ret.retail_return_items.length > 0 && (
                <div className="mt-3 border-t border-border pt-2">
                  {ret.retail_return_items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-foreground">{item.product_name} × {item.quantity}</span>
                      <span className="text-muted-foreground">{formatPrice(item.refund_amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Order *</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an order..." />
                </SelectTrigger>
                <SelectContent>
                  {completedOrders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {formatPrice(order.total_amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Defective Product</SelectItem>
                  <SelectItem value="wrong_item">Wrong Item</SelectItem>
                  <SelectItem value="not_as_described">Not as Described</SelectItem>
                  <SelectItem value="changed_mind">Changed Mind</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Refund Type</Label>
              <Select value={refundType} onValueChange={setRefundType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original_payment">Original Payment</SelectItem>
                  <SelectItem value="store_credit">Store Credit</SelectItem>
                  <SelectItem value="exchange">Exchange</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateReturn} disabled={!selectedOrder || !reason || createReturn.isPending}>
                {createReturn.isPending ? 'Processing...' : 'Process Return'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
