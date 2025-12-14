import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRoles, useBusinessTypeRoles, getRoleColor, getRoleDisplayName, getRoleHierarchy, Role } from "@/hooks/useRoles";
import { useHasPermission } from "@/hooks/usePermissions";

interface UserWithRoles {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  primary_role: string | null;
  roles: Array<{
    id: string;
    role: string;
    branch_id: string | null;
    is_active: boolean;
  }>;
}

interface Business {
  id: string;
  name: string;
  business_type: string;
}

export const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string; business_id: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("Employee");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const { userProfile, hasRole, user } = useAuth();
  const { hasPermission } = useHasPermission();
  
  // Fetch dynamic roles from database
  const { data: allRoles = [] } = useRoles();
  
  // Get the selected business type for role filtering
  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
  const { data: businessTypeRoles = [] } = useBusinessTypeRoles(selectedBusiness?.business_type);

  // Check permissions - using both legacy role checks and new permission system
  const canManageRoles = userProfile?.primary_role === 'SystemMaster' || 
    hasRole('SystemMaster') || 
    hasRole('SuperManager') || 
    hasRole('Manager') || 
    hasRole('HrManager') ||
    hasPermission('manage_roles') ||
    hasPermission('manage_users');

  useEffect(() => {
    if (canManageRoles) {
      fetchUsers();
      fetchBusinesses();
    }
  }, [canManageRoles]);

  const fetchBusinesses = async () => {
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('custom_businesses')
        .select('id, name, business_type')
        .order('name');

      if (businessError) throw businessError;
      setBusinesses(businessData || []);

      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('id, name, business_id')
        .eq('is_active', true)
        .order('name');

      if (branchError) throw branchError;
      setBranches(branchData || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  // Filter branches based on selected business
  const filteredBranches = selectedBusinessId 
    ? branches.filter(b => b.business_id === selectedBusinessId)
    : branches;

  // Get available roles for the selected business type, or all roles if no business selected
  const availableRoles = selectedBusinessId && businessTypeRoles.length > 0
    ? allRoles.filter(role => 
        businessTypeRoles.some(btr => btr.role_id === role.id) || role.is_system_role
      )
    : allRoles;

  // Filter roles based on current user's permissions
  const getAssignableRoles = (): Role[] => {
    const userHierarchy = hasRole('SystemMaster') ? 0 : 
                          hasRole('SuperManager') ? 1 : 
                          hasRole('Manager') ? 2 : 100;
    
    return availableRoles.filter(role => role.hierarchy_level > userHierarchy);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with their profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);

      if (profilesError) throw profilesError;

      // Fetch user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles
        ?.filter(profile => profile.user_id != null)
        .map(profile => ({
          id: profile.user_id!,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          primary_role: profile.primary_role,
          roles: userRoles?.filter(role => role.user_id === profile.user_id) || []
        })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast.error("Please select a user and role");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: selectedUserId,
          role: selectedRole as any,
          branch_id: branchId || null,
          assigned_by: user?.id
        });

      if (error) throw error;

      toast.success("Role assigned successfully");

      fetchUsers();
      setSelectedUserId("");
      setSelectedRole("Employee");
      setSelectedBusinessId("");
      setBranchId("");
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast.error(error.message || "Failed to assign role");
    }
  };

  const deactivateRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;

      toast.success("Role deactivated successfully");

      fetchUsers();
    } catch (error: any) {
      console.error('Error deactivating role:', error);
      toast.error(error.message || "Failed to deactivate role");
    }
  };

  const canDeactivateRole = (roleToDeactivate: string): boolean => {
    const userHierarchy = hasRole('SystemMaster') ? 0 : 
                          hasRole('SuperManager') ? 1 : 
                          hasRole('Manager') ? 2 : 100;
    const roleHierarchy = getRoleHierarchy(roleToDeactivate, allRoles);
    return roleHierarchy > userHierarchy;
  };

  if (!canManageRoles) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to manage roles.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign New Role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select User" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}` 
                      : user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {getAssignableRoles().map(role => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedBusinessId || "none"} onValueChange={(value) => {
              setSelectedBusinessId(value === "none" ? "" : value);
              setBranchId(""); // Reset branch when business changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Business (Client)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Business</SelectItem>
                {businesses.map(business => (
                  <SelectItem key={business.id} value={business.id}>
                    {business.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={branchId || "all"} onValueChange={(value) => setBranchId(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Branch (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {filteredBranches.map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={assignRole}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Users & Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.email}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {user.roles
                        .filter(role => role.is_active)
                        .sort((a, b) => getRoleHierarchy(a.role, allRoles) - getRoleHierarchy(b.role, allRoles))
                        .map(role => (
                          <div key={role.id} className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={getRoleColor(role.role, allRoles)}
                            >
                              {getRoleDisplayName(role.role, allRoles)}
                              {role.branch_id && ` (${role.branch_id})`}
                            </Badge>
                            {canDeactivateRole(role.role) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deactivateRole(role.id)}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
