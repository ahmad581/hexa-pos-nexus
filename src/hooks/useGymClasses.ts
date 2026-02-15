import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GymClass {
  id: string;
  branch_id: string;
  business_id: string | null;
  name: string;
  class_type: string;
  instructor_name: string | null;
  description: string | null;
  day_of_week: string;
  start_time: string;
  duration_minutes: number;
  capacity: number;
  registered_count: number;
  location: string | null;
  status: string;
  recurring: boolean;
  created_at: string;
  updated_at: string;
}

export const useGymClasses = () => {
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const branchId = selectedBranch?.id;

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['gym-classes', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('gym_classes')
        .select('*')
        .eq('branch_id', branchId)
        .order('day_of_week', { ascending: true });
      if (error) throw error;
      return data as GymClass[];
    },
    enabled: !!branchId,
  });

  const createClass = useMutation({
    mutationFn: async (cls: Omit<GymClass, 'id' | 'created_at' | 'updated_at' | 'registered_count'>) => {
      const { data, error } = await supabase.from('gym_classes').insert({
        ...cls,
        business_id: userProfile?.business_id || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-classes'] });
      toast.success('Class created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GymClass> & { id: string }) => {
      const { data, error } = await supabase.from('gym_classes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-classes'] });
      toast.success('Class updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gym_classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-classes'] });
      toast.success('Class deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { classes, isLoading, createClass, updateClass, deleteClass };
};
