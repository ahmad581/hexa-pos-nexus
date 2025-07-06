
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CallInfo {
  customerName: string;
  phoneNumber: string;
  address?: string;
  branchId: string;
}

interface CallContextType {
  activeCallInfo: CallInfo | null;
  setActiveCallInfo: (info: CallInfo | null) => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};

export const CallProvider = ({ children }: { children: ReactNode }) => {
  const [activeCallInfo, setActiveCallInfo] = useState<CallInfo | null>(null);

  const endCall = () => {
    setActiveCallInfo(null);
  };

  return (
    <CallContext.Provider value={{
      activeCallInfo,
      setActiveCallInfo,
      endCall
    }}>
      {children}
    </CallContext.Provider>
  );
};
