
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';

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
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
        if (session.user.email) {
          setBusinessType(getBusinessTypeFromEmail(session.user.email));
        }
      } else {
        // Check localStorage and create demo user if needed
        const authenticated = localStorage.getItem("isAuthenticated") === "true";
        const email = localStorage.getItem("userEmail");
        const branchId = localStorage.getItem("userBranchId");
        
        if (authenticated && email) {
          // Create demo user from localStorage
          const demoUser = { 
            id: `demo-${email.replace(/[^a-zA-Z0-9]/g, '-')}`, 
            email,
            user_metadata: {},
            app_metadata: {}
          } as User;
          
          setUser(demoUser);
          setIsAuthenticated(authenticated);
          setUserEmail(email);
          setUserBranchId(branchId);
          if (email) {
            setBusinessType(getBusinessTypeFromEmail(email));
          }
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
        if (session.user.email) {
          setBusinessType(getBusinessTypeFromEmail(session.user.email));
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserEmail(null);
        setBusinessType(null);
        setUserProfile(null);
        setUserBranchId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string) => {
    try {
      // For demo purposes, sign in with magic link or create a temp user
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        // Fallback to localStorage for demo
        const businessTypeFromEmail = getBusinessTypeFromEmail(email);
        setIsAuthenticated(true);
        setUserEmail(email);
        setBusinessType(businessTypeFromEmail);
        
        // Create a mock user ID for demo
        const mockUser = { 
          id: `demo-${email.replace(/[^a-zA-Z0-9]/g, '-')}`, 
          email,
          user_metadata: {},
          app_metadata: {}
        } as User;
        setUser(mockUser);
        
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("businessType", businessTypeFromEmail);
        return;
      }

      // If OTP was sent, create a demo session for immediate access
      const demoUser = { 
        id: `demo-${email.replace(/[^a-zA-Z0-9]/g, '-')}`, 
        email,
        user_metadata: {},
        app_metadata: {}
      } as User;
      
      setUser(demoUser);
      setIsAuthenticated(true);
      setUserEmail(email);
      setBusinessType(getBusinessTypeFromEmail(email));
      
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("businessType", getBusinessTypeFromEmail(email));
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
      user,
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
