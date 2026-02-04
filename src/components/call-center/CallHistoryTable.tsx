import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Download } from "lucide-react";
import { CallHistoryItem } from "@/hooks/useCallCenter";
import { format } from "date-fns";

interface CallHistoryTableProps {
  calls: CallHistoryItem[];
  searchTerm: string;
}

export const CallHistoryTable = ({ calls, searchTerm }: CallHistoryTableProps) => {
  const filteredCalls = calls.filter(
    (call) =>
      call.caller_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.caller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.call_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'missed':
        return 'bg-red-500/20 text-red-400';
      case 'abandoned':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-muted-foreground';
    }
  };

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'inbound':
        return 'bg-blue-500/20 text-blue-400';
      case 'outbound':
        return 'bg-purple-500/20 text-purple-400';
      case 'internal':
        return 'bg-indigo-500/20 text-indigo-400';
      default:
        return 'bg-gray-500/20 text-muted-foreground';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 text-muted-foreground font-medium">Caller</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Phone</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Type</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Direction</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Duration</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Time</th>
            <th className="text-left py-3 text-muted-foreground font-medium">Recording</th>
          </tr>
        </thead>
        <tbody>
          {filteredCalls.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-muted-foreground">
                No call history found
              </td>
            </tr>
          ) : (
            filteredCalls.map((call) => (
              <tr key={call.id} className="border-b border-border hover:bg-accent/50">
                <td className="py-3 text-foreground">{call.caller_name || 'Unknown'}</td>
                <td className="py-3 text-muted-foreground">{call.caller_phone}</td>
                <td className="py-3">
                  <Badge className="bg-gray-500/20 text-muted-foreground">
                    {call.call_type}
                  </Badge>
                </td>
                <td className="py-3">
                  <Badge className={getDirectionBadge(call.direction)}>
                    {call.direction}
                  </Badge>
                </td>
                <td className="py-3">
                  <Badge className={getStatusColor(call.status)}>
                    {call.status}
                  </Badge>
                </td>
                <td className="py-3 text-muted-foreground">
                  {formatDuration(call.duration_seconds)}
                </td>
                <td className="py-3 text-muted-foreground">
                  {format(new Date(call.created_at), 'MMM d, h:mm a')}
                </td>
                <td className="py-3">
                  {call.recording_url ? (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(call.recording_url!, '_blank')}
                      >
                        <Play size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        asChild
                      >
                        <a href={call.recording_url} download>
                          <Download size={14} />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
