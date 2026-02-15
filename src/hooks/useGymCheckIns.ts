import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GymCheckIn {
  id: string;
  branch_id: string;
  business_id: string | null;
  member_id: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_method: string;
  zone: string | null;
  notes: string | null;
  created_at: string;
  member?: {
    first_name: string;
    last_name: string;
    member_number: string;
    membership_type: string;
    status: string;
  };
}

export const useGymCheckIns = () => {
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const branchId = selectedBranch?.id;

  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: ['gym-check-ins', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('gym_check_ins')
        .select('*, member:members(first_name, last_name, member_number, membership_type, status)')
        .eq('branch_id', branchId)
        .gte('check_in_time', `${today}T00:00:00`)
        .order('check_in_time', { ascending: false });
      if (error) throw error;
      return data as GymCheckIn[];
    },
    enabled: !!branchId,
  });

  const checkIn = useMutation({
    mutationFn: async ({ memberId, zone, method }: { memberId: string; zone?: string; method?: string }) => {
      const { data, error } = await supabase.from('gym_check_ins').insert({
        branch_id: branchId!,
        business_id: userProfile?.business_id || null,
        member_id: memberId,
        check_in_method: method || 'manual',
        zone: zone || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-check-ins'] });
      toast.success('Member checked in');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkOut = useMutation({
    mutationFn: async (checkInId: string) => {
      const { error } = await supabase.from('gym_check_ins')
        .update({ check_out_time: new Date().toISOString() })
        .eq('id', checkInId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-check-ins'] });
      toast.success('Member checked out');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { checkIns, isLoading, checkIn, checkOut };
};
