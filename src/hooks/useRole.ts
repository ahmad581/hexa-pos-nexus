import { useAuth } from "@/contexts/AuthContext";

type UserRole = 'SuperManager' | 'Manager' | 'Cashier' | 'HallManager' | 'HrManager' | 'CallCenterEmp' | 'Employee';

export const useRole = () => {
  const { hasRole, primaryRole, userRoles } = useAuth();

  const checkRole = (role: UserRole, branchId?: string): boolean => {
    return hasRole(role, branchId);
  };

  const checkMultipleRoles = (roles: UserRole[], branchId?: string): boolean => {
    return roles.some(role => hasRole(role, branchId));
  };

  const isSuperManager = (): boolean => hasRole('SuperManager');
  const isManager = (branchId?: string): boolean => hasRole('Manager', branchId);
  const isHrManager = (branchId?: string): boolean => hasRole('HrManager', branchId);
  const isHallManager = (branchId?: string): boolean => hasRole('HallManager', branchId);
  const isCashier = (branchId?: string): boolean => hasRole('Cashier', branchId);
  const isCallCenterEmp = (branchId?: string): boolean => hasRole('CallCenterEmp', branchId);
  const isEmployee = (branchId?: string): boolean => hasRole('Employee', branchId);

  // Check if user can manage other users (SuperManager, Manager, HrManager)
  const canManageUsers = (branchId?: string): boolean => {
    return isSuperManager() || isManager(branchId) || isHrManager(branchId);
  };

  // Check if user can view analytics (SuperManager, Manager)
  const canViewAnalytics = (branchId?: string): boolean => {
    return isSuperManager() || isManager(branchId);
  };

  // Check if user can manage inventory (SuperManager, Manager, HallManager)
  const canManageInventory = (branchId?: string): boolean => {
    return isSuperManager() || isManager(branchId) || isHallManager(branchId);
  };

  // Check if user can handle orders (everyone except CallCenterEmp for direct orders)
  const canHandleOrders = (branchId?: string): boolean => {
    return isSuperManager() || isManager(branchId) || isCashier(branchId) || 
           isHallManager(branchId) || isEmployee(branchId);
  };

  // Check if user can handle calls (SuperManager, Manager, CallCenterEmp)
  const canHandleCalls = (branchId?: string): boolean => {
    return isSuperManager() || isManager(branchId) || isCallCenterEmp(branchId);
  };

  return {
    primaryRole,
    userRoles,
    checkRole,
    checkMultipleRoles,
    isSuperManager,
    isManager,
    isHrManager,
    isHallManager,
    isCashier,
    isCallCenterEmp,
    isEmployee,
    canManageUsers,
    canViewAnalytics,
    canManageInventory,
    canHandleOrders,
    canHandleCalls
  };
};