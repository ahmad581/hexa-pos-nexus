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
    <Card className="bg-card border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No sessions recorded</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              {showEmployee && <TableHead className="text-muted-foreground">Employee</TableHead>}
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Login</TableHead>
              <TableHead className="text-muted-foreground">Logout</TableHead>
              <TableHead className="text-muted-foreground">Duration</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id} className="border-border">
                {showEmployee && (
                  <TableCell className="text-foreground">
                    {session.profile?.first_name} {session.profile?.last_name}
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground">
                  {formatDate(session.login_time)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTime(session.login_time)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {session.logout_time ? formatTime(session.logout_time) : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground font-mono">
                  {formatDuration(session.session_duration_seconds)}
                </TableCell>
                <TableCell>
                  {session.logout_time ? (
                    <Badge variant="secondary" className="bg-secondary text-muted-foreground">
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
