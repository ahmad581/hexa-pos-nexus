import { useAuth } from "@/contexts/AuthContext";

type UserRole = 'SystemMaster' | 'SuperManager' | 'Manager' | 'Cashier' | 'HallManager' | 'HrManager' | 'CallCenterEmp' | 'Employee';

export const useRole = () => {
  const { primaryRole, userRoles, hasRole } = useAuth();

  const checkRole = (role: UserRole, branchId?: string): boolean => {
    return hasRole(role, branchId);
  };

  const checkMultipleRoles = (roles: UserRole[], branchId?: string): boolean => {
    return roles.some(role => hasRole(role, branchId));
  };

  // Individual role checks
  const isSystemMaster = (): boolean => checkRole('SystemMaster');
  const isSuperManager = (branchId?: string): boolean => checkRole('SuperManager', branchId);
  const isManager = (branchId?: string): boolean => checkRole('Manager', branchId);
  const isCashier = (branchId?: string): boolean => checkRole('Cashier', branchId);
  const isHallManager = (branchId?: string): boolean => checkRole('HallManager', branchId);
  const isHrManager = (branchId?: string): boolean => checkRole('HrManager', branchId);
  const isCallCenterEmp = (branchId?: string): boolean => checkRole('CallCenterEmp', branchId);
  const isEmployee = (branchId?: string): boolean => checkRole('Employee', branchId);

  // Permission-based checks
  const canAccessBusinessManagement = (): boolean => {
    return isSystemMaster();
  };

  const canManageUsers = (branchId?: string): boolean => {
    return isSystemMaster() || checkMultipleRoles(['SuperManager', 'Manager', 'HrManager'], branchId);
  };

  const canViewAnalytics = (branchId?: string): boolean => {
    return isSystemMaster() || checkMultipleRoles(['SuperManager'], branchId);
  };

  const canManageInventory = (branchId?: string): boolean => {
    return isSystemMaster() || checkMultipleRoles(['SuperManager', 'Manager', 'HallManager'], branchId);
  };

  const canAccessMenu = (branchId?: string): boolean => {
    return isSystemMaster() || checkMultipleRoles(['SuperManager', 'Manager', 'Cashier', 'HallManager', 'CallCenterEmp'], branchId);
  };

  const canHandleOrders = (branchId?: string): boolean => {
    return isSystemMaster() || checkMultipleRoles(['SuperManager', 'Manager', 'Cashier', 'CallCenterEmp'], branchId);
  };

  const canAccessTables = (branchId?: string): boolean => {
    return isSystemMaster() || checkMultipleRoles(['SuperManager', 'Manager', 'Cashier', 'HallManager', 'CallCenterEmp'], branchId);
  };

  const canHandleCalls = (branchId?: string): boolean => {
    return isSystemMaster() || checkMultipleRoles(['SuperManager', 'Manager', 'CallCenterEmp'], branchId);
  };

  const canAccessEmployees = (branchId?: string): boolean => {
    return isSystemMaster() || checkMultipleRoles(['SuperManager', 'Manager', 'HrManager'], branchId);
  };

  const canOnlyCheckInOut = (branchId?: string): boolean => {
    return isEmployee(branchId) && !checkMultipleRoles(['SystemMaster', 'SuperManager', 'Manager', 'Cashier', 'HallManager', 'HrManager', 'CallCenterEmp'], branchId);
  };

  return {
    primaryRole,
    userRoles,
    checkRole,
    checkMultipleRoles,
    isSystemMaster,
    isSuperManager,
    isManager,
    isCashier,
    isHallManager,
    isHrManager,
    isCallCenterEmp,
    isEmployee,
    canAccessBusinessManagement,
    canManageUsers,
    canViewAnalytics,
    canManageInventory,
    canAccessMenu,
    canHandleOrders,
    canAccessTables,
    canHandleCalls,
    canAccessEmployees,
    canOnlyCheckInOut,
  };
};