import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";

export interface GymFreeze {
  id: string;
  branch_id: string;
  member_id: string;
  freeze_start: string;
  freeze_end: string | null;
  reason: string | null;
  max_days_allowed: number;
  status: string;
  created_at: string;
  updated_at: string;
  member?: { first_name: string; last_name: string; member_number: string };
}

export const useGymFreezes = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();
  const branchId = selectedBranch?.id;

  const { data: freezes = [], isLoading } = useQuery({
    queryKey: ['gym-freezes', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('gym_membership_freezes')
        .select('*, member:members(first_name, last_name, member_number)')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GymFreeze[];
    },
    enabled: !!branchId,
  });

  const createFreeze = useMutation({
    mutationFn: async (freeze: { member_id: string; reason?: string; max_days_allowed: number }) => {
      // Also update member status to frozen
      const { error: memberError } = await supabase
        .from('members')
        .update({ status: 'frozen' })
        .eq('id', freeze.member_id);
      if (memberError) throw memberError;

      const { data, error } = await supabase.from('gym_membership_freezes').insert({
        branch_id: branchId!,
        member_id: freeze.member_id,
        reason: freeze.reason || null,
        max_days_allowed: freeze.max_days_allowed,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-freezes'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membership frozen');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const endFreeze = useMutation({
    mutationFn: async ({ freezeId, memberId }: { freezeId: string; memberId: string }) => {
      const { error: freezeError } = await supabase
        .from('gym_membership_freezes')
        .update({ status: 'ended', freeze_end: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString() })
        .eq('id', freezeId);
      if (freezeError) throw freezeError;

      const { error: memberError } = await supabase
        .from('members')
        .update({ status: 'active' })
        .eq('id', memberId);
      if (memberError) throw memberError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-freezes'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Membership unfrozen');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getActiveFreezeForMember = (memberId: string) =>
    freezes.find(f => f.member_id === memberId && f.status === 'active');

  const getDaysUsed = (freeze: GymFreeze) => {
    const start = new Date(freeze.freeze_start);
    const end = freeze.freeze_end ? new Date(freeze.freeze_end) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return { freezes, isLoading, createFreeze, endFreeze, getActiveFreezeForMember, getDaysUsed };
};
