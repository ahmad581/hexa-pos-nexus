import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/hooks/use-toast";

export interface SalonPackage {
  id: string;
  branch_id: string;
  business_id?: string;
  name: string;
  description?: string;
  package_type: string;
  services: any[];
  total_sessions: number;
  price: number;
  validity_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const PACKAGE_TYPES = ['bundle', 'membership', 'prepaid'];

export const useSalonPackages = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['salon-packages', selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data, error } = await supabase
        .from('salon_packages')
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as SalonPackage[];
    },
    enabled: !!selectedBranch?.id,
  });

  const createPackage = useMutation({
    mutationFn: async (payload: Partial<SalonPackage> & { name: string }) => {
      const { data, error } = await supabase.from('salon_packages').insert([{
        ...payload,
        branch_id: selectedBranch?.id || '',
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-packages'] });
      toast({ title: "Package created successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SalonPackage> & { id: string }) => {
      const { data, error } = await supabase.from('salon_packages').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-packages'] });
      toast({ title: "Package updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('salon_packages').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-packages'] });
      toast({ title: "Package removed" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return {
    packages,
    isLoading,
    createPackage: createPackage.mutate,
    updatePackage: updatePackage.mutate,
    deletePackage: deletePackage.mutate,
    isCreating: createPackage.isPending,
  };
};
