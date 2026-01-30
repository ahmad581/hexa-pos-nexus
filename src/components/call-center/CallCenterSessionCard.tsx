import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, LogIn, LogOut, Timer } from 'lucide-react';

interface CallCenterSessionCardProps {
  isCheckedIn: boolean;
  loginTime?: string;
  todayTotalHours: number;
  todayTotalMinutes: number;
  sessionCount: number;
  onCheckIn: () => void;
  onCheckOut: () => void;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
}

export const CallCenterSessionCard = ({
  isCheckedIn,
  loginTime,
  todayTotalHours,
  todayTotalMinutes,
  sessionCount,
  onCheckIn,
  onCheckOut,
  isCheckingIn,
  isCheckingOut,
}: CallCenterSessionCardProps) => {
  const [currentDuration, setCurrentDuration] = useState('0:00:00');

  // Update current session duration every second
  useEffect(() => {
    if (!isCheckedIn || !loginTime) {
      setCurrentDuration('0:00:00');
      return;
    }

    const updateDuration = () => {
      const start = new Date(loginTime);
      const now = new Date();
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      setCurrentDuration(
        `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [isCheckedIn, loginTime]);

  return (
    <Card className="bg-gray-800 border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Current Session Status */}
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isCheckedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <div>
              <p className="text-sm text-gray-400">Current Session</p>
              <p className="text-2xl font-bold text-white font-mono">{currentDuration}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-12 w-px bg-gray-700" />

          {/* Today's Total */}
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-400">Today's Total</p>
              <p className="text-lg font-semibold text-white">
                {todayTotalHours}h {todayTotalMinutes}m
              </p>
            </div>
          </div>

          {/* Session Count */}
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Sessions Today</p>
              <p className="text-lg font-semibold text-white">{sessionCount}</p>
            </div>
          </div>
        </div>

        {/* Check In/Out Button */}
        <div className="flex items-center gap-4">
          <Badge className={isCheckedIn ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
            {isCheckedIn ? 'Active' : 'Inactive'}
          </Badge>
          
          {isCheckedIn ? (
            <Button
              variant="destructive"
              onClick={onCheckOut}
              disabled={isCheckingOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isCheckingOut ? 'Checking Out...' : 'Check Out'}
            </Button>
          ) : (
            <Button
              onClick={onCheckIn}
              disabled={isCheckingIn}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <LogIn className="h-4 w-4" />
              {isCheckingIn ? 'Checking In...' : 'Check In'}
            </Button>
          )}
        </div>
      </div>

      {/* Session start time */}
      {isCheckedIn && loginTime && (
        <p className="text-xs text-gray-500 mt-3">
          Session started at {new Date(loginTime).toLocaleTimeString()}
        </p>
      )}
    </Card>
  );
};
