import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Users, Settings, Key, Building2, CheckCircle, XCircle } from "lucide-react";
import { useRoles, useBusinessTypeRoles, Role } from "@/hooks/useRoles";
import { useRolePermissions } from "@/hooks/usePermissions";
import { RoleManagement as RoleAssignment } from "@/components/RoleManagement";
import { useBusinessTypes } from "@/hooks/useBusinessTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemMasterRoleManagementProps {}

export const SystemMasterRoleManagement = ({}: SystemMasterRoleManagementProps) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permissions = [], isLoading: permissionsLoading } = useRolePermissions(selectedRoleId || undefined);
  const { data: businessTypeRoles = [] } = useBusinessTypeRoles();
  const { businessTypes } = useBusinessTypes();

  const selectedRole = roles.find(r => r.id === selectedRoleId);

  // Get permissions for a specific role
  const getRolePermissions = (roleId: string) => {
    return permissions.filter(p => p.role_id === roleId && p.is_granted);
  };

  // Get roles for a specific business type
  const getBusinessTypeRolesList = (businessTypeId: string) => {
    return businessTypeRoles
      .filter(btr => btr.business_type_id === businessTypeId)
      .map(btr => roles.find(r => r.id === btr.role_id))
      .filter(Boolean) as Role[];
  };

  if (rolesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="assign" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assign" className="gap-2">
            <Users className="w-4 h-4" />
            Assign Roles
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="w-4 h-4" />
            All Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Key className="w-4 h-4" />
            Role Permissions
          </TabsTrigger>
          <TabsTrigger value="business-types" className="gap-2">
            <Building2 className="w-4 h-4" />
            Business Type Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-4">
          <RoleAssignment />
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Roles
              </CardTitle>
              <CardDescription>
                All available roles in the system with their hierarchy levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Hierarchy</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map(role => (
                    <TableRow 
                      key={role.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRoleId(role.id)}
                    >
                      <TableCell>
                        <Badge className={role.color_class}>
                          {role.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{role.display_name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {role.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {role.hierarchy_level}</Badge>
                      </TableCell>
                      <TableCell>
                        {role.is_system_role ? (
                          <Badge variant="secondary">System</Badge>
                        ) : (
                          <Badge variant="outline">Custom</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {role.is_active ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Role selector */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Select Role</CardTitle>
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

            {/* Permissions display */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  {selectedRole ? `${selectedRole.display_name} Permissions` : 'Select a Role'}
                </CardTitle>
                <CardDescription>
                  {selectedRole?.description || 'Click on a role to view its permissions'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRoleId && !permissionsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {getRolePermissions(selectedRoleId).length > 0 ? (
                      getRolePermissions(selectedRoleId).map(perm => (
                        <div 
                          key={perm.id}
                          className="flex items-center gap-2 p-3 rounded-lg border bg-green-50 border-green-200"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {perm.permission_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center text-muted-foreground py-8">
                        No permissions assigned to this role
                      </div>
                    )}
                  </div>
                ) : permissionsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a role from the list to view its permissions
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Type Role Mappings
              </CardTitle>
              <CardDescription>
                Roles available for each business type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {businessTypes.map(bt => (
                  <div key={bt.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{bt.icon}</span>
                      <div>
                        <h4 className="font-semibold">{bt.name}</h4>
                        <p className="text-sm text-muted-foreground">{bt.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getBusinessTypeRolesList(bt.id).map(role => (
                        <Badge key={role.id} className={role.color_class}>
                          {role.display_name}
                        </Badge>
                      ))}
                      {getBusinessTypeRolesList(bt.id).length === 0 && (
                        <span className="text-sm text-muted-foreground">
                          No specific roles assigned (uses default roles)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
