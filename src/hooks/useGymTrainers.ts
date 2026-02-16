import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GymTrainer {
  id: string;
  branch_id: string;
  business_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  specializations: string[];
  certifications: string[];
  hourly_rate: number;
  session_rate: number;
  bio: string | null;
  status: string;
  hire_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface GymPTSession {
  id: string;
  branch_id: string;
  business_id: string | null;
  trainer_id: string;
  member_id: string;
  session_date: string;
  duration_minutes: number;
  status: string;
  price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  trainer?: { first_name: string; last_name: string };
  member?: { first_name: string; last_name: string; member_number: string };
}

export const useGymTrainers = () => {
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const branchId = selectedBranch?.id;

  const { data: trainers = [], isLoading } = useQuery({
    queryKey: ['gym-trainers', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('gym_trainers')
        .select('*')
        .eq('branch_id', branchId)
        .order('first_name');
      if (error) throw error;
      return data as GymTrainer[];
    },
    enabled: !!branchId,
  });

  const { data: ptSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['gym-pt-sessions', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('gym_pt_sessions')
        .select('*, trainer:gym_trainers(first_name, last_name), member:members(first_name, last_name, member_number)')
        .eq('branch_id', branchId)
        .order('session_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as GymPTSession[];
    },
    enabled: !!branchId,
  });

  const createTrainer = useMutation({
    mutationFn: async (trainer: Omit<GymTrainer, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('gym_trainers').insert(trainer).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-trainers'] });
      toast.success('Trainer added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateTrainer = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GymTrainer> & { id: string }) => {
      const { data, error } = await supabase.from('gym_trainers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-trainers'] });
      toast.success('Trainer updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTrainer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gym_trainers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-trainers'] });
      toast.success('Trainer removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createPTSession = useMutation({
    mutationFn: async (session: Omit<GymPTSession, 'id' | 'created_at' | 'updated_at' | 'trainer' | 'member'>) => {
      const { data, error } = await supabase.from('gym_pt_sessions').insert(session).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-pt-sessions'] });
      toast.success('Session scheduled');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updatePTSession = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GymPTSession> & { id: string }) => {
      const { error } = await supabase.from('gym_pt_sessions').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-pt-sessions'] });
      toast.success('Session updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { trainers, isLoading, ptSessions, sessionsLoading, createTrainer, updateTrainer, deleteTrainer, createPTSession, updatePTSession };
};
