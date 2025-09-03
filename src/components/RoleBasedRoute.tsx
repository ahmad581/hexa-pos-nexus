import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = 'SuperManager' | 'Manager' | 'Cashier' | 'HallManager' | 'HrManager' | 'CallCenterEmp' | 'Employee';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requireBranch?: string;
  fallbackPath?: string;
}

export const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  requireBranch,
  fallbackPath = "/" 
}: RoleBasedRouteProps) => {
  const { isAuthenticated, hasRole, primaryRole, userBranchId } = useAuth();

  // Must be authenticated first
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => hasRole(role, requireBranch));

  // SuperManager can access everything
  const isSuperManager = hasRole('SuperManager');

  if (!hasAllowedRole && !isSuperManager) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If branch is required, check if user is in the correct branch
  if (requireBranch && userBranchId !== requireBranch && !isSuperManager) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};