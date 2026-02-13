import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";

export interface RetailCustomer {
  id: string;
  business_id: string;
  branch_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  loyalty_points: number;
  loyalty_tier: string;
  total_purchases: number;
  total_orders: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RetailCustomerInsert = Omit<RetailCustomer, 'id' | 'created_at' | 'updated_at'>;

export const useRetailCustomers = () => {
  const { userProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const businessId = userProfile?.business_id;
  const branchId = selectedBranch?.id;

  const query = useQuery({
    queryKey: ['retail-customers', businessId, branchId],
    queryFn: async () => {
      let q = supabase
        .from('retail_customers')
        .select('*')
        .eq('is_active', true)
        .order('first_name');

      if (businessId) q = q.eq('business_id', businessId);
      if (branchId) q = q.eq('branch_id', branchId);

      const { data, error } = await q;
      if (error) throw error;
      return data as RetailCustomer[];
    },
    enabled: !!businessId,
  });

  const createCustomer = useMutation({
    mutationFn: async (customer: RetailCustomerInsert) => {
      const { data, error } = await supabase
        .from('retail_customers')
        .insert(customer)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-customers'] });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateCustomer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RetailCustomer> & { id: string }) => {
      const { data, error } = await supabase
        .from('retail_customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-customers'] });
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('retail_customers')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-customers'] });
      toast.success('Customer removed successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  return {
    customers: query.data || [],
    isLoading: query.isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};
