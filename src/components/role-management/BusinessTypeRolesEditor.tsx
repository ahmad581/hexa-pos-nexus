import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Settings2, X, Save } from "lucide-react";
import { useRoles, useBusinessTypeRoles, Role } from "@/hooks/useRoles";
import { useBusinessTypes } from "@/hooks/useBusinessTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const BusinessTypeRolesEditor = () => {
  const [editingBusinessType, setEditingBusinessType] = useState<string | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: businessTypeRoles = [], isLoading: btRolesLoading } = useBusinessTypeRoles();
  const { businessTypes, isLoading: btLoading } = useBusinessTypes();

  // Get roles for a specific business type
  const getBusinessTypeRolesList = (businessTypeId: string): Role[] => {
    return businessTypeRoles
      .filter(btr => btr.business_type_id === businessTypeId)
      .map(btr => roles.find(r => r.id === btr.role_id))
      .filter(Boolean) as Role[];
  };

  // Get business type role record IDs for a business type
  const getBusinessTypeRoleRecords = (businessTypeId: string) => {
    return businessTypeRoles.filter(btr => btr.business_type_id === businessTypeId);
  };

  // Open edit dialog for a business type
  const openEditDialog = (businessTypeId: string) => {
    const currentRoles = getBusinessTypeRoleRecords(businessTypeId);
    setSelectedRoleIds(new Set(currentRoles.map(r => r.role_id)));
    setEditingBusinessType(businessTypeId);
  };

  // Toggle a role selection
  const toggleRole = (roleId: string) => {
    const newSet = new Set(selectedRoleIds);
    if (newSet.has(roleId)) {
      newSet.delete(roleId);
    } else {
      newSet.add(roleId);
    }
    setSelectedRoleIds(newSet);
  };

  // Save the role mappings
  const saveRoleMappings = async () => {
    if (!editingBusinessType) return;
    
    setSaving(true);
    try {
      const currentRecords = getBusinessTypeRoleRecords(editingBusinessType);
      const currentRoleIds = new Set(currentRecords.map(r => r.role_id));
      
      // Roles to add
      const rolesToAdd = [...selectedRoleIds].filter(id => !currentRoleIds.has(id));
      
      // Roles to remove
      const rolesToRemove = currentRecords.filter(r => !selectedRoleIds.has(r.role_id));
      
      // Delete removed mappings
      if (rolesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('business_type_roles')
          .delete()
          .in('id', rolesToRemove.map(r => r.id));
        
        if (deleteError) throw deleteError;
      }
      
      // Add new mappings
      if (rolesToAdd.length > 0) {
        const { error: insertError } = await supabase
          .from('business_type_roles')
          .insert(rolesToAdd.map(roleId => ({
            business_type_id: editingBusinessType,
            role_id: roleId,
            is_default: false
          })));
        
        if (insertError) throw insertError;
      }
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['business-type-roles'] });
      toast.success('Role mappings updated successfully');
      setEditingBusinessType(null);
    } catch (error: any) {
      console.error('Error saving role mappings:', error);
      toast.error(error.message || 'Failed to update role mappings');
    } finally {
      setSaving(false);
    }
  };

  // Remove a single role from a business type
  const removeRole = async (businessTypeId: string, roleId: string) => {
    const record = businessTypeRoles.find(
      btr => btr.business_type_id === businessTypeId && btr.role_id === roleId
    );
    
    if (!record) return;
    
    try {
      const { error } = await supabase
        .from('business_type_roles')
        .delete()
        .eq('id', record.id);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['business-type-roles'] });
      toast.success('Role removed from business type');
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error(error.message || 'Failed to remove role');
    }
  };

  const editingBT = businessTypes.find(bt => bt.id === editingBusinessType);

  if (rolesLoading || btLoading || btRolesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Type Role Mappings
          </CardTitle>
          <CardDescription>
            Configure which roles are available for each business type. Click the settings icon to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {businessTypes.map(bt => {
              const btRoles = getBusinessTypeRolesList(bt.id);
              return (
                <div key={bt.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{bt.icon}</span>
                      <div>
                        <h4 className="font-semibold">{bt.name}</h4>
                        <p className="text-sm text-muted-foreground">{bt.category}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(bt.id)}
                      className="gap-2"
                    >
                      <Settings2 className="h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {btRoles.map(role => (
                      <div key={role.id} className="flex items-center gap-1">
                        <Badge className={role.color_class}>
                          {role.display_name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-destructive/20"
                          onClick={() => removeRole(bt.id, role.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {btRoles.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        No specific roles assigned (uses default roles)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingBusinessType} onOpenChange={(open) => !open && setEditingBusinessType(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingBT && <span className="text-xl">{editingBT.icon}</span>}
              Configure Roles for {editingBT?.name}
            </DialogTitle>
            <DialogDescription>
              Select which roles should be available for {editingBT?.name} businesses.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4 max-h-[400px] overflow-y-auto">
            {roles.map(role => (
              <div 
                key={role.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedRoleIds.has(role.id) 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => toggleRole(role.id)}
              >
                <Checkbox 
                  checked={selectedRoleIds.has(role.id)}
                  onCheckedChange={() => toggleRole(role.id)}
                />
                <div className="flex-1 min-w-0">
                  <Badge className={`${role.color_class} text-xs`}>
                    {role.display_name}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    Level {role.hierarchy_level}
                    {role.is_system_role && ' • System'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditingBusinessType(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={saveRoleMappings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
