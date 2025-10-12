import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Branch {
  id: string; // matches public.branches.id (text)
  name: string;
  address: string;
  phone: string | null;
  isActive: boolean;
}

interface BranchContextType {
  branches: Branch[];
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch) => void;
  loading: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }: { children: ReactNode }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranchState] = useState<Branch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load branches from Supabase
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('name', { ascending: true });
        if (error) throw error;

        const normalized: Branch[] = (data || []).map((b: any) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          phone: b.phone ?? null,
          isActive: b.is_active ?? true,
        }));
        setBranches(normalized);

        // Initialize selection from localStorage or first active branch
        const storedId = localStorage.getItem('userBranchId');
        const initial = normalized.find(b => b.id === storedId) || normalized.find(b => b.isActive) || null;
        if (initial) setSelectedBranchState(initial);
      } catch (e) {
        console.error('Failed to load branches', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const setSelectedBranch = (branch: Branch) => {
    setSelectedBranchState(branch);
    // Persist for other contexts/hooks (e.g., useInventory)
    localStorage.setItem('userBranchId', branch.id);
  };

  const value = useMemo(
    () => ({ branches, selectedBranch, setSelectedBranch, loading }),
    [branches, selectedBranch, loading]
  );

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};
