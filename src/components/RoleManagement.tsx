import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, Plus } from "lucide-react";
import { toast } from "sonner";

type UserRole = 'SystemMaster' | 'SuperManager' | 'Manager' | 'Cashier' | 'HallManager' | 'HrManager' | 'CallCenterEmp' | 'Employee';

interface UserWithRoles {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  primary_role: UserRole | null;
  roles: Array<{
    id: string;
    role: UserRole;
    branch_id: string | null;
    is_active: boolean;
  }>;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  'SystemMaster': 0,
  'SuperManager': 1,
  'Manager': 2,
  'HrManager': 3,
  'HallManager': 4,
  'CallCenterEmp': 5,
  'Cashier': 6,
  'Employee': 7,
};

const ROLE_COLORS: Record<UserRole, string> = {
  'SystemMaster': 'bg-purple-100 text-purple-800 border-purple-200',
  'SuperManager': 'bg-red-100 text-red-800 border-red-200',
  'Manager': 'bg-blue-100 text-blue-800 border-blue-200',
  'HrManager': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'HallManager': 'bg-green-100 text-green-800 border-green-200',
  'CallCenterEmp': 'bg-orange-100 text-orange-800 border-orange-200',
  'Cashier': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Employee': 'bg-gray-100 text-gray-800 border-gray-200',
};

interface Business {
  id: string;
  name: string;
}

export const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string; business_id: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Employee");
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const { userProfile, hasRole, user } = useAuth();

  // Check permissions - SystemMaster should have access
  const canManageRoles = userProfile?.primary_role === 'SystemMaster' || hasRole('SystemMaster') || hasRole('SuperManager') || hasRole('Manager') || hasRole('HrManager');

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
        .select('id, name')
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
          role: selectedRole,
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

            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employee</SelectItem>
                <SelectItem value="Cashier">Cashier</SelectItem>
                <SelectItem value="CallCenterEmp">Call Center Employee</SelectItem>
                <SelectItem value="HallManager">Hall Manager</SelectItem>
                <SelectItem value="HrManager">HR Manager</SelectItem>
                {(hasRole('SuperManager') || hasRole('SystemMaster')) && (
                  <SelectItem value="Manager">Manager</SelectItem>
                )}
                {hasRole('SystemMaster') && (
                  <SelectItem value="SuperManager">Super Manager</SelectItem>
                )}
                {hasRole('SystemMaster') && (
                  <SelectItem value="SystemMaster">System Master</SelectItem>
                )}
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
                    <div className="flex gap-2 mt-2">
                      {user.roles
                        .filter(role => role.is_active)
                        .sort((a, b) => ROLE_HIERARCHY[a.role] - ROLE_HIERARCHY[b.role])
                        .map(role => (
                          <div key={role.id} className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={ROLE_COLORS[role.role]}
                            >
                              {role.role}
                              {role.branch_id && ` (${role.branch_id})`}
                            </Badge>
                            {(hasRole('SystemMaster') || 
                              (hasRole('SuperManager') && ROLE_HIERARCHY[role.role] > ROLE_HIERARCHY['SuperManager']) ||
                              (hasRole('Manager') && ROLE_HIERARCHY[role.role] > ROLE_HIERARCHY['Manager'])) && (
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