import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/hooks/use-toast";

export interface SalonService {
  id: string;
  branch_id: string;
  business_id?: string;
  name: string;
  description?: string;
  category: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SalonServiceInsert = Omit<SalonService, 'id' | 'created_at' | 'updated_at'>;

export const SERVICE_CATEGORIES = ['Hair', 'Nails', 'Skin', 'Spa', 'Makeup', 'Other'];

export const useSalonServices = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['salon-services', selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data, error } = await supabase
        .from('salon_services')
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .eq('is_active', true)
        .order('category', { ascending: true });
      if (error) throw error;
      return (data || []) as SalonService[];
    },
    enabled: !!selectedBranch?.id,
  });

  const createService = useMutation({
    mutationFn: async (payload: Partial<SalonServiceInsert> & { name: string }) => {
      const { data, error } = await supabase.from('salon_services').insert([{
        ...payload,
        branch_id: selectedBranch?.id || '',
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-services'] });
      toast({ title: "Service added successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SalonService> & { id: string }) => {
      const { data, error } = await supabase.from('salon_services').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-services'] });
      toast({ title: "Service updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('salon_services').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-services'] });
      toast({ title: "Service removed" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return {
    services,
    isLoading,
    createService: createService.mutate,
    updateService: updateService.mutate,
    deleteService: deleteService.mutate,
    isCreating: createService.isPending,
  };
};
