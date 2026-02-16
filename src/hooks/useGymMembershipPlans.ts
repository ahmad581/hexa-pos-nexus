import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MembershipPlan {
  id: string;
  branch_id: string;
  business_id: string | null;
  name: string;
  description: string | null;
  duration_type: string;
  duration_days: number;
  price: number;
  signup_fee: number;
  access_level: string;
  includes_classes: boolean;
  includes_personal_training: boolean;
  guest_passes_per_month: number;
  freeze_allowed: boolean;
  max_freeze_days: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type MembershipPlanInsert = Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>;

export const useGymMembershipPlans = () => {
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const branchId = selectedBranch?.id;

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['gym-membership-plans', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('gym_membership_plans')
        .select('*')
        .eq('branch_id', branchId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as MembershipPlan[];
    },
    enabled: !!branchId,
  });

  const createPlan = useMutation({
    mutationFn: async (plan: MembershipPlanInsert) => {
      const { data, error } = await supabase.from('gym_membership_plans').insert(plan).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-membership-plans'] });
      toast.success('Plan created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MembershipPlan> & { id: string }) => {
      const { data, error } = await supabase.from('gym_membership_plans').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-membership-plans'] });
      toast.success('Plan updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gym_membership_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-membership-plans'] });
      toast.success('Plan deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { plans, isLoading, createPlan, updatePlan, deletePlan };
};
