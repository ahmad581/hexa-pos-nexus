import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/hooks/use-toast";

export interface Stylist {
  id: string;
  branch_id: string;
  business_id?: string;
  first_name: string;
  last_name: string;
  name: string;
  email?: string;
  phone?: string;
  specialties: string[];
  experience_level: string;
  status: string;
  rating: number;
  bio?: string;
  working_hours: Record<string, any>;
  is_active: boolean;
  hire_date?: string;
  created_at: string;
  updated_at: string;
}

export type StylistInsert = Omit<Stylist, 'id' | 'created_at' | 'updated_at'>;

export const useStylists = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: stylists = [], isLoading } = useQuery({
    queryKey: ['stylists', selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data, error } = await supabase
        .from('stylists')
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .eq('is_active', true)
        .order('first_name', { ascending: true });
      if (error) throw error;
      return (data || []).map(s => ({
        ...s,
        specialties: s.specialties || [],
        working_hours: (s.working_hours as Record<string, any>) || {},
        rating: s.rating ?? 5.0,
        experience_level: s.experience_level ?? 'junior',
        status: s.status ?? 'available',
        first_name: s.first_name ?? s.name?.split(' ')[0] ?? '',
        last_name: s.last_name ?? s.name?.split(' ').slice(1).join(' ') ?? '',
      })) as Stylist[];
    },
    enabled: !!selectedBranch?.id,
  });

  const createStylist = useMutation({
    mutationFn: async (payload: Partial<StylistInsert>) => {
      const fullName = `${payload.first_name || ''} ${payload.last_name || ''}`.trim();
      const { data, error } = await supabase.from('stylists').insert([{
        ...payload,
        name: fullName,
        branch_id: selectedBranch?.id || '',
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast({ title: "Stylist added successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStylist = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Stylist> & { id: string }) => {
      const updates: any = { ...payload };
      if (payload.first_name || payload.last_name) {
        updates.name = `${payload.first_name || ''} ${payload.last_name || ''}`.trim();
      }
      const { data, error } = await supabase.from('stylists').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast({ title: "Stylist updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteStylist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stylists').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylists'] });
      toast({ title: "Stylist removed" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return {
    stylists,
    isLoading,
    createStylist: createStylist.mutate,
    updateStylist: updateStylist.mutate,
    deleteStylist: deleteStylist.mutate,
    isCreating: createStylist.isPending,
    isUpdating: updateStylist.isPending,
  };
};
