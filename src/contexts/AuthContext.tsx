
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from '@supabase/supabase-js';

type UserRole = 'SystemMaster' | 'SuperManager' | 'Manager' | 'Cashier' | 'HallManager' | 'HrManager' | 'CallCenterEmp' | 'Employee';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  branch_id: string | null;
  business_id: string | null;
  primary_role: UserRole | null;
  is_active: boolean;
}

interface UserRoleInfo {
  id: string;
  role: UserRole;
  branch_id: string | null;
  is_active: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  businessType: string | null;
  userProfile: UserProfile | null;
  userBranchId: string | null;
  user: User | null;
  userRoles: UserRoleInfo[];
  primaryRole: UserRole | null;
  hasRole: (role: UserRole, branchId?: string) => boolean;
  login: (email: string) => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [userRoles, setUserRoles] = useState<UserRoleInfo[]>([]);
  const [primaryRole, setPrimaryRole] = useState<UserRole | null>(null);

  // Fetch user profile and roles
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setUserProfile(profile);
        setUserBranchId(profile.branch_id);
        setPrimaryRole(profile.primary_role);
        
        // Fetch the actual business type from custom_businesses
        if (profile.business_id) {
          const { data: business } = await supabase
            .from('custom_businesses')
            .select('business_type')
            .eq('id', profile.business_id)
            .single();
          
          if (business?.business_type) {
            setBusinessType(business.business_type);
          }
        }
      }

      // Fetch user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (roles) {
        setUserRoles(roles);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const hasRole = (role: UserRole, branchId?: string): boolean => {
    // Check primary role first
    if (primaryRole === role) {
      return true;
    }
    
    // Then check user roles array
    return userRoles.some(userRole => 
      userRole.role === role && 
      userRole.is_active &&
      (!branchId || userRole.branch_id === branchId || userRole.branch_id === null)
    );
  };

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    // Check for existing auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session check', { session: !!session, user: !!session?.user });
      
      if (session?.user) {
        console.log('AuthProvider: Setting authenticated user', session.user.email);
        setUser(session.user);
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
        if (session.user.email) {
          setBusinessType(getBusinessTypeFromEmail(session.user.email));
        }
        fetchUserData(session.user.id);
      } else {
        console.log('AuthProvider: No initial session found');
        // Fallback to localStorage for existing sessions
        const authenticated = localStorage.getItem("isAuthenticated") === "true";
        const email = localStorage.getItem("userEmail");
        
        if (authenticated && email) {
          console.log('AuthProvider: Using localStorage fallback', email);
          setIsAuthenticated(authenticated);
          setUserEmail(email);
          setBusinessType(getBusinessTypeFromEmail(email));
          
          // Also restore branch ID from localStorage
          const storedBranchId = localStorage.getItem("userBranchId");
          if (storedBranchId) {
            setUserBranchId(storedBranchId);
          }
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthProvider: Auth state change', { event, session: !!session, user: !!session?.user });
      
      if (session?.user) {
        console.log('AuthProvider: User authenticated via state change', session.user.email);
        setUser(session.user);
        setIsAuthenticated(true);
        setUserEmail(session.user.email || null);
        if (session.user.email) {
          setBusinessType(getBusinessTypeFromEmail(session.user.email));
        }
        fetchUserData(session.user.id);
        // Clear localStorage fallback
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("businessType");
      } else {
        console.log('AuthProvider: User signed out via state change');
        setUser(null);
        setIsAuthenticated(false);
        setUserEmail(null);
        setBusinessType(null);
        setUserProfile(null);
        setUserBranchId(null);
        setUserRoles([]);
        setPrimaryRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string) => {
    try {
      // For production, use proper Supabase auth
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Auth error:', error);
        throw error;
      }

      // The auth state change will handle the rest
      return;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const demoLogin = async (email: string) => {
    try {
      console.log('AuthProvider: Demo login for', email);
      
      // First, try to fetch the actual user profile from the database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profile) {
        // User exists in database, use their actual data
        console.log('AuthProvider: Found existing profile for', email, 'with role:', profile.primary_role);
        setUserProfile(profile);
        setUserBranchId(profile.branch_id);
        setPrimaryRole(profile.primary_role);
        
        // Fetch the actual business type from custom_businesses
        if (profile.business_id) {
          const { data: business } = await supabase
            .from('custom_businesses')
            .select('business_type')
            .eq('id', profile.business_id)
            .single();
          
          if (business?.business_type) {
            setBusinessType(business.business_type);
            localStorage.setItem("businessType", business.business_type);
          } else {
            setBusinessType(getBusinessTypeFromEmail(email));
            localStorage.setItem("businessType", getBusinessTypeFromEmail(email));
          }
        } else {
          setBusinessType(getBusinessTypeFromEmail(email));
          localStorage.setItem("businessType", getBusinessTypeFromEmail(email));
        }
        
        // Fetch user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', profile.user_id)
          .eq('is_active', true);

        if (roles) {
          console.log('AuthProvider: Found roles for user', roles);
          setUserRoles(roles);
        }
      } else {
        // Fallback to demo profile for non-existing users
        console.log('AuthProvider: Creating demo profile for', email);
        const defaultBranchId = 'demo-branch-1';
        setUserBranchId(defaultBranchId);
        setBusinessType(getBusinessTypeFromEmail(email));
        
        const mockProfile: UserProfile = {
          id: 'demo-user-id',
          email: email,
          first_name: 'Demo',
          last_name: 'User',
          branch_id: defaultBranchId,
          business_id: null,
          primary_role: 'Manager',
          is_active: true
        };
        setUserProfile(mockProfile);
        setPrimaryRole('Manager');
        localStorage.setItem("businessType", getBusinessTypeFromEmail(email));
      }
      
      // Set authentication state
      setIsAuthenticated(true);
      setUserEmail(email);
      
      // Store in localStorage as fallback
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userBranchId", profile?.branch_id || 'demo-branch-1');
      
      console.log('AuthProvider: Demo login successful for', email);
    } catch (error) {
      console.error('Demo login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    setBusinessType(null);
    setUserProfile(null);
    setUserBranchId(null);
    setUser(null);
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
      userRoles,
      primaryRole,
      hasRole,
      login, 
      demoLogin,
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
