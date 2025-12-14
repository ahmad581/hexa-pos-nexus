import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  hierarchy_level: number;
  color_class: string;
  is_system_role: boolean;
  is_active: boolean;
}

export interface BusinessTypeRole {
  id: string;
  business_type_id: string;
  role_id: string;
  is_default: boolean;
  role?: Role;
}

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('is_active', true)
        .order('hierarchy_level', { ascending: true });
      
      if (error) throw error;
      return data as Role[];
    },
  });
};

export const useBusinessTypeRoles = (businessTypeId?: string) => {
  return useQuery({
    queryKey: ['business-type-roles', businessTypeId],
    queryFn: async () => {
      let query = supabase
        .from('business_type_roles')
        .select(`
          *,
          role:roles(*)
        `);
      
      if (businessTypeId) {
        query = query.eq('business_type_id', businessTypeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BusinessTypeRole[];
    },
    enabled: !!businessTypeId || businessTypeId === undefined,
  });
};

export const getRoleColor = (roleName: string, roles: Role[]): string => {
  const role = roles.find(r => r.name === roleName);
  return role?.color_class || 'bg-gray-500';
};

export const getRoleDisplayName = (roleName: string, roles: Role[]): string => {
  const role = roles.find(r => r.name === roleName);
  return role?.display_name || roleName;
};

export const getRoleHierarchy = (roleName: string, roles: Role[]): number => {
  const role = roles.find(r => r.name === roleName);
  return role?.hierarchy_level ?? 100;
};
