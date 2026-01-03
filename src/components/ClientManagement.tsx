import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, DollarSign, Shield, Plus, Settings, Trash2, UserPlus, Info } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string;
  business_type: string;
  branches_count?: number;
  status: 'active' | 'inactive';
  created_at: string;
  owner: string;
  subscription: string;
  features: string[];
}

interface ClientEmployee {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  primary_role: string;
  branch_id: string | null;
  is_active: boolean;
}

const businessTypeLabels = {
  restaurant: "Restaurant",
  hotel: "Hotel", 
  'hair-salon': "Hair Salon",
  'medical-clinic': "Medical Clinic",
  'retail-store': "Retail Store",
  pharmacy: "Pharmacy",
  grocery: "Grocery Store",
  gym: "Gym",
  'auto-repair': "Auto Repair",
  'pet-care': "Pet Care"
};

const availableRoles = [
  { value: 'SystemMaster', label: 'System Master' },
  { value: 'SuperManager', label: 'Super Manager' },
  { value: 'Manager', label: 'Manager' },
  { value: 'HrManager', label: 'HR Manager' },
  { value: 'HallManager', label: 'Hall Manager' },
  { value: 'CallCenterEmp', label: 'Call Center Employee' },
  { value: 'Cashier', label: 'Cashier' },
  { value: 'Employee', label: 'Employee' },
];

export const ClientManagement = ({ clients, isLoading }: { clients: Client[], isLoading: boolean }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "Employee",
    password: "",
    branch_id: ""
  });
  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    phone: "",
    manager_name: ""
  });
  const queryClient = useQueryClient();

  // Fetch business ID for selected client
  const { data: clientBusiness } = useQuery({
    queryKey: ['client-business', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return null;
      
      // selectedClient.id is already the business ID from custom_businesses
      return { id: selectedClient.id };
    },
    enabled: !!selectedClient
  });

  // Fetch employees for selected client
  const { data: clientEmployees = [] } = useQuery({
    queryKey: ['client-employees', clientBusiness?.id],
    queryFn: async () => {
      if (!clientBusiness) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('business_id', clientBusiness.id);

      return profiles as ClientEmployee[];
    },
    enabled: !!clientBusiness
  });

  // Fetch all available features
  const { data: allAvailableFeatures = [] } = useQuery({
    queryKey: ['available-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('available_features')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  // Fetch enabled features for selected client
  const { data: clientEnabledFeatures = [] } = useQuery({
    queryKey: ['client-features', clientBusiness?.id],
    queryFn: async () => {
      if (!clientBusiness) return [];

      const { data } = await supabase
        .from('business_features')
        .select('feature_id, is_enabled')
        .eq('business_id', clientBusiness.id);

      return data || [];
    },
    enabled: !!clientBusiness
  });

  // Filter and merge features based on business type
  const clientFeatures = allAvailableFeatures
    .filter(feature => {
      if (!selectedClient) return false;

      const categoryLower = feature.category.toLowerCase();
      const nameLower = feature.name.toLowerCase();
      
      // Always show core business features
      if (categoryLower.includes('core')) return true;
      
      // Universal features available for all business types
      const universalKeywords = [
        'employee', 'hr', 'staff', 'call center', 'inventory', 
        'analytics', 'reporting', 'branch', 'financial', 'user management'
      ];
      
      if (universalKeywords.some(keyword => 
        categoryLower.includes(keyword) || nameLower.includes(keyword)
      )) {
        return true;
      }
      
      // Business-specific features
      const businessTypeToKeywords: Record<string, string[]> = {
        'restaurant': ['restaurant', 'menu', 'food', 'dining', 'kitchen', 'table', 'order'],
        'hotel': ['hotel', 'room', 'guest', 'reservation', 'hospitality', 'accommodation'],
        'hair-salon': ['salon', 'beauty', 'stylist', 'appointment', 'hair'],
        'medical-clinic': ['medical', 'clinic', 'healthcare', 'patient', 'appointment'],
        'retail-store': ['retail', 'product', 'store', 'sales'],
        'pharmacy': ['pharmacy', 'prescription', 'medication', 'drug'],
        'grocery': ['grocery', 'produce', 'fresh'],
        'gym': ['gym', 'fitness', 'membership', 'class', 'equipment', 'trainer'],
        'auto-repair': ['auto', 'vehicle', 'repair', 'service', 'parts'],
        'pet-care': ['pet', 'veterinary', 'animal', 'grooming']
      };

      const keywords = businessTypeToKeywords[selectedClient.business_type] || [];
      return keywords.some(keyword => 
        categoryLower.includes(keyword) || 
        nameLower.includes(keyword) ||
        feature.description.toLowerCase().includes(keyword)
      );
    })
    .map(feature => {
      const enabledFeature = clientEnabledFeatures.find(ef => ef.feature_id === feature.id);
      return {
        ...feature,
        is_enabled: enabledFeature?.is_enabled ?? false,
        exists_in_db: !!enabledFeature
      };
    });

  // Fetch branches for selected client
  const { data: clientBranches = [] } = useQuery({
    queryKey: ['client-branches', clientBusiness?.id],
    queryFn: async () => {
      if (!clientBusiness) return [];

      const { data: branches } = await supabase
        .from('branches')
        .select('*')
        .eq('business_id', clientBusiness.id);

      return branches || [];
    },
    enabled: !!clientBusiness
  });

  // Fetch financial data for selected client
  const { data: financialData } = useQuery({
    queryKey: ['client-financial', clientBusiness?.id],
    queryFn: async () => {
      if (!clientBusiness) return null;

      // Get current month date range
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      // Get last month date range
      const startOfLastMonth = new Date();
      startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
      startOfLastMonth.setDate(1);
      startOfLastMonth.setHours(0, 0, 0, 0);

      const endOfLastMonth = new Date();
      endOfLastMonth.setDate(0);
      endOfLastMonth.setHours(23, 59, 59, 999);

      // Fetch branches for this business
      const { data: branches } = await supabase
        .from('branches')
        .select('id')
        .eq('business_id', clientBusiness.id);

      const branchIds = branches?.map(b => b.id) || [];

      if (branchIds.length === 0) {
        return {
          currentMonthRevenue: 0,
          lastMonthRevenue: 0,
          currentMonthOrders: 0,
          percentageChange: 0
        };
      }

      // Get current month orders
      const { data: currentMonthOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .in('branch_id', branchIds)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .eq('payment_status', 'paid');

      // Get last month orders
      const { data: lastMonthOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .in('branch_id', branchIds)
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString())
        .eq('payment_status', 'paid');

      const currentRevenue = currentMonthOrders?.reduce(
        (sum, order) => sum + (Number(order.total_amount) || 0),
        0
      ) || 0;

      const lastRevenue = lastMonthOrders?.reduce(
        (sum, order) => sum + (Number(order.total_amount) || 0),
        0
      ) || 0;

      const percentageChange = lastRevenue > 0
        ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
        : 0;

      return {
        currentMonthRevenue: currentRevenue,
        lastMonthRevenue: lastRevenue,
        currentMonthOrders: currentMonthOrders?.length || 0,
        percentageChange
      };
    },
    enabled: !!clientBusiness
  });

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowDetailsDialog(true);
  };

  const handleManageClient = (client: Client) => {
    setSelectedClient(client);
  };

  const addEmployeeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClient || !clientBusiness) throw new Error("No client selected");
      
      if (!newEmployee.branch_id) throw new Error("Please select a branch");
      
      // Create employee auth user and link to client's business
      const { data, error } = await supabase.functions.invoke('create-employee', {
        body: {
          email: newEmployee.email,
          password: newEmployee.password,
          first_name: newEmployee.first_name,
          last_name: newEmployee.last_name,
          role: newEmployee.role,
          business_id: clientBusiness.id,
          branch_id: newEmployee.branch_id
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Employee added successfully! They can now login with their email and password.");
      queryClient.invalidateQueries({ queryKey: ['client-employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowEmployeeDialog(false);
      setNewEmployee({ email: "", first_name: "", last_name: "", role: "Employee", password: "", branch_id: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add employee");
    }
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ featureId, isEnabled, existsInDb }: { featureId: string; isEnabled: boolean; existsInDb: boolean }) => {
      if (!clientBusiness) throw new Error("No business selected");

      if (existsInDb) {
        // Update existing feature
        const { error } = await supabase
          .from('business_features')
          .update({ is_enabled: !isEnabled })
          .eq('business_id', clientBusiness.id)
          .eq('feature_id', featureId);

        if (error) throw error;
      } else {
        // Create new feature entry
        const { error } = await supabase
          .from('business_features')
          .insert({
            business_id: clientBusiness.id,
            feature_id: featureId,
            is_enabled: true
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Feature updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['client-features'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update feature");
    }
  });

  const toggleEmployeeStatusMutation = useMutation({
    mutationFn: async ({ employeeId, currentStatus }: { employeeId: string; currentStatus: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee status updated!");
      queryClient.invalidateQueries({ queryKey: ['client-employees'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update employee status");
    }
  });

  const addBranchMutation = useMutation({
    mutationFn: async () => {
      if (!clientBusiness || !selectedClient) throw new Error("No business selected");

      // Generate a branch ID
      const branchId = `${selectedClient.business_type.substring(0, 4)}-${newBranch.name.toLowerCase().replace(/\s+/g, '-').substring(0, 10)}-${Date.now().toString().slice(-6)}`;

      const { error } = await supabase
        .from('branches')
        .insert({
          id: branchId,
          name: newBranch.name,
          address: newBranch.address,
          phone: newBranch.phone,
          manager_name: newBranch.manager_name,
          business_id: clientBusiness.id,
          business_type: selectedClient.business_type,
          is_active: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Branch added successfully!");
      queryClient.invalidateQueries({ queryKey: ['client-branches'] });
      queryClient.invalidateQueries({ queryKey: ['system-master-clients'] });
      setShowBranchDialog(false);
      setNewBranch({ name: "", address: "", phone: "", manager_name: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add branch");
    }
  });

  return (
    <div className="space-y-6">
      {/* Client Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No clients registered yet</p>
            <p className="text-sm text-muted-foreground">Create your first client to get started</p>
          </div>
        ) : (
          clients.map((client) => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {client.email}
                    </CardDescription>
                  </div>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Business Type</span>
                    <span className="font-medium">
                      {businessTypeLabels[client.business_type as keyof typeof businessTypeLabels]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Branches</span>
                    <span className="font-medium">{client.branches_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <Badge variant="outline" className="text-xs">{client.subscription}</Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewClient(client)}
                      className="gap-1"
                    >
                      <Info className="w-3 h-3" />
                      Details
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => handleManageClient(client)}
                    >
                      <Settings className="w-3 h-3" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Client Management Dialog */}
      <Dialog open={!!selectedClient && !showDetailsDialog} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {selectedClient?.name} - Management
            </DialogTitle>
            <DialogDescription>
              Manage employees, roles, and financial settings
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="employees" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="employees" className="gap-2">
                <Users className="w-4 h-4" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="features" className="gap-2">
                <Settings className="w-4 h-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-2">
                <Shield className="w-4 h-4" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="financial" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="branches" className="gap-2">
                <Building2 className="w-4 h-4" />
                Branches
              </TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="space-y-4 max-h-[50vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {clientEmployees.length} employee{clientEmployees.length !== 1 ? 's' : ''}
                </p>
                <Button size="sm" onClick={() => setShowEmployeeDialog(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Employee
                </Button>
              </div>

              <div className="grid gap-3">
                {clientEmployees.map((employee) => (
                  <Card key={employee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{employee.primary_role}</Badge>
                          <Badge variant={employee.is_active ? "default" : "secondary"}>
                            {employee.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleEmployeeStatusMutation.mutate({ 
                              employeeId: employee.id, 
                              currentStatus: employee.is_active 
                            })}
                          >
                            {employee.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4 max-h-[50vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                {clientFeatures.filter((f: any) => f.is_enabled).length} of {clientFeatures.length} feature(s) enabled
              </p>
              <div className="space-y-4">
                {Object.entries(
                  clientFeatures.reduce((acc: any, feature: any) => {
                    const category = feature.category;
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(feature);
                    return acc;
                  }, {})
                ).map(([category, features]: [string, any]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {features.map((feature: any) => (
                        <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl">{feature.icon}</span>
                            <div>
                              <p className="font-medium">{feature.name}</p>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={feature.is_enabled ? "default" : "secondary"}>
                              {feature.is_enabled ? "Enabled" : "Disabled"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleFeatureMutation.mutate({ 
                                featureId: feature.id, 
                                isEnabled: feature.is_enabled,
                                existsInDb: feature.exists_in_db
                              })}
                              disabled={toggleFeatureMutation.isPending}
                            >
                              {feature.is_enabled ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4 max-h-[50vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground">Role assignment and permissions management</p>
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <Card key={role.value}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{role.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {clientEmployees.filter(e => e.primary_role === role.value).length} employee(s)
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info(`Role configuration for ${role.label} coming soon`)}
                        >
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 max-h-[50vh] overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Subscription Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{selectedClient?.subscription}</p>
                    <p className="text-sm text-muted-foreground mt-1">Active since {selectedClient && new Date(selectedClient.created_at).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Current Month Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${financialData?.currentMonthRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </p>
                    <p className={`text-sm mt-1 ${financialData && financialData.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {financialData?.percentageChange ? `${financialData.percentageChange > 0 ? '+' : ''}${financialData.percentageChange.toFixed(1)}% from last month` : 'No previous data'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Orders This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{financialData?.currentMonthOrders || 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total paid orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Last Month Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      ${financialData?.lastMonthRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Previous period</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="branches" className="space-y-4 max-h-[50vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{clientBranches.length} branch(es)</p>
                <Button size="sm" onClick={() => setShowBranchDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Branch
                </Button>
              </div>
              <div className="grid gap-3">
                {clientBranches.map((branch: any) => (
                  <Card key={branch.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-muted-foreground">{branch.address}</p>
                          {branch.phone && (
                            <p className="text-sm text-muted-foreground">📞 {branch.phone}</p>
                          )}
                          {branch.manager_name && (
                            <p className="text-sm text-muted-foreground">Manager: {branch.manager_name}</p>
                          )}
                        </div>
                        <Badge variant={branch.is_active ? "default" : "secondary"}>
                          {branch.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Client Details
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Business Name</Label>
                  <p className="text-lg font-semibold">{selectedClient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedClient.status === 'active' ? 'default' : 'secondary'}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Business Type</Label>
                  <p className="text-base">{businessTypeLabels[selectedClient.business_type as keyof typeof businessTypeLabels]}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-base">{selectedClient.email}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Features</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedClient.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowDetailsDialog(false);
            }}>
              Manage Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>
              Add a new employee to {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="emp-first-name">First Name</Label>
              <Input
                id="emp-first-name"
                value={newEmployee.first_name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, first_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp-last-name">Last Name</Label>
              <Input
                id="emp-last-name"
                value={newEmployee.last_name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp-email">Email</Label>
              <Input
                id="emp-email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp-password">Password</Label>
              <Input
                id="emp-password"
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp-role">Role</Label>
              <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee(prev => ({ ...prev, role: value }))}>
                <SelectTrigger id="emp-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp-branch">Branch *</Label>
              <Select value={newEmployee.branch_id} onValueChange={(value) => setNewEmployee(prev => ({ ...prev, branch_id: value }))}>
                <SelectTrigger id="emp-branch">
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {clientBranches.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clientBranches.length === 0 && (
                <p className="text-sm text-muted-foreground">No branches available. Please add a branch first.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmployeeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addEmployeeMutation.mutate()}
              disabled={addEmployeeMutation.isPending || !newEmployee.email || !newEmployee.first_name || !newEmployee.last_name || !newEmployee.password || !newEmployee.branch_id}
            >
              {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Branch Dialog */}
      <Dialog open={showBranchDialog} onOpenChange={setShowBranchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Create a new branch for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input
                id="branch-name"
                placeholder="e.g., Downtown Branch"
                value={newBranch.name}
                onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-address">Address</Label>
              <Input
                id="branch-address"
                placeholder="123 Main St, City, State"
                value={newBranch.address}
                onChange={(e) => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-phone">Phone</Label>
              <Input
                id="branch-phone"
                placeholder="+1 (555) 123-4567"
                value={newBranch.phone}
                onChange={(e) => setNewBranch(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-manager">Manager Name</Label>
              <Input
                id="branch-manager"
                placeholder="John Doe"
                value={newBranch.manager_name}
                onChange={(e) => setNewBranch(prev => ({ ...prev, manager_name: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBranchDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addBranchMutation.mutate()}
              disabled={addBranchMutation.isPending || !newBranch.name || !newBranch.address}
            >
              {addBranchMutation.isPending ? "Adding..." : "Add Branch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
