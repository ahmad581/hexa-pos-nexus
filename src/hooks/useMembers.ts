import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";

export interface Member {
  id: string;
  branch_id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  membership_type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export type MemberInsert = Omit<Member, 'id' | 'created_at' | 'updated_at'>;

export const useMembers = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();
  const branchId = selectedBranch?.id;

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Member[];
    },
    enabled: !!branchId,
  });

  const createMember = useMutation({
    mutationFn: async (member: MemberInsert) => {
      const { data, error } = await supabase.from('members').insert(member).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member added successfully');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMember = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Member> & { id: string }) => {
      const { data, error } = await supabase.from('members').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Member removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { members, isLoading, createMember, updateMember, deleteMember };
};
