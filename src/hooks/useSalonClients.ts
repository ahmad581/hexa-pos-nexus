import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/hooks/use-toast";

export interface SalonClient {
  id: string;
  branch_id: string;
  business_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  preferred_stylist_id?: string;
  allergies?: string;
  notes?: string;
  visit_count: number;
  last_visit_date?: string;
  created_at: string;
  updated_at: string;
}

export type SalonClientInsert = Omit<SalonClient, 'id' | 'created_at' | 'updated_at'>;

export const useSalonClients = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['salon-clients', selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data, error } = await supabase
        .from('salon_clients')
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .order('last_name', { ascending: true });
      if (error) throw error;
      return (data || []) as SalonClient[];
    },
    enabled: !!selectedBranch?.id,
  });

  const createClient = useMutation({
    mutationFn: async (payload: Partial<SalonClientInsert> & { first_name: string; last_name: string }) => {
      const { data, error } = await supabase.from('salon_clients').insert([{
        ...payload,
        branch_id: selectedBranch?.id || '',
        visit_count: 0,
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-clients'] });
      toast({ title: "Client added successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SalonClient> & { id: string }) => {
      const { data, error } = await supabase.from('salon_clients').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-clients'] });
      toast({ title: "Client updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('salon_clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-clients'] });
      toast({ title: "Client removed" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return {
    clients,
    isLoading,
    createClient: createClient.mutate,
    updateClient: updateClient.mutate,
    deleteClient: deleteClient.mutate,
    isCreating: createClient.isPending,
  };
};
