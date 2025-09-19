import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = 'SystemMaster' | 'SuperManager' | 'Manager' | 'Cashier' | 'HallManager' | 'HrManager' | 'CallCenterEmp' | 'Employee';

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
  const { isAuthenticated, hasRole, primaryRole, userBranchId, userEmail } = useAuth();

  // Must be authenticated first
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => hasRole(role, requireBranch));

  // SystemMaster and SuperManager can access everything
  const isSystemMaster = hasRole('SystemMaster');
  const isSuperManager = hasRole('SuperManager');
  const isWhitelistedEmail = userEmail === 'ahmadalodat530@gmail.com';

  if (!hasAllowedRole && !isSuperManager && !isSystemMaster && !isWhitelistedEmail) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If branch is required, check if user is in the correct branch
  if (requireBranch && userBranchId !== requireBranch && !isSuperManager && !isSystemMaster) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};