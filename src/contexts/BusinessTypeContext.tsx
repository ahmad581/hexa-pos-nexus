import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  category: string;
  features: string[];
  terminology: {
    branch: string;
    branches: string;
    unit: string;
    units: string;
    customer: string;
    customers: string;
    service: string;
    services: string;
  };
}

interface BusinessTypeContextType {
  businessTypes: BusinessType[];
  selectedBusinessType: BusinessType | null;
}

const BusinessTypeContext = createContext<BusinessTypeContextType | undefined>(undefined);

export const useBusinessType = () => {
  const context = useContext(BusinessTypeContext);
  if (!context) {
    throw new Error('useBusinessType must be used within a BusinessTypeProvider');
  }
  return context;
};

const initialBusinessTypes: BusinessType[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: '🍽️',
    category: 'Food & Beverage',
    features: ['menu-management', 'table-reservations', 'delivery', 'pos'],
    terminology: {
      branch: 'Branch',
      branches: 'Branches',
      unit: 'Table',
      units: 'Tables',
      customer: 'Customer',
      customers: 'Customers',
      service: 'Menu Item',
      services: 'Menu Items'
    }
  },
  {
    id: 'hair-salon',
    name: 'Hair Salon',
    icon: '💇',
    category: 'Beauty & Wellness',
    features: ['appointment-booking', 'service-management', 'staff-scheduling', 'pos'],
    terminology: {
      branch: 'Salon',
      branches: 'Salons',
      unit: 'Chair',
      units: 'Chairs',
      customer: 'Client',
      customers: 'Clients',
      service: 'Service',
      services: 'Services'
    }
  },
  {
    id: 'retail-store',
    name: 'Retail Store',
    icon: '🛍️',
    category: 'Retail',
    features: ['inventory-management', 'pos', 'customer-loyalty', 'sales-tracking'],
    terminology: {
      branch: 'Store',
      branches: 'Stores',
      unit: 'Counter',
      units: 'Counters',
      customer: 'Customer',
      customers: 'Customers',
      service: 'Product',
      services: 'Products'
    }
  },
  {
    id: 'medical-clinic',
    name: 'Medical Clinic',
    icon: '🏥',
    category: 'Healthcare',
    features: ['appointment-booking', 'patient-management', 'billing', 'staff-scheduling'],
    terminology: {
      branch: 'Clinic',
      branches: 'Clinics',
      unit: 'Room',
      units: 'Rooms',
      customer: 'Patient',
      customers: 'Patients',
      service: 'Treatment',
      services: 'Treatments'
    }
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: '🏨',
    category: 'Hospitality',
    features: ['room-booking', 'guest-management', 'billing', 'concierge'],
    terminology: {
      branch: 'Property',
      branches: 'Properties',
      unit: 'Room',
      units: 'Rooms',
      customer: 'Guest',
      customers: 'Guests',
      service: 'Service',
      services: 'Services'
    }
  }
];

export const BusinessTypeProvider = ({ children }: { children: ReactNode }) => {
  const [businessTypes] = useState<BusinessType[]>(initialBusinessTypes);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const { businessType } = useAuth();

  useEffect(() => {
    if (businessType) {
      const businessTypeObj = businessTypes.find(bt => bt.id === businessType);
      setSelectedBusinessType(businessTypeObj || businessTypes[0]);
    }
  }, [businessType, businessTypes]);

  return (
    <BusinessTypeContext.Provider value={{
      businessTypes,
      selectedBusinessType
    }}>
      {children}
    </BusinessTypeContext.Provider>
  );
};
