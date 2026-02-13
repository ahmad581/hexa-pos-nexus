import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, Plus, Pencil, Trash2, Star } from "lucide-react";
import { useRetailCustomers } from "@/hooks/useRetailCustomers";
import { CustomerDialog } from "@/components/retail/CustomerDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { useCurrency } from "@/hooks/useCurrency";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const RetailCustomers = () => {
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useRetailCustomers();
  const { userProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const { formatCurrency: formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const handleSave = (data: any) => {
    if (data.id) {
      updateCustomer.mutate(data);
    } else {
      createCustomer.mutate(data);
    }
  };

  const tierColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return 'bg-yellow-500/20 text-yellow-400';
      case 'Silver': return 'bg-gray-400/20 text-gray-300';
      case 'Platinum': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-orange-500/20 text-orange-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage customer profiles & loyalty ({customers.length} customers)</p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Add Customer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No customers found</h3>
          <p className="text-muted-foreground mt-1">Add your first customer to start tracking loyalty.</p>
          <Button className="mt-4" onClick={() => { setEditingCustomer(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Add Customer
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <Card key={customer.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{customer.first_name} {customer.last_name}</h3>
                  {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingCustomer(customer); setDialogOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(customer.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {customer.phone && <p className="text-sm text-muted-foreground">📞 {customer.phone}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-sm font-medium text-foreground">{customer.loyalty_points} pts</span>
                  </div>
                  <Badge className={tierColor(customer.loyalty_tier)}>{customer.loyalty_tier}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{customer.total_orders} orders</span>
                  <span>Total: {formatPrice(customer.total_purchases)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSave={handleSave}
        businessId={userProfile?.business_id || ''}
        branchId={selectedBranch?.id || ''}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Customer</AlertDialogTitle>
            <AlertDialogDescription>This will deactivate the customer record.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteCustomer.mutate(deleteId); setDeleteId(null); }}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
