import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Package, 
  Settings, 
  DollarSign, 
  Database,
  ShoppingCart,
  Clock,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Notification, NotificationType, NotificationSeverity } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (recipientId: string) => void;
  onClick?: (notification: Notification) => void;
}

const getNotificationIcon = (type: NotificationType, severity: NotificationSeverity) => {
  const iconClass = cn(
    'h-5 w-5',
    severity === 'critical' && 'text-destructive',
    severity === 'warning' && 'text-yellow-500',
    severity === 'info' && 'text-blue-500'
  );

  switch (type) {
    case 'loan_request':
      return <DollarSign className={iconClass} />;
    case 'backup_completed':
      return <CheckCircle className={cn(iconClass, 'text-green-500')} />;
    case 'backup_failed':
      return <AlertCircle className={iconClass} />;
    case 'settings_changed':
      return <Settings className={iconClass} />;
    case 'stock_out':
    case 'stock_low':
      return <Package className={iconClass} />;
    case 'stock_expiring':
    case 'stock_expired':
      return <Clock className={iconClass} />;
    case 'inventory_request':
      return <Database className={iconClass} />;
    case 'order_anomaly':
      return <ShoppingCart className={iconClass} />;
    default:
      return <Bell className={iconClass} />;
  }
};

const getSeverityBadge = (severity: NotificationSeverity) => {
  const baseClass = 'text-xs px-2 py-0.5 rounded-full font-medium';
  
  switch (severity) {
    case 'critical':
      return <span className={cn(baseClass, 'bg-destructive/20 text-destructive')}>Critical</span>;
    case 'warning':
      return <span className={cn(baseClass, 'bg-yellow-500/20 text-yellow-600')}>Warning</span>;
    case 'info':
      return <span className={cn(baseClass, 'bg-blue-500/20 text-blue-600')}>Info</span>;
    default:
      return null;
  }
};

export const NotificationItem = ({ 
  notification, 
  onMarkAsRead, 
  onClick 
}: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.recipient_id);
    }
    onClick?.(notification);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-muted/50',
        !notification.is_read && 'bg-primary/5 border-l-2 border-primary'
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type, notification.severity)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn(
            'text-sm truncate',
            !notification.is_read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'
          )}>
            {notification.title}
          </h4>
          {getSeverityBadge(notification.severity)}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        
        <span className="text-xs text-muted-foreground mt-1 block">
          {timeAgo}
        </span>
      </div>

      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
};
