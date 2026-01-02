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
  refetchBranches: () => Promise<void>;
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

  const fetchBranches = async () => {
    try {
      setLoading(true);
      
      // First get the current user's profile to find their business_id
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setBranches([]);
        setSelectedBranchState(null);
        setLoading(false);
        return;
      }

      // Get user's profile to find their business_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_id, is_super_admin')
        .eq('user_id', user.id)
        .maybeSingle();

      let query = supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });

      // If user has a business_id, filter by it (unless they're super admin)
      if (profile?.business_id && !profile?.is_super_admin) {
        query = query.eq('business_id', profile.business_id);
      }

      const { data, error } = await query;
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

  // Load branches from Supabase on mount and when auth state changes
  useEffect(() => {
    fetchBranches();

    // Listen for auth state changes to refetch branches
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        fetchBranches();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setSelectedBranch = (branch: Branch) => {
    setSelectedBranchState(branch);
    // Persist for other contexts/hooks (e.g., useInventory)
    localStorage.setItem('userBranchId', branch.id);
  };

  const value = useMemo(
    () => ({ branches, selectedBranch, setSelectedBranch, loading, refetchBranches: fetchBranches }),
    [branches, selectedBranch, loading]
  );

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};
