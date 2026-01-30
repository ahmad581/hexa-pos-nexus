import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, User, Search, AlertCircle, Clock } from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCallCenter } from "@/hooks/useCallCenter";
import { useCallCenterSession } from "@/hooks/useCallCenterSession";
import { CallCenterStats } from "@/components/call-center/CallCenterStats";
import { CallQueueCard } from "@/components/call-center/CallQueueCard";
import { CallHistoryTable } from "@/components/call-center/CallHistoryTable";
import { TransferDialog } from "@/components/call-center/TransferDialog";
import { CallCenterSessionCard } from "@/components/call-center/CallCenterSessionCard";
import { CallCenterSessionHistory } from "@/components/call-center/CallCenterSessionHistory";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CallCenter = () => {
  const { selectedBranch } = useBranch();
  const { selectedBusinessType } = useBusinessType();
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [transferCallId, setTransferCallId] = useState<string | null>(null);

  const {
    callQueue,
    callHistory,
    employeeExtensions,
    callCenterNumber,
    stats,
    isLoading,
    realtimeEnabled,
    answerCall,
    holdCall,
    transferCall,
    endCall,
    updateAvailability,
    isAnswering,
    isHolding,
    isEnding,
  } = useCallCenter();

  const {
    todaySessions,
    allSessions,
    currentOpenSession,
    todayTotalHours,
    todayTotalMinutes,
    isCheckedIn,
    isCheckingIn,
    isCheckingOut,
    checkIn,
    checkOut,
    manualCheckIn,
    isCallCenterEmployee,
  } = useCallCenterSession();

  // Auto check-in when the page loads for call center employees
  useEffect(() => {
    checkIn();
  }, [checkIn]);

  // Find current user's extension
  const myExtension = employeeExtensions.find(
    (ext) => ext.profile_id === userProfile?.id
  );

  const handleTransfer = (profileId: string) => {
    if (transferCallId) {
      transferCall({ callId: transferCallId, transferToProfileId: profileId });
      setTransferCallId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('callCenter.pageTitle')}</h1>
          <p className="text-gray-400">
            {t('callCenter.manageCalls')} {selectedBranch?.name || 'All Locations'} - {selectedBusinessType?.name || 'Business'}
          </p>
        </div>
        
        {/* Agent Status & Extension */}
        <div className="flex items-center space-x-4">
          {callCenterNumber && (
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
              <Phone size={16} className="text-primary" />
              <span className="text-gray-300 text-sm">Business Line:</span>
              <span className="text-white font-medium">{callCenterNumber.phone_number}</span>
            </div>
          )}
          
          {myExtension && (
            <div className="flex items-center space-x-4 bg-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm">Ext:</span>
                <span className="text-white font-medium">{myExtension.extension_number}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Available</span>
                <Switch
                  checked={myExtension.is_available}
                  onCheckedChange={(checked) => updateAvailability(checked)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* No Call Center Number Warning */}
      {!callCenterNumber && (
        <Alert className="bg-yellow-500/10 border-yellow-500/50">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            No call center number configured for your business. Contact your SystemMaster to set up a phone number.
          </AlertDescription>
        </Alert>
      )}

      {/* Session Tracking for Call Center Employees */}
      {isCallCenterEmployee && (
        <CallCenterSessionCard
          isCheckedIn={isCheckedIn}
          loginTime={currentOpenSession?.login_time}
          todayTotalHours={todayTotalHours}
          todayTotalMinutes={todayTotalMinutes}
          sessionCount={todaySessions.length}
          onCheckIn={manualCheckIn}
          onCheckOut={checkOut}
          isCheckingIn={isCheckingIn}
          isCheckingOut={isCheckingOut}
        />
      )}

      {/* Stats */}
      <CallCenterStats
        activeCalls={stats.activeCalls}
        ringingCalls={stats.ringingCalls}
        onHoldCalls={stats.onHoldCalls}
        totalCallsToday={stats.totalCallsToday}
        realtimeEnabled={realtimeEnabled}
      />

      {/* Active Call Queue */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{t('callCenter.incomingCalls')}</h3>
          <Badge className={realtimeEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
            {realtimeEnabled ? '● Live' : '○ Polling'}
          </Badge>
        </div>
        
        {callQueue.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Phone size={48} className="mx-auto mb-4 opacity-50" />
            <p>No active calls in queue</p>
            <p className="text-sm mt-2">Incoming calls will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {callQueue.map((call) => (
              <CallQueueCard
                key={call.id}
                call={call}
                onAnswer={answerCall}
                onHold={holdCall}
                onEnd={(id) => endCall({ callId: id })}
                onTransfer={(id) => setTransferCallId(id)}
                isAnswering={isAnswering}
                isHolding={isHolding}
                isEnding={isEnding}
                currentUserId={userProfile?.id}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Available Agents */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Available Agents</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {employeeExtensions.map((ext) => (
            <div
              key={ext.id}
              className={`p-3 rounded-lg ${
                ext.is_available ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${ext.is_available ? 'bg-green-500' : 'bg-gray-500'}`} />
                <div>
                  <p className="text-sm font-medium text-white">
                    {ext.profile?.first_name} {ext.profile?.last_name?.[0]}.
                  </p>
                  <p className="text-xs text-gray-400">Ext: {ext.extension_number}</p>
                </div>
              </div>
            </div>
          ))}
          {employeeExtensions.length === 0 && (
            <div className="col-span-full text-center py-4 text-gray-400">
              No call center agents configured
            </div>
          )}
        </div>
      </Card>

      {/* Call History and Sessions */}
      <Tabs defaultValue="calls" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="calls" className="data-[state=active]:bg-gray-700">
            Call History
          </TabsTrigger>
          {isCallCenterEmployee && (
            <TabsTrigger value="sessions" className="data-[state=active]:bg-gray-700">
              <Clock className="h-4 w-4 mr-2" />
              My Sessions
            </TabsTrigger>
          )}
          {!isCallCenterEmployee && (
            <TabsTrigger value="all-sessions" className="data-[state=active]:bg-gray-700">
              <Clock className="h-4 w-4 mr-2" />
              Agent Sessions
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="calls" className="mt-4">
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{t('callCenter.recentCalls')}</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder={t('callCenter.searchCalls')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            <CallHistoryTable calls={callHistory} searchTerm={searchTerm} />
          </Card>
        </TabsContent>

        {isCallCenterEmployee && (
          <TabsContent value="sessions" className="mt-4">
            <CallCenterSessionHistory 
              sessions={todaySessions} 
              title="Today's Work Sessions"
            />
          </TabsContent>
        )}

        {!isCallCenterEmployee && (
          <TabsContent value="all-sessions" className="mt-4">
            <CallCenterSessionHistory 
              sessions={allSessions} 
              showEmployee 
              title="Agent Login Sessions"
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={!!transferCallId}
        onClose={() => setTransferCallId(null)}
        onTransfer={handleTransfer}
        extensions={employeeExtensions}
        currentUserId={userProfile?.id}
      />
    </div>
  );
};
