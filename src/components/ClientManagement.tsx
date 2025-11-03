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
  const [newEmployee, setNewEmployee] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "Employee",
    password: ""
  });
  const queryClient = useQueryClient();

  // Fetch employees for selected client
  const { data: clientEmployees = [] } = useQuery({
    queryKey: ['client-employees', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      // Get business associated with client
      const { data: businesses } = await supabase
        .from('custom_businesses')
        .select('id')
        .eq('user_id', selectedClient.id)
        .limit(1);

      if (!businesses || businesses.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('business_id', businesses[0].id);

      return profiles as ClientEmployee[];
    },
    enabled: !!selectedClient
  });

  // Fetch branches for selected client
  const { data: clientBranches = [] } = useQuery({
    queryKey: ['client-branches', selectedClient?.id],
    queryFn: async () => {
      if (!selectedClient) return [];
      
      const { data: businesses } = await supabase
        .from('custom_businesses')
        .select('id')
        .eq('user_id', selectedClient.id)
        .limit(1);

      if (!businesses || businesses.length === 0) return [];

      const { data: branches } = await supabase
        .from('branches')
        .select('*')
        .eq('business_id', businesses[0].id);

      return branches || [];
    },
    enabled: !!selectedClient
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
      if (!selectedClient) throw new Error("No client selected");
      
      // Create user and assign to client's business
      const { data, error } = await supabase.functions.invoke('create-client', {
        body: {
          name: `${newEmployee.first_name} ${newEmployee.last_name}`,
          email: newEmployee.email,
          password: newEmployee.password,
          business_type: selectedClient.business_type,
          role: newEmployee.role
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Employee added successfully!");
      queryClient.invalidateQueries({ queryKey: ['client-employees'] });
      setShowEmployeeDialog(false);
      setNewEmployee({ email: "", first_name: "", last_name: "", role: "Employee", password: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add employee");
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="employees" className="gap-2">
                <Users className="w-4 h-4" />
                Employees
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
                        </div>
                      </div>
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
                        <Button variant="outline" size="sm">Configure</Button>
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
                    <CardTitle className="text-sm">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">$2,450</p>
                    <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="branches" className="space-y-4 max-h-[50vh] overflow-y-auto">
              <p className="text-sm text-muted-foreground">{clientBranches.length} branch(es)</p>
              <div className="grid gap-3">
                {clientBranches.map((branch: any) => (
                  <Card key={branch.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-sm text-muted-foreground">{branch.address}</p>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmployeeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => addEmployeeMutation.mutate()}
              disabled={addEmployeeMutation.isPending || !newEmployee.email || !newEmployee.first_name || !newEmployee.last_name || !newEmployee.password}
            >
              {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
