import { useAuth } from "@/contexts/AuthContext";
import { useBusinessFeatures } from "@/hooks/useBusinessFeatures";
import { useBranch } from "@/contexts/BranchContext";

export const useInventoryPermissions = () => {
  const { userProfile, primaryRole } = useAuth();
  const { hasFeatureAccess } = useBusinessFeatures();
  const { selectedBranch } = useBranch();

  // Check if the business has inventory feature enabled
  const hasInventoryFeature = (): boolean => {
    return hasFeatureAccess('inventory-management');
  };

  // Check if user is the business owner (created via create-client edge function)
  // The owner is identified as the user whose user_id matches custom_businesses.user_id
  const isBusinessOwner = (): boolean => {
    // SuperManager role is assigned to the client account created during create-client
    return primaryRole === 'SuperManager';
  };

  // SystemMaster has access to everything
  const isSystemMaster = (): boolean => {
    return primaryRole === 'SystemMaster';
  };

  // Full access: can add/edit/delete items, warehouses, categories, manage requests
  const hasFullAccess = (): boolean => {
    if (!hasInventoryFeature()) return false;
    return isSystemMaster() || isBusinessOwner();
  };

  // View-only access: can view inventory and request items
  const hasViewAccess = (): boolean => {
    if (!hasInventoryFeature()) return false;
    return true; // Anyone with feature access can view
  };

  // Cashier can only view and request items
  const isCashier = (): boolean => {
    return primaryRole === 'Cashier';
  };

  // Can add/edit/delete inventory items
  const canManageItems = (): boolean => {
    return hasFullAccess();
  };

  // Can add/edit/delete warehouses
  const canManageWarehouses = (): boolean => {
    return hasFullAccess();
  };

  // Can add/edit/delete categories (via items)
  const canManageCategories = (): boolean => {
    return hasFullAccess();
  };

  // Can request stock (cashiers can do this for their branch)
  const canRequestStock = (): boolean => {
    if (!hasInventoryFeature()) return false;
    return true; // Anyone with inventory access can request stock
  };

  // Can approve/reject requests
  const canManageRequests = (): boolean => {
    return hasFullAccess();
  };

  // Can update stock levels
  const canUpdateStock = (): boolean => {
    return hasFullAccess();
  };

  // Get the branch ID for cashier (restricted to their branch)
  const getCashierBranchId = (): string | null => {
    if (isCashier()) {
      return userProfile?.branch_id || selectedBranch?.id || null;
    }
    return null;
  };

  return {
    hasInventoryFeature,
    hasFullAccess,
    hasViewAccess,
    isBusinessOwner,
    isSystemMaster,
    isCashier,
    canManageItems,
    canManageWarehouses,
    canManageCategories,
    canRequestStock,
    canManageRequests,
    canUpdateStock,
    getCashierBranchId,
  };
};
