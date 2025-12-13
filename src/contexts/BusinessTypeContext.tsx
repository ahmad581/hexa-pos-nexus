import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useBusinessTypes, BusinessType } from '@/hooks/useBusinessTypes';

interface BusinessTypeContextType {
  businessTypes: BusinessType[];
  selectedBusinessType: BusinessType | null;
  isLoading: boolean;
}

const BusinessTypeContext = createContext<BusinessTypeContextType | undefined>(undefined);

export const useBusinessType = () => {
  const context = useContext(BusinessTypeContext);
  if (!context) {
    throw new Error('useBusinessType must be used within a BusinessTypeProvider');
  }
  return context;
};

export const BusinessTypeProvider = ({ children }: { children: ReactNode }) => {
  const { businessTypes, isLoading } = useBusinessTypes();
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const { businessType } = useAuth();

  useEffect(() => {
    if (businessType && businessTypes.length > 0) {
      const businessTypeObj = businessTypes.find(bt => bt.id === businessType);
      setSelectedBusinessType(businessTypeObj || null);
    } else {
      setSelectedBusinessType(null);
    }
  }, [businessType, businessTypes]);

  return (
    <BusinessTypeContext.Provider value={{
      businessTypes,
      selectedBusinessType,
      isLoading
    }}>
      {children}
    </BusinessTypeContext.Provider>
  );
};

// Re-export the BusinessType interface for backward compatibility
export type { BusinessType } from '@/hooks/useBusinessTypes';
