import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, Plus } from "lucide-react";

type UserRole = 'SuperManager' | 'Manager' | 'Cashier' | 'HallManager' | 'HrManager' | 'CallCenterEmp' | 'Employee';

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
  'SuperManager': 1,
  'Manager': 2,
  'HrManager': 3,
  'HallManager': 4,
  'CallCenterEmp': 5,
  'Cashier': 6,
  'Employee': 7,
};

const ROLE_COLORS: Record<UserRole, string> = {
  'SuperManager': 'bg-red-100 text-red-800',
  'Manager': 'bg-blue-100 text-blue-800',
  'HrManager': 'bg-purple-100 text-purple-800',
  'HallManager': 'bg-green-100 text-green-800',
  'CallCenterEmp': 'bg-orange-100 text-orange-800',
  'Cashier': 'bg-yellow-100 text-yellow-800',
  'Employee': 'bg-gray-100 text-gray-800',
};

export const RoleManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Employee");
  const [branchId, setBranchId] = useState<string>("");
  const { userProfile, hasRole, user } = useAuth();
  const { toast } = useToast();

  // Check permissions
  const canManageRoles = hasRole('SuperManager') || hasRole('Manager') || hasRole('HrManager');

  useEffect(() => {
    if (canManageRoles) {
      fetchUsers();
    }
  }, [canManageRoles]);

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

      const usersWithRoles = profiles?.map(profile => ({
        id: profile.user_id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        primary_role: profile.primary_role,
        roles: userRoles?.filter(role => role.user_id === profile.user_id) || []
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Error",
        description: "Please select a user and role",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Role assigned successfully",
      });

      fetchUsers();
      setSelectedUserId("");
      setSelectedRole("Employee");
      setBranchId("");
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  };

  const deactivateRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role deactivated successfully",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deactivating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate role",
        variant: "destructive",
      });
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
                {hasRole('SuperManager') && (
                  <SelectItem value="Manager">Manager</SelectItem>
                )}
                {hasRole('SuperManager') && (
                  <SelectItem value="SuperManager">Super Manager</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select value={branchId} onValueChange={setBranchId}>
              <SelectTrigger>
                <SelectValue placeholder="Branch (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Branches</SelectItem>
                {/* Add branch options here */}
              </SelectContent>
            </Select>

            <Button onClick={assignRole} className="w-full">
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
                            {(hasRole('SuperManager') || (hasRole('Manager') && ROLE_HIERARCHY[role.role] > ROLE_HIERARCHY['Manager'])) && (
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