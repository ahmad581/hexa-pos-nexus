import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { RoleManagement as RoleManagementComponent } from "@/components/RoleManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Settings, AlertCircle } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { Badge } from "@/components/ui/badge";
import { useRoles } from "@/hooks/useRoles";

export const RoleManagement = () => {
  const { 
    primaryRole, 
    canManageUsers, 
    canViewAnalytics, 
    canManageInventory,
    canHandleOrders,
    canHandleCalls,
    canAccessBusinessManagement,
    canManageRoles,
    canAccessEmployees
  } = useRole();

  const { data: roles = [] } = useRoles();

  return (
    <RoleBasedRoute allowedRoles={['SystemMaster', 'SuperManager', 'Manager', 'HrManager']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions across your organization
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Shield className="h-4 w-4 mr-2" />
            {primaryRole}
          </Badge>
        </div>

        {/* Current User Permissions Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Your Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className={`p-3 rounded-lg border ${canManageUsers() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Users className={`h-5 w-5 mb-2 ${canManageUsers() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">Manage Users</div>
                <div className="text-xs text-muted-foreground">
                  {canManageUsers() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${canViewAnalytics() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <AlertCircle className={`h-5 w-5 mb-2 ${canViewAnalytics() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">View Analytics</div>
                <div className="text-xs text-muted-foreground">
                  {canViewAnalytics() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${canManageInventory() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Shield className={`h-5 w-5 mb-2 ${canManageInventory() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">Manage Inventory</div>
                <div className="text-xs text-muted-foreground">
                  {canManageInventory() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${canHandleOrders() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Settings className={`h-5 w-5 mb-2 ${canHandleOrders() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">Handle Orders</div>
                <div className="text-xs text-muted-foreground">
                  {canHandleOrders() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${canAccessBusinessManagement() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Shield className={`h-5 w-5 mb-2 ${canAccessBusinessManagement() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">Business Management</div>
                <div className="text-xs text-muted-foreground">
                  {canAccessBusinessManagement() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${canHandleCalls() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Users className={`h-5 w-5 mb-2 ${canHandleCalls() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">Handle Calls</div>
                <div className="text-xs text-muted-foreground">
                  {canHandleCalls() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${canManageRoles() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Shield className={`h-5 w-5 mb-2 ${canManageRoles() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">Manage Roles</div>
                <div className="text-xs text-muted-foreground">
                  {canManageRoles() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${canAccessEmployees() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Users className={`h-5 w-5 mb-2 ${canAccessEmployees() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">Access Employees</div>
                <div className="text-xs text-muted-foreground">
                  {canAccessEmployees() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Management Component */}
        <RoleManagementComponent />

        {/* Dynamic Role Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map(role => (
                <div key={role.id} className={`border-l-4 pl-4 ${role.color_class.replace('bg-', 'border-')}`}>
                  <h4 className="font-semibold">{role.display_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {role.description || 'No description available'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedRoute>
  );
};
