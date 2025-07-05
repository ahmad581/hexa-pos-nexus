
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  businessType: string | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getBusinessTypeFromEmail = (email: string): string => {
  if (email.startsWith('restaurant@') || email.includes('restaurant')) return 'restaurant';
  if (email.startsWith('hotel@') || email.includes('hotel')) return 'hotel';
  if (email.startsWith('salon@') || email.includes('salon')) return 'hair-salon';
  if (email.startsWith('clinic@') || email.includes('clinic')) return 'medical-clinic';
  if (email.startsWith('retail@') || email.includes('retail')) return 'retail-store';
  return 'restaurant'; // default
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<string | null>(null);

  useEffect(() => {
    const authenticated = localStorage.getItem("isAuthenticated") === "true";
    const email = localStorage.getItem("userEmail");
    setIsAuthenticated(authenticated);
    setUserEmail(email);
    if (email) {
      setBusinessType(getBusinessTypeFromEmail(email));
    }
  }, []);

  const login = (email: string) => {
    const businessTypeFromEmail = getBusinessTypeFromEmail(email);
    setIsAuthenticated(true);
    setUserEmail(email);
    setBusinessType(businessTypeFromEmail);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", email);
    localStorage.setItem("businessType", businessTypeFromEmail);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setBusinessType(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("businessType");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, businessType, login, logout }}>
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
