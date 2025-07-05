
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch) => void;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

const initialBranches: Branch[] = [
  { id: '1', name: 'Downtown Branch', address: '123 Main St, Downtown', phone: '+1 (555) 123-4567', isActive: true },
  { id: '2', name: 'Mall Branch', address: '456 Shopping Center, Mall', phone: '+1 (555) 234-5678', isActive: true },
  { id: '3', name: 'Airport Branch', address: '789 Terminal Rd, Airport', phone: '+1 (555) 345-6789', isActive: true },
  { id: '4', name: 'University Branch', address: '321 Campus Ave, University', phone: '+1 (555) 456-7890', isActive: true },
  { id: '5', name: 'Beachside Branch', address: '654 Ocean Blvd, Beach', phone: '+1 (555) 567-8901', isActive: false }
];

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [branches] = useState<Branch[]>(initialBranches);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(branches[0]);

  return (
    <BranchContext.Provider value={{
      branches,
      selectedBranch,
      setSelectedBranch
    }}>
      {children}
    </BranchContext.Provider>
  );
};
