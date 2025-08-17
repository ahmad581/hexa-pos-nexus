
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  branch_id: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  businessType: string | null;
  userProfile: UserProfile | null;
  userBranchId: string | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getBusinessTypeFromEmail = (email: string): string => {
  if (email.startsWith('restaurant@') || email.includes('restaurant')) return 'restaurant';
  if (email.startsWith('hotel@') || email.includes('hotel')) return 'hotel';
  if (email.startsWith('salon@') || email.includes('salon')) return 'hair-salon';
  if (email.startsWith('clinic@') || email.includes('clinic')) return 'medical-clinic';
  if (email.startsWith('retail@') || email.includes('retail')) return 'retail-store';
  if (email.startsWith('pharmacy@') || email.includes('pharmacy')) return 'pharmacy';
  if (email.startsWith('grocery@') || email.includes('grocery')) return 'grocery';
  if (email.startsWith('gym@') || email.includes('gym')) return 'gym';
  if (email.startsWith('autorepair@') || email.includes('autorepair')) return 'auto-repair';
  if (email.startsWith('petcare@') || email.includes('petcare')) return 'pet-care';
  return 'restaurant'; // default
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userBranchId, setUserBranchId] = useState<string | null>(null);

  useEffect(() => {
    const authenticated = localStorage.getItem("isAuthenticated") === "true";
    const email = localStorage.getItem("userEmail");
    const branchId = localStorage.getItem("userBranchId");
    setIsAuthenticated(authenticated);
    setUserEmail(email);
    setUserBranchId(branchId);
    if (email) {
      setBusinessType(getBusinessTypeFromEmail(email));
    }
  }, []);

  const login = async (email: string) => {
    try {
      // Fetch user profile from database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !profile) {
        throw new Error('User not found or inactive');
      }

      const businessTypeFromEmail = getBusinessTypeFromEmail(email);
      setIsAuthenticated(true);
      setUserEmail(email);
      setBusinessType(businessTypeFromEmail);
      setUserProfile(profile);
      setUserBranchId(profile.branch_id);
      
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("businessType", businessTypeFromEmail);
      localStorage.setItem("userBranchId", profile.branch_id);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setBusinessType(null);
    setUserProfile(null);
    setUserBranchId(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("businessType");
    localStorage.removeItem("userBranchId");
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userEmail, 
      businessType, 
      userProfile, 
      userBranchId, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
