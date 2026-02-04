import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, Save, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRoles, Role } from "@/hooks/useRoles";
import { useRolePermissions, RolePermission } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Common permission keys that can be assigned
const AVAILABLE_PERMISSIONS = [
  { key: 'manage_users', label: 'Manage Users', description: 'Create, edit, and delete users' },
  { key: 'manage_roles', label: 'Manage Roles', description: 'Assign and remove roles' },
  { key: 'manage_employees', label: 'Manage Employees', description: 'Create and manage employees' },
  { key: 'view_analytics', label: 'View Analytics', description: 'Access analytics dashboard' },
  { key: 'manage_inventory', label: 'Manage Inventory', description: 'Full inventory control' },
  { key: 'view_inventory', label: 'View Inventory', description: 'Read-only inventory access' },
  { key: 'approve_inventory', label: 'Approve Inventory', description: 'Approve inventory requests' },
  { key: 'manage_orders', label: 'Manage Orders', description: 'Create and manage orders' },
  { key: 'view_orders', label: 'View Orders', description: 'View order history' },
  { key: 'manage_menu', label: 'Manage Menu', description: 'Edit menu items and categories' },
  { key: 'manage_tables', label: 'Manage Tables', description: 'Configure table layouts' },
  { key: 'manage_branches', label: 'Manage Branches', description: 'Create and edit branches' },
  { key: 'manage_settings', label: 'Manage Settings', description: 'Edit system settings' },
  { key: 'view_reports', label: 'View Reports', description: 'Access business reports' },
  { key: 'manage_loans', label: 'Manage Loans', description: 'Handle employee loans' },
  { key: 'manage_call_center', label: 'Manage Call Center', description: 'Full call center access' },
  { key: 'use_call_center', label: 'Use Call Center', description: 'Handle calls as agent' },
  { key: 'manage_clients', label: 'Manage Clients', description: 'Create and manage clients' },
  { key: 'manage_appointments', label: 'Manage Appointments', description: 'Handle appointments' },
  { key: 'manage_members', label: 'Manage Members', description: 'Handle gym members' },
  { key: 'manage_prescriptions', label: 'Manage Prescriptions', description: 'Handle prescriptions' },
];

export const RolePermissionsEditor = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPermissionKey, setNewPermissionKey] = useState("");
  const [showAddCustom, setShowAddCustom] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: allPermissions = [], isLoading: permissionsLoading } = useRolePermissions();
  
  const selectedRole = roles.find(r => r.id === selectedRoleId);
  
  // Get permissions for the selected role
  const rolePermissions = allPermissions.filter(p => p.role_id === selectedRoleId);
  
  // Check if a permission is granted for the selected role
  const isPermissionGranted = (permissionKey: string): boolean => {
    const perm = rolePermissions.find(p => p.permission_key === permissionKey);
    return perm?.is_granted ?? false;
  };
  
  // Get the permission record if it exists
  const getPermissionRecord = (permissionKey: string): RolePermission | undefined => {
    return rolePermissions.find(p => p.permission_key === permissionKey);
  };

  const togglePermission = async (permissionKey: string, currentlyGranted: boolean) => {
    if (!selectedRoleId) return;
    
    setSaving(true);
    try {
      const existingPermission = getPermissionRecord(permissionKey);
      
      if (existingPermission) {
        // Update existing permission
        const { error } = await supabase
          .from('role_permissions')
          .update({ is_granted: !currentlyGranted })
          .eq('id', existingPermission.id);
        
        if (error) throw error;
      } else {
        // Create new permission
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role_id: selectedRoleId,
            permission_key: permissionKey,
            is_granted: true
          });
        
        if (error) throw error;
      }
      
      // Invalidate and refetch permissions
      await queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success(`Permission ${!currentlyGranted ? 'granted' : 'revoked'}`);
    } catch (error: any) {
      console.error('Error toggling permission:', error);
      toast.error(error.message || 'Failed to update permission');
    } finally {
      setSaving(false);
    }
  };

  const addCustomPermission = async () => {
    if (!selectedRoleId || !newPermissionKey.trim()) return;
    
    const permissionKey = newPermissionKey.trim().toLowerCase().replace(/\s+/g, '_');
    
    if (rolePermissions.some(p => p.permission_key === permissionKey)) {
      toast.error('This permission already exists for this role');
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('role_permissions')
        .insert({
          role_id: selectedRoleId,
          permission_key: permissionKey,
          is_granted: true
        });
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Custom permission added');
      setNewPermissionKey("");
      setShowAddCustom(false);
    } catch (error: any) {
      console.error('Error adding permission:', error);
      toast.error(error.message || 'Failed to add permission');
    } finally {
      setSaving(false);
    }
  };

  const deletePermission = async (permissionId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('id', permissionId);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success('Permission removed');
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      toast.error(error.message || 'Failed to remove permission');
    } finally {
      setSaving(false);
    }
  };

  // Get custom permissions (ones not in AVAILABLE_PERMISSIONS)
  const customPermissions = rolePermissions.filter(
    p => !AVAILABLE_PERMISSIONS.some(ap => ap.key === p.permission_key)
  );

  if (rolesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Role selector */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm">Select Role to Configure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {roles.map(role => (
            <Button
              key={role.id}
              variant={selectedRoleId === role.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedRoleId(role.id)}
            >
              <Badge className={`mr-2 ${role.color_class}`}>
                {role.hierarchy_level}
              </Badge>
              {role.display_name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Permissions editor */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {selectedRole ? `${selectedRole.display_name} Permissions` : 'Select a Role'}
          </CardTitle>
          <CardDescription>
            {selectedRole?.description || 'Click on a role to configure its permissions'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedRoleId && !permissionsLoading ? (
            <div className="space-y-6">
              {/* Standard permissions grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_PERMISSIONS.map(perm => {
                  const isGranted = isPermissionGranted(perm.key);
                  return (
                    <div 
                      key={perm.key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isGranted 
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {perm.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {perm.description}
                        </div>
                      </div>
                      <Switch
                        checked={isGranted}
                        onCheckedChange={() => togglePermission(perm.key, isGranted)}
                        disabled={saving}
                        className="ml-2"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Custom permissions section */}
              {customPermissions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Custom Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customPermissions.map(perm => (
                      <div 
                        key={perm.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          perm.is_granted 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' 
                            : 'bg-muted/30 border-border'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">
                            {perm.permission_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Switch
                            checked={perm.is_granted}
                            onCheckedChange={() => togglePermission(perm.permission_key, perm.is_granted)}
                            disabled={saving}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePermission(perm.id)}
                            disabled={saving}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add custom permission */}
              <div className="pt-4 border-t">
                {showAddCustom ? (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter custom permission key..."
                      value={newPermissionKey}
                      onChange={(e) => setNewPermissionKey(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button 
                      size="sm" 
                      onClick={addCustomPermission}
                      disabled={saving || !newPermissionKey.trim()}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setShowAddCustom(false);
                        setNewPermissionKey("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddCustom(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Custom Permission
                  </Button>
                )}
              </div>
            </div>
          ) : permissionsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select a role from the list to configure its permissions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
