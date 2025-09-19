import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Settings, Trash2, Users, BarChart3, Crown, Shield, LogOut, Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { BusinessManagement } from "@/pages/BusinessManagement";
import { RoleManagement } from "@/components/RoleManagement";

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

export const SystemMasterDashboard = () => {
  const { userProfile, isAuthenticated, user, logout } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    business_type: "",
  });

  // Fetch clients (this would be actual client data in a real system)
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['system-master-clients'],
    queryFn: async () => {
      // For now, return mock data. In a real system, this would fetch actual client data
      return [
        {
          id: '1',
          name: 'Downtown Restaurant Group',
          email: 'admin@downtownrestaurants.com',
          business_type: 'restaurant',
          branches_count: 5,
          status: 'active' as const,
          created_at: '2024-01-15T00:00:00Z',
          owner: 'John Smith',
          subscription: 'Premium',
          features: ['Order Management', 'Inventory Tracking', 'Staff Management', 'Analytics Dashboard', 'Multi-branch Support']
        },
        {
          id: '2', 
          name: 'City Hotel Chain',
          email: 'management@cityhotels.com',
          business_type: 'hotel',
          branches_count: 3,
          status: 'active' as const,
          created_at: '2024-02-10T00:00:00Z',
          owner: 'Sarah Johnson',
          subscription: 'Enterprise',
          features: ['Room Management', 'Booking System', 'Guest Services', 'Housekeeping Management', 'Revenue Analytics']
        },
        {
          id: '3',
          name: 'Beauty Salon Network',
          email: 'info@beautysalons.com', 
          business_type: 'hair-salon',
          branches_count: 8,
          status: 'inactive' as const,
          created_at: '2024-03-05T00:00:00Z',
          owner: 'Maria Rodriguez',
          subscription: 'Standard',
          features: ['Appointment Scheduling', 'Staff Management', 'Customer Database', 'Service Management']
        }
      ] as Client[];
    },
    enabled: isAuthenticated && user?.id && (userProfile?.primary_role === 'SystemMaster' || user?.email === 'ahmadalodat530@gmail.com')
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: typeof newClient) => {
      // In a real system, this would create the client in the database
      // For now, we'll just simulate it
      const newClientData = {
        id: Date.now().toString(),
        ...clientData,
        branches_count: 0,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        owner: 'System Generated',
        subscription: 'Standard',
        features: ['Dashboard', 'User Management', 'Basic Analytics']
      };
      return newClientData;
    },
    onSuccess: () => {
      toast.success("Client created successfully!");
      queryClient.invalidateQueries({ queryKey: ['system-master-clients'] });
      setIsDialogOpen(false);
      setNewClient({ name: "", email: "", business_type: "" });
    },
    onError: () => {
      toast.error("Failed to create client");
    }
  });

  const handleCreateClient = () => {
    if (!newClient.name || !newClient.email || !newClient.business_type) {
      toast.error("Please fill all fields");
      return;
    }
    createClientMutation.mutate(newClient);
  };

  const handleManageClient = (client: Client) => {
    // Create a simulated management interface URL
    const managementUrl = `/dashboard?client=${client.id}&systemmaster=true`;
    
    // In a real system, you would:
    // 1. Set up client context/session
    // 2. Grant SystemMaster privileges for this client
    // 3. Redirect to their dashboard
    
    toast.success(`Opening management interface for ${client.name}...`);
    
    // For now, redirect to the main dashboard with client context
    // In a real implementation, this would set up proper client switching
    setTimeout(() => {
      window.location.href = managementUrl;
    }, 1000);
  };

  const handleClientInfo = (client: Client) => {
    setSelectedClient(client);
    setIsInfoDialogOpen(true);
  };

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

  const isSystemMasterAccess = userProfile?.primary_role === 'SystemMaster' || user?.email === 'ahmadalodat530@gmail.com';
  
  if (!isAuthenticated || !user?.id || !isSystemMasterAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {!isAuthenticated || !user?.id ? 
                "Please log in to access the SystemMaster dashboard" : 
                "Only SystemMaster accounts can access this dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/login'}>
              {!isAuthenticated || !user?.id ? "Go to Login" : "Back to Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">SystemMaster Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your clients and their business operations
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
              <DialogDescription>
                Register a new business client to use the BizHub system
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="client-name">Business Name</Label>
                <Input
                  id="client-name"
                  placeholder="Enter business name"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-email">Email Address</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="admin@business.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={newClient.business_type} onValueChange={(value) => setNewClient(prev => ({ ...prev, business_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(businessTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClient} disabled={createClientMutation.isPending}>
                {createClientMutation.isPending ? "Creating..." : "Create Client"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Client Info Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Client Information
            </DialogTitle>
            <DialogDescription>
              Detailed information about {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-6 py-4">
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
                  <Label className="text-sm font-medium text-muted-foreground">Owner</Label>
                  <p className="text-base">{selectedClient.owner}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-base">{selectedClient.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subscription Plan</Label>
                  <p className="text-base font-medium">{selectedClient.subscription}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Total Branches</Label>
                  <p className="text-base">{selectedClient.branches_count || 0}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                  <p className="text-base">{new Date(selectedClient.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Subscribed Features</Label>
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
            <Button variant="outline" onClick={() => setIsInfoDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedClient) {
                handleManageClient(selectedClient);
                setIsInfoDialogOpen(false);
              }
            }} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Open Management Interface
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients" className="gap-2">
            <Building2 className="w-4 h-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            System Analytics
          </TabsTrigger>
          <TabsTrigger value="business-management" className="gap-2">
            <Building2 className="w-4 h-4" />
            Business Management
          </TabsTrigger>
          <TabsTrigger value="role-management" className="gap-2">
            <Shield className="w-4 h-4" />
            Role Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
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
                <Card key={client.id}>
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
                        <span className="text-muted-foreground">Since</span>
                        <span className="font-medium">
                          {new Date(client.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleClientInfo(client)}
                        >
                          <Info className="w-3 h-3 mr-1" />
                          Info
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleManageClient(client)}
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Manage
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.filter(c => c.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((clients.filter(c => c.status === 'active').length / Math.max(clients.length, 1)) * 100)}% active rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.reduce((sum, client) => sum + (client.branches_count || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all clients
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <p className="text-xs text-muted-foreground">
                  Uptime this month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business-management" className="space-y-4">
          <BusinessManagement />
        </TabsContent>

        <TabsContent value="role-management" className="space-y-4">
          <RoleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};