import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Pause, PhoneOff, ArrowRightLeft, Clock, MapPin, User } from "lucide-react";
import { CallQueueItem } from "@/hooks/useCallCenter";
import { formatDistanceToNow } from "date-fns";

interface CallQueueCardProps {
  call: CallQueueItem;
  onAnswer: (callId: string) => void;
  onHold: (callId: string) => void;
  onEnd: (callId: string) => void;
  onTransfer: (callId: string) => void;
  isAnswering?: boolean;
  isHolding?: boolean;
  isEnding?: boolean;
  currentUserId?: string;
}

export const CallQueueCard = ({
  call,
  onAnswer,
  onHold,
  onEnd,
  onTransfer,
  isAnswering,
  isHolding,
  isEnding,
  currentUserId,
}: CallQueueCardProps) => {
  const getStatusColor = (status: CallQueueItem['status']) => {
    switch (status) {
      case 'ringing':
      case 'queued':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'answered':
        return 'bg-green-500/20 text-green-400';
      case 'on_hold':
        return 'bg-blue-500/20 text-blue-400';
      case 'transferred':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: CallQueueItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600/20 text-red-400 border-red-500';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500';
      default:
        return 'bg-gray-500/20 text-muted-foreground border-border';
    }
  };

  const getCallTypeColor = (type: CallQueueItem['call_type']) => {
    switch (type) {
      case 'sales':
        return 'bg-green-500/20 text-green-400';
      case 'support':
        return 'bg-blue-500/20 text-blue-400';
      case 'appointment':
        return 'bg-purple-500/20 text-purple-400';
      case 'complaint':
        return 'bg-red-500/20 text-red-400';
      case 'internal':
        return 'bg-indigo-500/20 text-indigo-400';
      default:
        return 'bg-gray-500/20 text-muted-foreground';
    }
  };

  const isRinging = call.status === 'ringing' || call.status === 'queued';
  const isActive = call.status === 'answered';
  const isOnHold = call.status === 'on_hold';
  const isMyCall = call.answered_by === currentUserId;

  return (
    <div className={`bg-muted p-4 rounded-lg border-l-4 ${
      isRinging ? 'border-l-yellow-500 animate-pulse' : 
      isActive ? 'border-l-green-500' : 
      isOnHold ? 'border-l-blue-500' : 'border-l-border'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isRinging ? 'bg-yellow-500 animate-pulse' : 
            isActive ? 'bg-green-500' : 
            isOnHold ? 'bg-blue-500' : 'bg-secondary'
          }`}>
            <Phone size={20} className="text-foreground" />
          </div>
          <div>
            <h4 className="font-medium text-foreground flex items-center gap-2">
              {call.caller_name || 'Unknown Caller'}
              {isMyCall && <Badge variant="outline" className="text-xs">Your Call</Badge>}
            </h4>
            <p className="text-muted-foreground text-sm">{call.caller_phone}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getPriorityColor(call.priority)}>
            {call.priority}
          </Badge>
          <Badge className={getCallTypeColor(call.call_type)}>
            {call.call_type}
          </Badge>
          <Badge className={getStatusColor(call.status)}>
            {call.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
          </div>
          {call.caller_address && (
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              {call.caller_address}
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        {isRinging && (
          <Button
            size="sm"
            onClick={() => onAnswer(call.id)}
            className="bg-primary hover:bg-primary/90"
            disabled={isAnswering}
          >
            <Phone size={14} className="mr-1" />
            Answer
          </Button>
        )}
        
        {isActive && isMyCall && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
              onClick={() => onHold(call.id)}
              disabled={isHolding}
            >
              <Pause size={14} className="mr-1" />
              Hold
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              onClick={() => onTransfer(call.id)}
            >
              <ArrowRightLeft size={14} className="mr-1" />
              Transfer
            </Button>
          </>
        )}

        {isOnHold && isMyCall && (
          <Button
            size="sm"
            onClick={() => onAnswer(call.id)}
            className="bg-primary hover:bg-primary/90"
            disabled={isAnswering}
          >
            <Phone size={14} className="mr-1" />
            Resume
          </Button>
        )}

        {(isActive || isOnHold) && isMyCall && (
          <Button
            size="sm"
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10"
            onClick={() => onEnd(call.id)}
            disabled={isEnding}
          >
            <PhoneOff size={14} className="mr-1" />
            End
          </Button>
        )}
      </div>
    </div>
  );
};
