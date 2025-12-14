import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface RolePermission {
  id: string;
  role_id: string;
  permission_key: string;
  is_granted: boolean;
}

export const useRolePermissions = (roleId?: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: async () => {
      let query = supabase
        .from('role_permissions')
        .select('*');
      
      if (roleId) {
        query = query.eq('role_id', roleId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as RolePermission[];
    },
    enabled: !!roleId || roleId === undefined,
  });
};

export const useUserPermissions = () => {
  const { userRoles } = useAuth();
  
  return useQuery({
    queryKey: ['user-permissions', userRoles],
    queryFn: async () => {
      if (!userRoles || userRoles.length === 0) return [];
      
      // Get role names from user roles
      const roleNames = userRoles.map(ur => ur.role);
      
      // Get role IDs for these role names
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('id, name')
        .in('name', roleNames);
      
      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) return [];
      
      const roleIds = roles.map(r => r.id);
      
      // Get permissions for these roles
      const { data: permissions, error: permError } = await supabase
        .from('role_permissions')
        .select('permission_key')
        .in('role_id', roleIds)
        .eq('is_granted', true);
      
      if (permError) throw permError;
      
      // Return unique permission keys
      const uniquePermissions = [...new Set(permissions?.map(p => p.permission_key) || [])];
      return uniquePermissions;
    },
    enabled: !!userRoles && userRoles.length > 0,
  });
};

export const useHasPermission = () => {
  const { data: permissions = [] } = useUserPermissions();
  
  const hasPermission = (permissionKey: string): boolean => {
    return permissions.includes(permissionKey);
  };
  
  return { hasPermission, permissions };
};
