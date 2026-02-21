import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, DollarSign, CreditCard, Banknote, Loader2, CheckCircle, Plus, Minus, Trash2 } from "lucide-react";
import { useSalonAppointments } from "@/hooks/useSalonAppointments";
import { useSalonServices } from "@/hooks/useSalonServices";
import { useStylists } from "@/hooks/useStylists";
import { useSalonTransactions } from "@/hooks/useSalonTransactions";
import { useCurrency } from "@/hooks/useCurrency";
import { format, parseISO, isToday } from "date-fns";

const PAYMENT_METHODS = ["cash", "card", "split"];

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

export const SalonPOS = () => {
  const { appointments, updateAppointment } = useSalonAppointments();
  const { services } = useSalonServices();
  const { stylists } = useStylists();
  const { createTransaction, isCreating } = useSalonTransactions();
  const { formatCurrency } = useCurrency();

  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tipAmount, setTipAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showSuccess, setShowSuccess] = useState(false);

  const taxRate = 0.0825;

  // Show today's completed/in-progress appointments
  const checkoutReady = useMemo(() => {
    return appointments.filter(a => {
      const dt = a.appointment_date ? parseISO(a.appointment_date) : null;
      return dt && isToday(dt) && (a.status === "in-progress" || a.status === "completed");
    });
  }, [appointments]);

  const selectAppointment = (id: string) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;
    setSelectedAppointment(id);
    const svc = services.find(s => s.name === appt.service_type);
    setCart([{
      name: appt.service_type,
      price: appt.price || svc?.price || 0,
      quantity: 1,
    }]);
    setTipAmount(0);
    setDiscountAmount(0);
  };

  const addService = (svc: { name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === svc.name);
      if (existing) {
        return prev.map(i => i.name === svc.name ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...svc, quantity: 1 }];
    });
  };

  const removeItem = (name: string) => setCart(prev => prev.filter(i => i.name !== name));
  const updateQty = (name: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.name !== name) return i;
      const q = Math.max(1, i.quantity + delta);
      return { ...i, quantity: q };
    }));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount + tipAmount - discountAmount;

  const handleCheckout = () => {
    const appt = appointments.find(a => a.id === selectedAppointment);
    createTransaction({
      client_name: appt?.customer_name || "Walk-in",
      appointment_id: selectedAppointment || undefined,
      services: cart,
      subtotal,
      tax_amount: taxAmount,
      tip_amount: tipAmount,
      discount_amount: discountAmount,
      total,
      payment_method: paymentMethod,
      stylist_id: appt?.stylist_id || undefined,
    });
    if (selectedAppointment) {
      updateAppointment({ id: selectedAppointment, status: "completed" });
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedAppointment(null);
      setCart([]);
      setTipAmount(0);
      setDiscountAmount(0);
    }, 2000);
  };

  const getStylistName = (id?: string) => {
    if (!id) return null;
    const s = stylists.find(st => st.id === id);
    return s ? `${s.first_name} ${s.last_name}` : null;
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <CheckCircle size={64} className="text-primary animate-pulse" />
        <h2 className="text-2xl font-bold text-foreground">Payment Complete!</h2>
        <p className="text-muted-foreground">{formatCurrency(total)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Salon Checkout</h1>
        <p className="text-muted-foreground">Process payments for services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Appointment selection + add services */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today's appointments */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Today's Appointments</h3>
            {checkoutReady.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments ready for checkout today.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {checkoutReady.map(a => (
                  <button
                    key={a.id}
                    onClick={() => selectAppointment(a.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedAppointment === a.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm">{a.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{a.service_type}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {a.appointment_date && format(parseISO(a.appointment_date), "h:mm a")}
                      </span>
                      {getStylistName(a.stylist_id) && (
                        <span className="text-xs text-muted-foreground">{getStylistName(a.stylist_id)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Add additional services */}
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-3">Add Services / Products</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => addService({ name: s.name, price: s.price })}
                  className="p-2 rounded-lg border border-border hover:border-primary/50 text-left transition-colors"
                >
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-primary font-semibold">{formatCurrency(s.price)}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Cart & payment */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart size={18} className="text-foreground" />
              <h3 className="font-semibold text-foreground">Order Summary</h3>
            </div>

            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Select an appointment or add services</p>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <p className="text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQty(item.name, -1)}>
                        <Minus size={12} />
                      </Button>
                      <span className="w-6 text-center text-foreground">{item.quantity}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateQty(item.name, 1)}>
                        <Plus size={12} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeItem(item.name)}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                    <span className="ml-2 font-medium text-foreground w-16 text-right">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (8.25%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground text-sm">Tip</Label>
                <Input type="number" min={0} step={0.5} value={tipAmount} onChange={e => setTipAmount(+e.target.value)} className="w-24 h-8 text-right text-sm" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground text-sm">Discount</Label>
                <Input type="number" min={0} step={0.5} value={discountAmount} onChange={e => setDiscountAmount(+e.target.value)} className="w-24 h-8 text-right text-sm" />
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg text-foreground">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <Label className="text-sm">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => (
                      <SelectItem key={m} value={m}>
                        <span className="flex items-center gap-2">
                          {m === "cash" ? <Banknote size={14} /> : <CreditCard size={14} />}
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={cart.length === 0 || isCreating}
                onClick={handleCheckout}
              >
                {isCreating ? <Loader2 className="animate-spin mr-2" size={16} /> : <DollarSign size={16} className="mr-2" />}
                Charge {formatCurrency(total)}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
