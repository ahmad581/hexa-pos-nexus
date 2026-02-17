import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClassRegistration {
  id: string;
  class_id: string;
  member_id: string;
  status: string;
  attended: boolean | null;
  registered_at: string;
  member?: { first_name: string; last_name: string; member_number: string };
}

export const useGymClassRegistrations = (classId?: string) => {
  const queryClient = useQueryClient();

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['gym-class-registrations', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('gym_class_registrations')
        .select('*, member:members(first_name, last_name, member_number)')
        .eq('class_id', classId)
        .order('registered_at', { ascending: true });
      if (error) throw error;
      return data as ClassRegistration[];
    },
    enabled: !!classId,
  });

  const register = useMutation({
    mutationFn: async ({ classId, memberId }: { classId: string; memberId: string }) => {
      const { data, error } = await supabase.from('gym_class_registrations').insert({
        class_id: classId,
        member_id: memberId,
      }).select().single();
      if (error) throw error;

      // Increment registered_count
      const { data: cls } = await supabase.from('gym_classes').select('registered_count').eq('id', classId).single();
      if (cls) {
        await supabase.from('gym_classes').update({ registered_count: (cls.registered_count || 0) + 1 }).eq('id', classId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-class-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['gym-classes'] });
      toast.success('Member registered for class');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelRegistration = useMutation({
    mutationFn: async (registrationId: string) => {
      const { error } = await supabase.from('gym_class_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-class-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['gym-classes'] });
      toast.success('Registration cancelled');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markAttendance = useMutation({
    mutationFn: async ({ registrationId, attended }: { registrationId: string; attended: boolean }) => {
      const { error } = await supabase.from('gym_class_registrations')
        .update({ attended, status: attended ? 'attended' : 'no-show' })
        .eq('id', registrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-class-registrations'] });
      toast.success('Attendance updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { registrations, isLoading, register, cancelRegistration, markAttendance };
};
