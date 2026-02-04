
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
  businessName: string | null;
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

// Helper to fetch business details from database
const fetchBusinessDetails = async (businessId: string): Promise<{ type: string | null; name: string | null }> => {
  try {
    const { data: business, error } = await supabase
      .from("custom_businesses")
      .select("business_type, name")
      .eq("id", businessId)
      .single();

    if (error) {
      // Common when RLS prevents access or the row doesn't exist.
      return { type: null, name: null };
    }

    return { 
      type: business?.business_type || null, 
      name: business?.name || null 
    };
  } catch (error) {
    console.error("Error fetching business details:", error);
    return { type: null, name: null };
  }
};

// Fallback: infer business type from branch (branches.business_type)
const fetchBusinessTypeFromBranch = async (branchId: string): Promise<string | null> => {
  try {
    const { data: branch, error } = await supabase
      .from("branches")
      .select("business_type")
      .eq("id", branchId)
      .single();

    if (error) {
      return null;
    }

    return branch?.business_type || null;
  } catch (error) {
    console.error("Error fetching business type from branch:", error);
    return null;
  }
};

// Helper to fetch business type by user email (for demo/local fallback)
const fetchBusinessTypeByEmail = async (email: string): Promise<{ type: string | null; name: string | null }> => {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("business_id, branch_id")
      .eq("email", email)
      .single();

    if (error || !profile) return { type: null, name: null };

    if (profile.business_id) {
      const fromBusiness = await fetchBusinessDetails(profile.business_id);
      if (fromBusiness.type) return fromBusiness;
    }

    if (profile.branch_id) {
      const bType = await fetchBusinessTypeFromBranch(profile.branch_id);
      return { type: bType, name: null };
    }

    return { type: null, name: null };
  } catch (error) {
    console.error("Error fetching business type by email:", error);
    return { type: null, name: null };
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
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
        
        // Fetch the actual business details.
        // Note: Cashier/test users may not have SELECT access to custom_businesses due to RLS,
        // so we fall back to branches.business_type.
        if (profile.business_id) {
          const details = await fetchBusinessDetails(profile.business_id);
          if (details.type) {
            setBusinessType(details.type);
            localStorage.setItem("businessType", details.type);
          } else if (profile.branch_id) {
            const bType = await fetchBusinessTypeFromBranch(profile.branch_id);
            if (bType) {
              setBusinessType(bType);
              localStorage.setItem("businessType", bType);
            }
          }
          if (details.name) {
            setBusinessName(details.name);
            localStorage.setItem("businessName", details.name);
          }
        } else if (profile.branch_id) {
          const bType = await fetchBusinessTypeFromBranch(profile.branch_id);
          if (bType) {
            setBusinessType(bType);
            localStorage.setItem("businessType", bType);
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
        // Business type will be fetched in fetchUserData
        fetchUserData(session.user.id);
      } else {
        console.log('AuthProvider: No initial session found');
        // Fallback to localStorage for existing sessions
        const authenticated = localStorage.getItem("isAuthenticated") === "true";
        const email = localStorage.getItem("userEmail");
        const storedBusinessType = localStorage.getItem("businessType");
        
        if (authenticated && email) {
          console.log('AuthProvider: Using localStorage fallback', email);
          setIsAuthenticated(authenticated);
          setUserEmail(email);
          
          // Use stored business type/name or fetch from DB
          if (storedBusinessType) {
            setBusinessType(storedBusinessType);
          }
          const storedBusinessName = localStorage.getItem("businessName");
          if (storedBusinessName) {
            setBusinessName(storedBusinessName);
          }
          
          if (!storedBusinessType) {
            // Fetch from database
            fetchBusinessTypeByEmail(email).then(details => {
              if (details.type) {
                setBusinessType(details.type);
                localStorage.setItem("businessType", details.type);
              }
              if (details.name) {
                setBusinessName(details.name);
                localStorage.setItem("businessName", details.name);
              }
            });
          }
          
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
        // Defer Supabase calls to avoid auth deadlocks.
        setTimeout(() => {
          fetchUserData(session.user.id);
        }, 0);

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
        
        // Fetch the actual business details (with branch fallback for RLS)
        if (profile.business_id) {
          const details = await fetchBusinessDetails(profile.business_id);
          if (details.type) {
            setBusinessType(details.type);
            localStorage.setItem("businessType", details.type);
          } else if (profile.branch_id) {
            const bType = await fetchBusinessTypeFromBranch(profile.branch_id);
            if (bType) {
              setBusinessType(bType);
              localStorage.setItem("businessType", bType);
            }
          }
          if (details.name) {
            setBusinessName(details.name);
            localStorage.setItem("businessName", details.name);
          }
        } else if (profile.branch_id) {
          const bType = await fetchBusinessTypeFromBranch(profile.branch_id);
          if (bType) {
            setBusinessType(bType);
            localStorage.setItem("businessType", bType);
          }
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
        
        // Store in localStorage as fallback
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userBranchId", profile.branch_id || '');
      } else {
        // User not found in database - this is an error for demo login
        console.error('AuthProvider: User not found in database', email);
        throw new Error('User not found. Please check your email address.');
      }
      
      // Set authentication state
      setIsAuthenticated(true);
      setUserEmail(email);
      
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
    setBusinessName(null);
    setUserProfile(null);
    setUserBranchId(null);
    setUser(null);
    setUserRoles([]);
    setPrimaryRole(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("businessType");
    localStorage.removeItem("businessName");
    localStorage.removeItem("userBranchId");
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userEmail, 
      businessType,
      businessName, 
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
