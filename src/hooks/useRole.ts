import { useAuth } from "@/contexts/AuthContext";
import { useHasPermission } from "@/hooks/usePermissions";

export const useRole = () => {
  const { primaryRole, userRoles, hasRole } = useAuth();
  const { hasPermission, permissions } = useHasPermission();

  const checkRole = (role: string, branchId?: string): boolean => {
    return hasRole(role as any, branchId);
  };

  const checkMultipleRoles = (roles: string[], branchId?: string): boolean => {
    return roles.some(role => hasRole(role as any, branchId));
  };

  // Individual role checks (legacy support + new permission-based)
  const isSystemMaster = (): boolean => checkRole('SystemMaster');
  const isSuperManager = (branchId?: string): boolean => checkRole('SuperManager', branchId);
  const isManager = (branchId?: string): boolean => checkRole('Manager', branchId);
  const isCashier = (branchId?: string): boolean => checkRole('Cashier', branchId);
  const isHallManager = (branchId?: string): boolean => checkRole('HallManager', branchId);
  const isHrManager = (branchId?: string): boolean => checkRole('HrManager', branchId);
  const isCallCenterEmp = (branchId?: string): boolean => checkRole('CallCenterEmp', branchId);
  const isEmployee = (branchId?: string): boolean => checkRole('Employee', branchId);

  // Permission-based checks (new dynamic system)
  const canAccessBusinessManagement = (): boolean => {
    return hasPermission('access_business_management') || isSystemMaster();
  };

  const canManageUsers = (branchId?: string): boolean => {
    return hasPermission('manage_users') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager', 'Manager', 'HrManager'], branchId);
  };

  const canViewAnalytics = (branchId?: string): boolean => {
    return hasPermission('view_analytics') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager'], branchId);
  };

  const canManageInventory = (branchId?: string): boolean => {
    return hasPermission('manage_inventory') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager', 'Manager', 'HallManager', 'Cashier'], branchId);
  };
  
  const canViewInventory = (branchId?: string): boolean => {
    return hasPermission('view_inventory') || 
           canManageInventory(branchId) ||
           checkRole('Cashier', branchId);
  };

  const canAccessMenu = (branchId?: string): boolean => {
    return hasPermission('access_menu') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager', 'Manager', 'Cashier', 'HallManager', 'CallCenterEmp'], branchId);
  };

  const canHandleOrders = (branchId?: string): boolean => {
    return hasPermission('handle_orders') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager', 'Manager', 'Cashier', 'CallCenterEmp'], branchId);
  };

  const canAccessTables = (branchId?: string): boolean => {
    return hasPermission('access_tables') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager', 'Manager', 'Cashier', 'HallManager', 'CallCenterEmp'], branchId);
  };

  const canHandleCalls = (branchId?: string): boolean => {
    return hasPermission('handle_calls') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager', 'Manager', 'CallCenterEmp'], branchId);
  };

  const canAccessEmployees = (branchId?: string): boolean => {
    return hasPermission('access_employees') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager', 'Manager', 'HrManager'], branchId);
  };

  const canManageRoles = (branchId?: string): boolean => {
    return hasPermission('manage_roles') || 
           isSystemMaster() || 
           checkMultipleRoles(['SuperManager'], branchId);
  };

  const canOnlyCheckInOut = (branchId?: string): boolean => {
    // User only has check_in_out permission and no other significant permissions
    const hasOnlyBasicPermission = permissions.length === 1 && permissions.includes('check_in_out');
    return hasOnlyBasicPermission || 
           (isEmployee(branchId) && !checkMultipleRoles(['SystemMaster', 'SuperManager', 'Manager', 'Cashier', 'HallManager', 'HrManager', 'CallCenterEmp'], branchId));
  };

  return {
    primaryRole,
    userRoles,
    checkRole,
    checkMultipleRoles,
    hasPermission,
    permissions,
    // Legacy role checks
    isSystemMaster,
    isSuperManager,
    isManager,
    isCashier,
    isHallManager,
    isHrManager,
    isCallCenterEmp,
    isEmployee,
    // Permission-based checks
    canAccessBusinessManagement,
    canManageUsers,
    canViewAnalytics,
    canManageInventory,
    canViewInventory,
    canAccessMenu,
    canHandleOrders,
    canAccessTables,
    canHandleCalls,
    canAccessEmployees,
    canManageRoles,
    canOnlyCheckInOut,
  };
};
