import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";

export interface RetailOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

export interface RetailOrder {
  id: string;
  business_id: string;
  branch_id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  order_type: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  discount_type: string | null;
  tax_amount: number;
  total_amount: number;
  payment_method: string | null;
  payment_status: string;
  notes: string | null;
  cashier_id: string | null;
  created_at: string;
  updated_at: string;
  retail_order_items?: RetailOrderItem[];
}

export const useRetailOrders = () => {
  const { userProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const businessId = userProfile?.business_id;
  const branchId = selectedBranch?.id;

  const query = useQuery({
    queryKey: ['retail-orders', businessId, branchId],
    queryFn: async () => {
      let q = supabase
        .from('retail_orders')
        .select('*, retail_order_items(*)')
        .order('created_at', { ascending: false });

      if (businessId) q = q.eq('business_id', businessId);
      if (branchId) q = q.eq('branch_id', branchId);

      const { data, error } = await q;
      if (error) throw error;
      return data as RetailOrder[];
    },
    enabled: !!businessId,
  });

  const createOrder = useMutation({
    mutationFn: async (payload: {
      order: Omit<RetailOrder, 'id' | 'created_at' | 'updated_at' | 'retail_order_items'>;
      items: Omit<RetailOrderItem, 'id' | 'order_id'>[];
    }) => {
      const { data: order, error: orderError } = await supabase
        .from('retail_orders')
        .insert(payload.order)
        .select()
        .single();
      if (orderError) throw orderError;

      if (payload.items.length > 0) {
        const itemsWithOrder = payload.items.map(item => ({
          ...item,
          order_id: order.id,
        }));
        const { error: itemsError } = await supabase
          .from('retail_order_items')
          .insert(itemsWithOrder);
        if (itemsError) throw itemsError;
      }

      // Update stock quantities
      for (const item of payload.items) {
        if (item.product_id) {
          const { data: product } = await supabase
            .from('retail_products')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();
          if (product) {
            await supabase
              .from('retail_products')
              .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
              .eq('id', item.product_id);
          }
        }
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-orders'] });
      queryClient.invalidateQueries({ queryKey: ['retail-products'] });
      toast.success('Order created successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status, payment_status }: { id: string; status?: string; payment_status?: string }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (payment_status) updates.payment_status = payment_status;

      const { error } = await supabase
        .from('retail_orders')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-orders'] });
      toast.success('Order updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  return {
    orders: query.data || [],
    isLoading: query.isLoading,
    createOrder,
    updateOrderStatus,
  };
};
