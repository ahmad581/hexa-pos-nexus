import { useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CallCenterLoginSession {
  id: string;
  profile_id: string;
  business_id: string;
  login_time: string;
  logout_time: string | null;
  session_duration_seconds: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export const useCallCenterSession = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const currentSessionId = useRef<string | null>(null);
  const hasCheckedIn = useRef(false);

  const profileId = userProfile?.id;
  const businessId = userProfile?.business_id;
  const isCallCenterEmployee = userProfile?.primary_role === 'CallCenterEmp';

  // Fetch today's sessions for the current user
  const { data: todaySessions = [], isLoading } = useQuery({
    queryKey: ['call-center-sessions', profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('call_center_login_sessions')
        .select('*')
        .eq('profile_id', profileId)
        .gte('login_time', today.toISOString())
        .order('login_time', { ascending: false });

      if (error) throw error;
      return data as CallCenterLoginSession[];
    },
    enabled: !!profileId && isCallCenterEmployee,
  });

  // Fetch all sessions for reports (managers)
  const { data: allSessions = [] } = useQuery({
    queryKey: ['call-center-all-sessions', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('call_center_login_sessions')
        .select(`
          *,
          profile:profiles(first_name, last_name, email)
        `)
        .eq('business_id', businessId)
        .order('login_time', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!profileId || !businessId) {
        throw new Error('Missing profile or business ID');
      }

      // First, check if there's an open session from today and close it
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: openSession } = await supabase
        .from('call_center_login_sessions')
        .select('id, login_time')
        .eq('profile_id', profileId)
        .gte('login_time', today.toISOString())
        .is('logout_time', null)
        .single();

      if (openSession) {
        // Close the previous session
        const loginTime = new Date(openSession.login_time);
        const now = new Date();
        const durationSeconds = Math.floor((now.getTime() - loginTime.getTime()) / 1000);

        await supabase
          .from('call_center_login_sessions')
          .update({
            logout_time: now.toISOString(),
            session_duration_seconds: durationSeconds,
          })
          .eq('id', openSession.id);
      }

      // Create new session
      const { data, error } = await supabase
        .from('call_center_login_sessions')
        .insert({
          profile_id: profileId,
          business_id: businessId,
          login_time: new Date().toISOString(),
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      currentSessionId.current = data.id;
      queryClient.invalidateQueries({ queryKey: ['call-center-sessions', profileId] });
      toast({
        title: '✅ Checked In',
        description: `Work session started at ${new Date().toLocaleTimeString()}`,
      });
    },
    onError: (error: Error) => {
      console.error('Check-in error:', error);
      toast({
        title: 'Check-in Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async (sessionId?: string) => {
      const idToClose = sessionId || currentSessionId.current;
      
      if (!idToClose) {
        // Find the open session
        const { data: openSession } = await supabase
          .from('call_center_login_sessions')
          .select('id, login_time')
          .eq('profile_id', profileId!)
          .is('logout_time', null)
          .order('login_time', { ascending: false })
          .limit(1)
          .single();

        if (!openSession) {
          throw new Error('No open session found');
        }

        const loginTime = new Date(openSession.login_time);
        const now = new Date();
        const durationSeconds = Math.floor((now.getTime() - loginTime.getTime()) / 1000);

        const { error } = await supabase
          .from('call_center_login_sessions')
          .update({
            logout_time: now.toISOString(),
            session_duration_seconds: durationSeconds,
          })
          .eq('id', openSession.id);

        if (error) throw error;
        return { id: openSession.id, duration: durationSeconds };
      }

      // Get the session to calculate duration
      const { data: session } = await supabase
        .from('call_center_login_sessions')
        .select('login_time')
        .eq('id', idToClose)
        .single();

      if (!session) throw new Error('Session not found');

      const loginTime = new Date(session.login_time);
      const now = new Date();
      const durationSeconds = Math.floor((now.getTime() - loginTime.getTime()) / 1000);

      const { error } = await supabase
        .from('call_center_login_sessions')
        .update({
          logout_time: now.toISOString(),
          session_duration_seconds: durationSeconds,
        })
        .eq('id', idToClose);

      if (error) throw error;
      return { id: idToClose, duration: durationSeconds };
    },
    onSuccess: (data) => {
      currentSessionId.current = null;
      queryClient.invalidateQueries({ queryKey: ['call-center-sessions', profileId] });
      
      const hours = Math.floor(data.duration / 3600);
      const minutes = Math.floor((data.duration % 3600) / 60);
      
      toast({
        title: '👋 Checked Out',
        description: `Session duration: ${hours}h ${minutes}m`,
      });
    },
    onError: (error: Error) => {
      console.error('Check-out error:', error);
      toast({
        title: 'Check-out Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Auto check-in when the page loads for call center employees
  const performCheckIn = useCallback(() => {
    if (isCallCenterEmployee && profileId && businessId && !hasCheckedIn.current) {
      hasCheckedIn.current = true;
      checkInMutation.mutate();
    }
  }, [isCallCenterEmployee, profileId, businessId, checkInMutation]);

  // Auto check-out on page unload
  useEffect(() => {
    if (!isCallCenterEmployee) return;

    const handleBeforeUnload = async () => {
      // Use sendBeacon for reliable logout on page close
      if (currentSessionId.current && profileId) {
        const session = await supabase.auth.getSession();
        if (session.data.session) {
          // Try to close the session synchronously using sendBeacon
          const url = `https://fcdfephraaiusolzfdvf.supabase.co/rest/v1/call_center_login_sessions?id=eq.${currentSessionId.current}`;
          const now = new Date().toISOString();
          
          navigator.sendBeacon(url, JSON.stringify({
            logout_time: now,
          }));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isCallCenterEmployee, profileId]);

  // Get current open session
  const currentOpenSession = todaySessions.find(s => !s.logout_time);
  
  // Calculate today's total hours
  const todayTotalSeconds = todaySessions.reduce((total, session) => {
    if (session.session_duration_seconds) {
      return total + session.session_duration_seconds;
    }
    if (!session.logout_time) {
      // Still active - calculate current duration
      const loginTime = new Date(session.login_time);
      const now = new Date();
      return total + Math.floor((now.getTime() - loginTime.getTime()) / 1000);
    }
    return total;
  }, 0);

  const todayTotalHours = Math.floor(todayTotalSeconds / 3600);
  const todayTotalMinutes = Math.floor((todayTotalSeconds % 3600) / 60);

  return {
    // Session data
    todaySessions,
    allSessions,
    currentOpenSession,
    currentSessionId: currentSessionId.current,
    
    // Stats
    todayTotalHours,
    todayTotalMinutes,
    todayTotalSeconds,
    
    // Loading states
    isLoading,
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    
    // Actions
    checkIn: performCheckIn,
    checkOut: () => checkOutMutation.mutate(undefined),
    manualCheckIn: () => checkInMutation.mutate(),
    
    // Status
    isCheckedIn: !!currentOpenSession,
    isCallCenterEmployee,
  };
};
