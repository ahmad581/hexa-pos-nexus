import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/hooks/use-toast";

export interface SalonAppointment {
  id: string;
  branch_id: string;
  business_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  service_type: string;
  stylist_id?: string;
  appointment_date: string;
  duration: number;
  status: string;
  price?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type SalonAppointmentInsert = Omit<SalonAppointment, 'id' | 'created_at' | 'updated_at'>;

export const APPOINTMENT_STATUSES = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'];

export const useSalonAppointments = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['salon-appointments', selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('branch_id', selectedBranch.id)
        .order('appointment_date', { ascending: true });
      if (error) throw error;
      return (data || []) as SalonAppointment[];
    },
    enabled: !!selectedBranch?.id,
  });

  const createAppointment = useMutation({
    mutationFn: async (payload: Partial<SalonAppointmentInsert> & { customer_name: string; appointment_date: string; service_type: string }) => {
      const { data, error } = await supabase.from('appointments').insert([{
        ...payload,
        branch_id: selectedBranch?.id || '',
        status: payload.status || 'scheduled',
        duration: payload.duration || 60,
      }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-appointments'] });
      toast({ title: "Appointment booked successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<SalonAppointment> & { id: string }) => {
      const { data, error } = await supabase.from('appointments').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-appointments'] });
      toast({ title: "Appointment updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salon-appointments'] });
      toast({ title: "Appointment cancelled" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return {
    appointments,
    isLoading,
    createAppointment: createAppointment.mutate,
    updateAppointment: updateAppointment.mutate,
    deleteAppointment: deleteAppointment.mutate,
    isCreating: createAppointment.isPending,
  };
};
