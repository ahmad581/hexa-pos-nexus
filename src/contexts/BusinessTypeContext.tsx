
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
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: '💊',
    category: 'Healthcare',
    features: ['prescription-management', 'inventory-tracking', 'billing', 'customer-records'],
    terminology: {
      branch: 'Pharmacy',
      branches: 'Pharmacies',
      unit: 'Counter',
      units: 'Counters',
      customer: 'Patient',
      customers: 'Patients',
      service: 'Prescription',
      services: 'Prescriptions'
    }
  },
  {
    id: 'grocery',
    name: 'Grocery Store',
    icon: '🛒',
    category: 'Retail',
    features: ['inventory-management', 'pos', 'fresh-produce-tracking', 'supplier-management'],
    terminology: {
      branch: 'Store',
      branches: 'Stores',
      unit: 'Checkout',
      units: 'Checkouts',
      customer: 'Customer',
      customers: 'Customers',
      service: 'Product',
      services: 'Products'
    }
  },
  {
    id: 'gym',
    name: 'Gym & Fitness',
    icon: '💪',
    category: 'Health & Fitness',
    features: ['membership-management', 'class-scheduling', 'equipment-tracking', 'trainer-management'],
    terminology: {
      branch: 'Location',
      branches: 'Locations',
      unit: 'Station',
      units: 'Stations',
      customer: 'Member',
      customers: 'Members',
      service: 'Class',
      services: 'Classes'
    }
  },
  {
    id: 'auto-repair',
    name: 'Auto Repair',
    icon: '🔧',
    category: 'Automotive',
    features: ['service-scheduling', 'parts-inventory', 'customer-vehicles', 'billing'],
    terminology: {
      branch: 'Shop',
      branches: 'Shops',
      unit: 'Bay',
      units: 'Bays',
      customer: 'Customer',
      customers: 'Customers',
      service: 'Service',
      services: 'Services'
    }
  },
  {
    id: 'pet-care',
    name: 'Pet Care',
    icon: '🐾',
    category: 'Pet Services',
    features: ['appointment-booking', 'pet-records', 'service-management', 'billing'],
    terminology: {
      branch: 'Clinic',
      branches: 'Clinics',
      unit: 'Room',
      units: 'Rooms',
      customer: 'Pet Owner',
      customers: 'Pet Owners',
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
