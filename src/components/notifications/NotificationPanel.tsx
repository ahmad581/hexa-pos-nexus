import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { NotificationItem } from './NotificationItem';
import { useNotifications, Notification, NotificationType } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

// Map notification types to navigation paths
const getNotificationPath = (type: NotificationType): string | null => {
  switch (type) {
    case 'loan_request':
      return '/employees';
    case 'backup_completed':
    case 'backup_failed':
      return '/settings';
    case 'settings_changed':
      return '/settings';
    case 'stock_out':
    case 'stock_low':
    case 'stock_expiring':
    case 'stock_expired':
    case 'inventory_request':
      return '/inventory';
    case 'order_anomaly':
      return '/orders';
    default:
      return null;
  }
};

export const NotificationPanel = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications({ limit: 30 });

  const handleNotificationClick = (notification: Notification) => {
    const path = getNotificationPath(notification.type);
    if (path) {
      navigate(path);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-300 relative"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <Badge 
              className={cn(
                "absolute -top-1 -right-1 h-5 min-w-5 rounded-full text-xs",
                "flex items-center justify-center p-0",
                "bg-destructive hover:bg-destructive"
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-8"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                You'll be notified about important events here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div key={notification.recipient_id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onClick={handleNotificationClick}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
