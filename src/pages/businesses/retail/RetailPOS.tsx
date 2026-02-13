import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Minus, ShoppingCart, CreditCard, Banknote, Trash2 } from "lucide-react";
import { useRetailProducts } from "@/hooks/useRetailProducts";
import { useRetailOrders } from "@/hooks/useRetailOrders";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useCurrency } from "@/hooks/useCurrency";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CartItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

export const RetailPOS = () => {
  const { products } = useRetailProducts();
  const { createOrder } = useRetailOrders();
  const { userProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const { formatCurrency: formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");

  const filteredProducts = products.filter(p =>
    p.stock_quantity > 0 && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.includes(searchTerm)
    )
  );

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find(i => i.product_id === product.id);
    const price = product.is_on_sale && product.sale_price ? product.sale_price : product.selling_price;

    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        toast.error('Not enough stock');
        return;
      }
      setCart(cart.map(i =>
        i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price }
          : i
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        quantity: 1,
        unit_price: price,
        discount_amount: 0,
        total_price: price,
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product_id !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return item;
      return { ...item, quantity: newQty, total_price: newQty * item.unit_price };
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.total_price, 0);
  const taxRate = 0.0825;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!userProfile?.business_id || !selectedBranch) {
      toast.error('No business or branch selected');
      return;
    }

    await createOrder.mutateAsync({
      order: {
        business_id: userProfile.business_id,
        branch_id: selectedBranch.id,
        order_number: `RET-${Date.now().toString(36).toUpperCase()}`,
        customer_id: null,
        customer_name: customerName || null,
        customer_phone: null,
        order_type: 'in-store',
        status: 'completed',
        subtotal,
        discount_amount: 0,
        discount_type: null,
        tax_amount: taxAmount,
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: 'paid',
        notes: null,
        cashier_id: userProfile.email,
      },
      items: cart,
    });

    setCart([]);
    setCustomerName('');
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Products grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto flex-1">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="p-3 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => addToCart(product)}
            >
              <h4 className="font-medium text-sm text-foreground truncate">{product.name}</h4>
              <p className="text-xs text-muted-foreground">{product.sku}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-primary">
                  {formatPrice(product.is_on_sale && product.sale_price ? product.sale_price : product.selling_price)}
                </span>
                <span className="text-xs text-muted-foreground">{product.stock_quantity} left</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart */}
      <Card className="w-80 lg:w-96 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-foreground">Cart ({cart.length})</h2>
        </div>

        <Input
          placeholder="Customer name (optional)"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          className="mb-3"
        />

        <div className="flex-1 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">Add items to cart</p>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(item.unit_price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product_id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.product_id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <span className="ml-2 text-sm font-medium w-16 text-right">{formatPrice(item.total_price)}</span>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border pt-3 mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (8.25%)</span>
            <span className="text-foreground">{formatPrice(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">{formatPrice(total)}</span>
          </div>

          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash"><div className="flex items-center gap-2"><Banknote className="h-4 w-4" />Cash</div></SelectItem>
              <SelectItem value="card"><div className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Card</div></SelectItem>
              <SelectItem value="store_credit">Store Credit</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={cart.length === 0 || createOrder.isPending}
          >
            {createOrder.isPending ? 'Processing...' : `Checkout ${formatPrice(total)}`}
          </Button>
        </div>
      </Card>
    </div>
  );
};
