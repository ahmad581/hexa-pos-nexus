import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/hooks/use-toast";

export interface SalonTransaction {
  id: string;
  branch_id: string;
  business_id?: string;
  appointment_id?: string;
  client_name: string;
  services: any[];
  subtotal: number;
  tax_amount: number;
  tip_amount: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  stylist_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useSalonTransactions = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['salon-transactions', selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data, error } = await supabase
        .from('salon_transactions')
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as SalonTransaction[];
    },
    enabled: !!selectedBranch?.id,
  });

  const createTransaction = useMutation({
    mutationFn: async (payload: Partial<SalonTransaction> & { client_name: string }) => {
      const { data, error } = await supabase.from('salon_transactions').insert([{
        ...payload,
        branch_id: selectedBranch?.id || '',
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-transactions'] });
      toast({ title: "Transaction completed successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return {
    transactions,
    isLoading,
    createTransaction: createTransaction.mutate,
    isCreating: createTransaction.isPending,
  };
};
