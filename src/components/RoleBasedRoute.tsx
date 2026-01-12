import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AccessDenied } from "@/components/AccessDenied";

type UserRole =
  | "SystemMaster"
  | "SuperManager"
  | "Manager"
  | "Cashier"
  | "HallManager"
  | "HrManager"
  | "CallCenterEmp"
  | "Employee";

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
  fallbackPath = "/",
}: RoleBasedRouteProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const { isAuthenticated, hasRole, userBranchId } = useAuth();

  // Must be authenticated first
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some((role) => hasRole(role, requireBranch));

  // SystemMaster and SuperManager can access everything
  const isSystemMaster = hasRole("SystemMaster");
  const isSuperManager = hasRole("SuperManager");

  // Prevent redirect loops: if we're already on the fallback path, render an access denied state.
  if (!hasAllowedRole && !isSuperManager && !isSystemMaster) {
    if (currentPath === fallbackPath) {
      return (
        <AccessDenied
          title="Access restricted"
          description="Your role doesn’t have access to this area."
        />
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  // If branch is required, check if user is in the correct branch
  if (
    requireBranch &&
    userBranchId !== requireBranch &&
    !isSuperManager &&
    !isSystemMaster
  ) {
    if (currentPath === fallbackPath) {
      return (
        <AccessDenied
          title="Wrong branch"
          description="This page is restricted to a different branch."
        />
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
