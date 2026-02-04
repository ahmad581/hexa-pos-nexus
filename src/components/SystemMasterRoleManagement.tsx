import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Users, Key, Building2, CheckCircle, XCircle } from "lucide-react";
import { useRoles, useBusinessTypeRoles, Role } from "@/hooks/useRoles";
import { RoleManagement as RoleAssignment } from "@/components/RoleManagement";
import { RolePermissionsEditor } from "@/components/role-management/RolePermissionsEditor";
import { useBusinessTypes } from "@/hooks/useBusinessTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface SystemMasterRoleManagementProps {}

export const SystemMasterRoleManagement = ({}: SystemMasterRoleManagementProps) => {
  
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: businessTypeRoles = [] } = useBusinessTypeRoles();
  const { businessTypes } = useBusinessTypes();
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
                      className="hover:bg-muted/50"
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
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
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
          <RolePermissionsEditor />
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
