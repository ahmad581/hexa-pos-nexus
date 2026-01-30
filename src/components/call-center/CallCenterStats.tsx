import { Card } from "@/components/ui/card";
import { PhoneIncoming, PhoneCall, Phone, Clock, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface CallCenterStatsProps {
  activeCalls: number;
  ringingCalls: number;
  onHoldCalls: number;
  totalCallsToday: number;
  realtimeEnabled: boolean;
}

export const CallCenterStats = ({
  activeCalls,
  ringingCalls,
  onHoldCalls,
  totalCallsToday,
  realtimeEnabled,
}: CallCenterStatsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-400">{activeCalls}</div>
            <div className="text-gray-400 text-sm">{t('callCenter.activeCalls')}</div>
          </div>
          <PhoneCall className="text-green-400" size={24} />
        </div>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-yellow-400">{ringingCalls}</div>
            <div className="text-gray-400 text-sm">{t('callCenter.ringing')}</div>
          </div>
          <PhoneIncoming className="text-yellow-400 animate-pulse" size={24} />
        </div>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-400">{onHoldCalls}</div>
            <div className="text-gray-400 text-sm">On Hold</div>
          </div>
          <Clock className="text-blue-400" size={24} />
        </div>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-purple-400">{totalCallsToday}</div>
            <div className="text-gray-400 text-sm">{t('callCenter.callsToday')}</div>
          </div>
          <Phone className="text-purple-400" size={24} />
        </div>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${realtimeEnabled ? 'text-green-400' : 'text-red-400'}`}>
              {realtimeEnabled ? 'Live' : 'Offline'}
            </div>
            <div className="text-gray-400 text-sm">Real-time Status</div>
          </div>
          {realtimeEnabled ? (
            <Wifi className="text-green-400" size={24} />
          ) : (
            <WifiOff className="text-red-400" size={24} />
          )}
        </div>
      </Card>
    </div>
  );
};
