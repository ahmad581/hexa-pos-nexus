import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Calendar } from 'lucide-react';

interface Session {
  id: string;
  login_time: string;
  logout_time: string | null;
  session_duration_seconds: number | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface CallCenterSessionHistoryProps {
  sessions: Session[];
  showEmployee?: boolean;
  title?: string;
}

export const CallCenterSessionHistory = ({
  sessions,
  showEmployee = false,
  title = "Today's Sessions",
}: CallCenterSessionHistoryProps) => {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No sessions recorded</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              {showEmployee && <TableHead className="text-gray-400">Employee</TableHead>}
              <TableHead className="text-gray-400">Date</TableHead>
              <TableHead className="text-gray-400">Login</TableHead>
              <TableHead className="text-gray-400">Logout</TableHead>
              <TableHead className="text-gray-400">Duration</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id} className="border-gray-700">
                {showEmployee && (
                  <TableCell className="text-white">
                    {session.profile?.first_name} {session.profile?.last_name}
                  </TableCell>
                )}
                <TableCell className="text-gray-300">
                  {formatDate(session.login_time)}
                </TableCell>
                <TableCell className="text-gray-300">
                  {formatTime(session.login_time)}
                </TableCell>
                <TableCell className="text-gray-300">
                  {session.logout_time ? formatTime(session.logout_time) : '-'}
                </TableCell>
                <TableCell className="text-gray-300 font-mono">
                  {formatDuration(session.session_duration_seconds)}
                </TableCell>
                <TableCell>
                  {session.logout_time ? (
                    <Badge variant="secondary" className="bg-gray-600 text-gray-300">
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400">
                      Active
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};
