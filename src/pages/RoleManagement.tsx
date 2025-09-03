import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { RoleManagement as RoleManagementComponent } from "@/components/RoleManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Settings, AlertCircle } from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { Badge } from "@/components/ui/badge";

export const RoleManagement = () => {
  const { 
    primaryRole, 
    userRoles, 
    canManageUsers, 
    canViewAnalytics, 
    canManageInventory,
    canHandleOrders,
    canHandleCalls 
  } = useRole();

  return (
    <RoleBasedRoute allowedRoles={['SuperManager', 'Manager', 'HrManager']}>
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

              <div className={`p-3 rounded-lg border ${canHandleCalls() ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <Users className={`h-5 w-5 mb-2 ${canHandleCalls() ? 'text-green-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium">Handle Calls</div>
                <div className="text-xs text-muted-foreground">
                  {canHandleCalls() ? 'Allowed' : 'Not Allowed'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Management Component */}
        <RoleManagementComponent />

        {/* Role Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Role Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-700">SuperManager</h4>
                  <p className="text-sm text-muted-foreground">
                    Full system access, can manage all branches and assign any role
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-700">Manager</h4>
                  <p className="text-sm text-muted-foreground">
                    Branch management, can assign most roles within their branch
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-700">HR Manager</h4>
                  <p className="text-sm text-muted-foreground">
                    Employee management, can assign basic roles and manage staff
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700">Hall Manager</h4>
                  <p className="text-sm text-muted-foreground">
                    Floor operations, inventory management, and staff coordination
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-700">Call Center Employee</h4>
                  <p className="text-sm text-muted-foreground">
                    Handle customer calls, phone orders, and customer service
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-yellow-700">Cashier</h4>
                  <p className="text-sm text-muted-foreground">
                    Process transactions, handle POS operations
                  </p>
                </div>
                <div className="border-l-4 border-gray-500 pl-4">
                  <h4 className="font-semibold text-gray-700">Employee</h4>
                  <p className="text-sm text-muted-foreground">
                    Basic access to assigned tasks and daily operations
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedRoute>
  );
};