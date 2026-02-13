import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";

export interface RetailReturnItem {
  id: string;
  return_id: string;
  product_id: string | null;
  order_item_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  refund_amount: number;
  condition: string;
  return_to_stock: boolean;
}

export interface RetailReturn {
  id: string;
  business_id: string;
  branch_id: string;
  order_id: string | null;
  customer_id: string | null;
  return_number: string;
  reason: string;
  status: string;
  refund_type: string;
  refund_amount: number;
  store_credit_amount: number;
  notes: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
  retail_return_items?: RetailReturnItem[];
}

export const useRetailReturns = () => {
  const { userProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const businessId = userProfile?.business_id;
  const branchId = selectedBranch?.id;

  const query = useQuery({
    queryKey: ['retail-returns', businessId, branchId],
    queryFn: async () => {
      let q = supabase
        .from('retail_returns')
        .select('*, retail_return_items(*)')
        .order('created_at', { ascending: false });

      if (businessId) q = q.eq('business_id', businessId);
      if (branchId) q = q.eq('branch_id', branchId);

      const { data, error } = await q;
      if (error) throw error;
      return data as RetailReturn[];
    },
    enabled: !!businessId,
  });

  const createReturn = useMutation({
    mutationFn: async (payload: {
      returnData: Omit<RetailReturn, 'id' | 'created_at' | 'updated_at' | 'retail_return_items'>;
      items: Omit<RetailReturnItem, 'id' | 'return_id'>[];
    }) => {
      const { data: returnRecord, error: returnError } = await supabase
        .from('retail_returns')
        .insert(payload.returnData)
        .select()
        .single();
      if (returnError) throw returnError;

      if (payload.items.length > 0) {
        const itemsWithReturn = payload.items.map(item => ({
          ...item,
          return_id: returnRecord.id,
        }));
        const { error: itemsError } = await supabase
          .from('retail_return_items')
          .insert(itemsWithReturn);
        if (itemsError) throw itemsError;

        // Return items to stock if flagged
        for (const item of payload.items) {
          if (item.return_to_stock && item.product_id) {
            const { data: product } = await supabase
              .from('retail_products')
              .select('stock_quantity')
              .eq('id', item.product_id)
              .single();
            if (product) {
              await supabase
                .from('retail_products')
                .update({ stock_quantity: product.stock_quantity + item.quantity })
                .eq('id', item.product_id);
            }
          }
        }
      }

      return returnRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-returns'] });
      queryClient.invalidateQueries({ queryKey: ['retail-products'] });
      toast.success('Return processed successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateReturnStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('retail_returns')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-returns'] });
      toast.success('Return status updated');
    },
    onError: (error: any) => toast.error(error.message),
  });

  return {
    returns: query.data || [],
    isLoading: query.isLoading,
    createReturn,
    updateReturnStatus,
  };
};
