import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GymEquipment {
  id: string;
  branch_id: string;
  business_id: string | null;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  zone: string | null;
  status: string;
  condition: string;
  last_maintenance: string | null;
  next_maintenance: string | null;
  maintenance_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useGymEquipment = () => {
  const { selectedBranch } = useBranch();
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const branchId = selectedBranch?.id;

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['gym-equipment', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('gym_equipment')
        .select('*')
        .eq('branch_id', branchId)
        .order('name', { ascending: true });
      if (error) throw error;
      return data as GymEquipment[];
    },
    enabled: !!branchId,
  });

  const createEquipment = useMutation({
    mutationFn: async (eq: Omit<GymEquipment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('gym_equipment').insert({
        ...eq,
        business_id: userProfile?.business_id || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-equipment'] });
      toast.success('Equipment added');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateEquipment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GymEquipment> & { id: string }) => {
      const { data, error } = await supabase.from('gym_equipment').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-equipment'] });
      toast.success('Equipment updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gym_equipment').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-equipment'] });
      toast.success('Equipment removed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { equipment, isLoading, createEquipment, updateEquipment, deleteEquipment };
};
