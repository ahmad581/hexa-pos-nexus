
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting unauthenticated user to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('ProtectedRoute: Allowing authenticated user through');
  return <>{children}</>;
};
