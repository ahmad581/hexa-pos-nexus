import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GymPayment {
  id: string;
  branch_id: string;
  business_id: string | null;
  member_id: string;
  plan_id: string | null;
  payment_type: string;
  amount: number;
  payment_method: string;
  status: string;
  notes: string | null;
  payment_date: string;
  created_at: string;
  member?: { first_name: string; last_name: string; member_number: string };
  plan?: { name: string } | null;
}

export const useGymBilling = () => {
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const branchId = selectedBranch?.id;

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['gym-payments', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('gym_membership_payments')
        .select('*, member:members(first_name, last_name, member_number), plan:gym_membership_plans(name)')
        .eq('branch_id', branchId)
        .order('payment_date', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as GymPayment[];
    },
    enabled: !!branchId,
  });

  const createPayment = useMutation({
    mutationFn: async (payment: Omit<GymPayment, 'id' | 'created_at' | 'member' | 'plan'>) => {
      const { data, error } = await supabase.from('gym_membership_payments').insert({
        ...payment,
        business_id: userProfile?.business_id || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-payments'] });
      toast.success('Payment recorded');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = {
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    thisMonth: payments.filter(p => {
      const d = new Date(p.payment_date);
      const now = new Date();
      return p.status === 'completed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, p) => s + Number(p.amount), 0),
    pendingCount: payments.filter(p => p.status === 'pending').length,
    totalPayments: payments.length,
  };

  return { payments, isLoading, createPayment, stats };
};
