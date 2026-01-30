import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CallQueueItem {
  id: string;
  business_id: string;
  caller_phone: string;
  caller_name: string | null;
  caller_address: string | null;
  twilio_call_sid: string | null;
  status: 'ringing' | 'queued' | 'answered' | 'on_hold' | 'transferred' | 'completed' | 'missed' | 'abandoned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  call_type: 'sales' | 'support' | 'appointment' | 'complaint' | 'general' | 'internal';
  answered_by: string | null;
  answered_at: string | null;
  transferred_to: string | null;
  transferred_at: string | null;
  completed_at: string | null;
  queue_position: number | null;
  wait_time_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface CallHistoryItem {
  id: string;
  business_id: string;
  caller_phone: string;
  caller_name: string | null;
  callee_phone: string | null;
  call_type: string;
  direction: 'inbound' | 'outbound' | 'internal';
  status: string;
  duration_seconds: number;
  recording_url: string | null;
  recording_duration_seconds: number | null;
  handled_by: string | null;
  notes: string | null;
  outcome: string | null;
  created_at: string;
}

export interface EmployeeExtension {
  id: string;
  profile_id: string;
  business_id: string;
  extension_number: string;
  is_available: boolean;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export const useCallCenter = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  const businessId = userProfile?.business_id;

  // Fetch active calls in queue
  const { data: callQueue = [], isLoading: isLoadingQueue } = useQuery({
    queryKey: ['call-queue', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('call_queue')
        .select('*')
        .eq('business_id', businessId)
        .in('status', ['ringing', 'queued', 'answered', 'on_hold', 'transferred'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as CallQueueItem[];
    },
    enabled: !!businessId,
    refetchInterval: 5000, // Poll every 5 seconds as backup
  });

  // Fetch call history
  const { data: callHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['call-history', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('call_history')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as CallHistoryItem[];
    },
    enabled: !!businessId,
  });

  // Fetch employee extensions
  const { data: employeeExtensions = [], isLoading: isLoadingExtensions } = useQuery({
    queryKey: ['employee-extensions', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('employee_extensions')
        .select(`
          *,
          profile:profiles(first_name, last_name, email)
        `)
        .eq('business_id', businessId);

      if (error) throw error;
      return data as EmployeeExtension[];
    },
    enabled: !!businessId,
  });

  // Fetch business call center number
  const { data: callCenterNumber } = useQuery({
    queryKey: ['call-center-number', businessId],
    queryFn: async () => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .from('call_center_numbers')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Set up real-time subscription for call queue
  useEffect(() => {
    if (!businessId) return;

    const channel = supabase
      .channel('call-queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_queue',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          console.log('Call queue change:', payload);
          queryClient.invalidateQueries({ queryKey: ['call-queue', businessId] });
          
          // Show notification for new incoming calls
          if (payload.eventType === 'INSERT' && payload.new.status === 'ringing') {
            toast({
              title: '📞 Incoming Call',
              description: `Call from ${payload.new.caller_phone}`,
            });
            // Play notification sound if available
            try {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(() => {});
            } catch {}
          }
        }
      )
      .subscribe((status) => {
        setRealtimeEnabled(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, queryClient, toast]);

  // Answer call mutation
  const answerCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await fetch(
        'https://fcdfephraaiusolzfdvf.supabase.co/functions/v1/twilio-webhook/answer',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ callId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to answer call');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-queue', businessId] });
      toast({ title: 'Call answered' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Put call on hold mutation
  const holdCallMutation = useMutation({
    mutationFn: async (callId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await fetch(
        'https://fcdfephraaiusolzfdvf.supabase.co/functions/v1/twilio-webhook/hold',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ callId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to put call on hold');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-queue', businessId] });
      toast({ title: 'Call put on hold' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Transfer call mutation
  const transferCallMutation = useMutation({
    mutationFn: async ({ callId, transferToProfileId }: { callId: string; transferToProfileId: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await fetch(
        'https://fcdfephraaiusolzfdvf.supabase.co/functions/v1/twilio-webhook/transfer',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ callId, transferToProfileId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transfer call');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-queue', businessId] });
      toast({ title: 'Call transferred' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async ({ callId, notes, outcome }: { callId: string; notes?: string; outcome?: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const response = await fetch(
        'https://fcdfephraaiusolzfdvf.supabase.co/functions/v1/twilio-webhook/end',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({ callId, notes, outcome }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to end call');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-queue', businessId] });
      queryClient.invalidateQueries({ queryKey: ['call-history', businessId] });
      toast({ title: 'Call ended' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update availability
  const updateAvailability = async (isAvailable: boolean) => {
    if (!userProfile?.id) return;

    const { error } = await supabase
      .from('employee_extensions')
      .update({ is_available: isAvailable })
      .eq('profile_id', userProfile.id);

    if (error) {
      toast({ title: 'Error updating availability', variant: 'destructive' });
    } else {
      queryClient.invalidateQueries({ queryKey: ['employee-extensions', businessId] });
    }
  };

  // Get call stats
  const stats = {
    activeCalls: callQueue.filter(c => c.status === 'answered').length,
    ringingCalls: callQueue.filter(c => c.status === 'ringing' || c.status === 'queued').length,
    onHoldCalls: callQueue.filter(c => c.status === 'on_hold').length,
    totalCallsToday: callHistory.filter(c => {
      const today = new Date().toDateString();
      return new Date(c.created_at).toDateString() === today;
    }).length + callQueue.length,
  };

  return {
    callQueue,
    callHistory,
    employeeExtensions,
    callCenterNumber,
    stats,
    isLoading: isLoadingQueue || isLoadingHistory || isLoadingExtensions,
    realtimeEnabled,
    answerCall: answerCallMutation.mutate,
    holdCall: holdCallMutation.mutate,
    transferCall: transferCallMutation.mutate,
    endCall: endCallMutation.mutate,
    updateAvailability,
    isAnswering: answerCallMutation.isPending,
    isHolding: holdCallMutation.isPending,
    isTransferring: transferCallMutation.isPending,
    isEnding: endCallMutation.isPending,
  };
};
