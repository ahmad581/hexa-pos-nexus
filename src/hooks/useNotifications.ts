import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export type NotificationType = 
  | 'loan_request'
  | 'backup_completed'
  | 'backup_failed'
  | 'settings_changed'
  | 'stock_out'
  | 'stock_low'
  | 'stock_expiring'
  | 'stock_expired'
  | 'inventory_request'
  | 'order_anomaly';

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface Notification {
  id: string;
  business_id: string;
  branch_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
  severity: NotificationSeverity;
  created_by: string | null;
  created_at: string;
  is_read: boolean;
  recipient_id: string;
}

interface UseNotificationsOptions {
  limit?: number;
  autoRefresh?: boolean;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { limit = 50, autoRefresh = true } = options;
  const { user } = useAuth();
  const userId = user?.id;
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Query notification_recipients joined with notifications
      const { data, error: fetchError } = await supabase
        .from('notification_recipients')
        .select(`
          id,
          is_read,
          notification_id,
          notifications (
            id,
            business_id,
            branch_id,
            type,
            title,
            message,
            metadata,
            severity,
            created_by,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error('Error fetching notifications:', fetchError);
        setError(fetchError.message);
        return;
      }

      // Transform the data
      const transformedNotifications: Notification[] = (data || [])
        .filter(item => item.notifications)
        .map(item => ({
          id: (item.notifications as any).id,
          business_id: (item.notifications as any).business_id,
          branch_id: (item.notifications as any).branch_id,
          type: (item.notifications as any).type as NotificationType,
          title: (item.notifications as any).title,
          message: (item.notifications as any).message,
          metadata: (item.notifications as any).metadata || {},
          severity: (item.notifications as any).severity as NotificationSeverity,
          created_by: (item.notifications as any).created_by,
          created_at: (item.notifications as any).created_at,
          is_read: item.is_read,
          recipient_id: item.id,
        }));

      setNotifications(transformedNotifications);
      setUnreadCount(transformedNotifications.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  // Mark a notification as read
  const markAsRead = useCallback(async (recipientId: string) => {
    if (!userId) return;

    const { error: updateError } = await supabase
      .from('notification_recipients')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', recipientId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error marking notification as read:', updateError);
      return;
    }

    // Update local state
    setNotifications(prev => 
      prev.map(n => 
        n.recipient_id === recipientId 
          ? { ...n, is_read: true } 
          : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.recipient_id);

    if (unreadIds.length === 0) return;

    const { error: updateError } = await supabase
      .from('notification_recipients')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .in('id', unreadIds)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error marking all notifications as read:', updateError);
      return;
    }

    // Update local state
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, [userId, notifications]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId || !autoRefresh) return;

    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      channel = supabase
        .channel(`notifications_${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notification_recipients',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            // Refetch when new notification arrives
            fetchNotifications();
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, autoRefresh, fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
