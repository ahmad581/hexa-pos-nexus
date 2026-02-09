import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Settings, Trash2, Users, BarChart3, Crown, Shield, LogOut, Info, ExternalLink, ArrowLeft, DollarSign, Phone, Pill, UserCheck, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { ClientManagement } from "@/components/ClientManagement";
import { SystemMasterRoleManagement } from "@/components/SystemMasterRoleManagement";
import { useBusinessTypes, useBusinessTypeFeatures } from "@/hooks/useBusinessTypes";

interface AvailableFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

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
  const { userProfile, isAuthenticated, user, userEmail, logout } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const queryClient = useQueryClient();
  
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    business_type: "",
    password: "",
  });
  
  // Telephony provider setup state
  const [telephonySetup, setTelephonySetup] = useState({
    enabled: false,
    provider_type: "twilio" as "twilio" | "sip" | "pbx" | "mock",
    phone_number: "",
    display_name: "",
  });

  // Fetch business types from database
  const { businessTypes, isLoading: isLoadingTypes } = useBusinessTypes();
  
  // Fetch features for selected business type (drives defaults)
  const { features: businessTypeFeatures } = useBusinessTypeFeatures(newClient.business_type);

  // Fetch ALL features so shared features (like Menu Management) can be selected for ANY business type
  const { data: allAvailableFeatures = [] } = useQuery({
    queryKey: ['available-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('available_features')
        .select('id, name, description, icon, category')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return (data || []) as AvailableFeature[];
    },
    enabled: isAuthenticated && userProfile?.primary_role === 'SystemMaster',
  });

  // Auto-select default features when business type changes
  useEffect(() => {
    if (businessTypeFeatures && businessTypeFeatures.length > 0) {
      const defaultFeatureIds = businessTypeFeatures
        .filter(bf => bf.is_default)
        .map(bf => bf.feature_id);
      setSelectedFeatures(defaultFeatureIds);
    } else {
      setSelectedFeatures([]);
    }
  }, [businessTypeFeatures]);

  // Shared feature categories that should be selectable for ALL business types
  const SHARED_CATEGORIES = new Set([
    'operations',
    'hr',
    'analytics',
    'customer service',
    'scheduling',
  ]);

  // Available features = shared features + business-type-specific features (deduped)
  const availableFeatures = (() => {
    const map = new Map<string, AvailableFeature>();

    for (const f of allAvailableFeatures) {
      if (SHARED_CATEGORIES.has((f.category || '').toLowerCase())) {
        map.set(f.id, f);
      }
    }

    for (const bf of businessTypeFeatures || []) {
      const f = bf.available_features as unknown as AvailableFeature;
      if (f?.id) map.set(f.id, f);
    }

    return Array.from(map.values());
  })();

  // Fetch clients from database
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['system-master-clients'],
    queryFn: async () => {
      // Fetch all businesses
      const { data: businesses, error } = await supabase
        .from('custom_businesses')
        .select('id, name, business_type, category, icon, created_at, user_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }

      if (!businesses) return [];

      // Fetch profiles for all user_ids
      const userIds = businesses.map(b => b.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, is_active')
        .in('user_id', userIds);

      // Create a map for quick profile lookup
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      // Fetch branches count and features for each business
      const clientsWithDetails = await Promise.all(
        businesses.map(async (business) => {
          // Get branches count
          const { count: branchesCount } = await supabase
            .from('branches')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', business.id);

          // Get enabled features
          const { data: businessFeatures } = await supabase
            .from('business_features')
            .select(`
              feature_id,
              available_features (
                name
              )
            `)
            .eq('business_id', business.id)
            .eq('is_enabled', true);

          const profile = business.user_id ? profileMap.get(business.user_id) : undefined;
          const ownerName = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email
            : 'Unknown';

          const features = businessFeatures?.map(bf => (bf.available_features as any)?.name).filter(Boolean) || [];

          return {
            id: business.id,
            name: business.name,
            email: profile?.email || '',
            business_type: business.business_type,
            branches_count: branchesCount || 0,
            status: (profile?.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
            created_at: business.created_at,
            owner: ownerName,
            subscription: 'Standard',
            features: features as string[],
          };
        })
      );

      return clientsWithDetails as Client[];
    },
    enabled: isAuthenticated && userProfile?.primary_role === 'SystemMaster',
  });

  // Fetch analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['system-analytics'],
    queryFn: async () => {
      // Get total businesses count
      const { count: totalBusinesses } = await supabase
        .from('custom_businesses')
        .select('*', { count: 'exact', head: true });

      // Get active businesses (based on profile is_active)
      const { data: businessesWithProfiles } = await supabase
        .from('custom_businesses')
        .select('user_id, profiles!inner(is_active)');
      
      const activeCount = businessesWithProfiles?.filter(
        (b: any) => b.profiles?.is_active === true
      ).length || 0;

      // Get total branches count
      const { count: totalBranches } = await supabase
        .from('branches')
        .select('*', { count: 'exact', head: true });

      // Get employees count
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get orders count for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: ordersThisMonth } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Get total revenue this month
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startOfMonth.toISOString())
        .eq('payment_status', 'paid');

      const revenueThisMonth = ordersData?.reduce(
        (sum, order) => sum + (Number(order.total_amount) || 0), 
        0
      ) || 0;

      // Pharmacy stats
      const { count: totalPrescriptions } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      const { count: activePrescriptions } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['received', 'verified', 'processing', 'ready']);

      const { count: totalPatients } = await supabase
        .from('pharmacy_patients')
        .select('*', { count: 'exact', head: true });

      const { count: checkoutsThisMonth } = await supabase
        .from('pharmacy_checkout')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      return {
        totalBusinesses: totalBusinesses || 0,
        activeBusinesses: activeCount,
        totalBranches: totalBranches || 0,
        totalEmployees: totalEmployees || 0,
        ordersThisMonth: ordersThisMonth || 0,
        revenueThisMonth,
        totalPrescriptions: totalPrescriptions || 0,
        activePrescriptions: activePrescriptions || 0,
        totalPatients: totalPatients || 0,
        checkoutsThisMonth: checkoutsThisMonth || 0,
      };
    },
    enabled: isAuthenticated && userProfile?.primary_role === 'SystemMaster'
  });

  const createClientMutation = useMutation({
    mutationFn: async () => {
      if (!newClient.name || !newClient.email || !newClient.business_type || !newClient.password) {
        throw new Error("All fields are required");
      }

      const selectedBusinessType = businessTypes.find(bt => bt.id === newClient.business_type);
      if (!selectedBusinessType) throw new Error("Business type not found");

      // Prepare telephony provider data if enabled
      const telephony_provider = telephonySetup.enabled ? {
        type: telephonySetup.provider_type,
        display_name: `${telephonySetup.provider_type.charAt(0).toUpperCase() + telephonySetup.provider_type.slice(1)} Provider`,
        config: {},
      } : undefined;

      const phone_number = telephonySetup.enabled && telephonySetup.phone_number ? {
        number: telephonySetup.phone_number,
        display_name: telephonySetup.display_name || 'Primary Number',
        capabilities: ['inbound', 'outbound'],
      } : undefined;

      // Call edge function to create client with all related data
      const { data, error } = await supabase.functions.invoke('create-client', {
        body: {
          name: newClient.name,
          email: newClient.email,
          password: newClient.password,
          business_type: newClient.business_type,
          icon: selectedBusinessType.icon,
          category: selectedBusinessType.category,
          terminology: selectedBusinessType.terminology,
          features: selectedFeatures,
          telephony_provider,
          phone_number,
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create client');

      return {
        id: data.user.id,
        name: newClient.name,
        email: newClient.email,
        business_type: newClient.business_type,
        branches_count: 0,
        status: 'active' as const,
        created_at: new Date().toISOString(),
        owner: newClient.name,
        subscription: 'Standard',
        features: selectedFeatures.map(fId => {
          const feature = availableFeatures?.find(f => f.id === fId);
          return feature?.name || '';
        }).filter(Boolean)
      };
    },
    onSuccess: () => {
      toast.success("Client and business created successfully!");
      queryClient.invalidateQueries({ queryKey: ['system-master-clients'] });
      queryClient.invalidateQueries({ queryKey: ['custom-businesses'] });
      setIsDialogOpen(false);
      setDialogStep(1);
      setNewClient({ name: "", email: "", business_type: "", password: "" });
      setSelectedFeatures([]);
      setTelephonySetup({ enabled: false, provider_type: "twilio", phone_number: "", display_name: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create client");
      console.error('Create client error:', error);
    }
  });

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Features are now directly from the business type - no filtering needed
  const groupedFeatures = availableFeatures?.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, AvailableFeature[]>);

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

  // Create dynamic business type labels from database
  const getBusinessTypeLabel = (typeId: string) => {
    const bt = businessTypes.find(t => t.id === typeId);
    return bt?.name || typeId;
  };

  // Debug logging
  console.log('SystemMaster Dashboard Auth Check:', {
    isAuthenticated,
    userId: user?.id,
    userEmail: userEmail,
    userProfile: userProfile,
    primaryRole: userProfile?.primary_role
  });

  const isSystemMasterAccess = userProfile?.primary_role === 'SystemMaster';
  
  // Show loading while profile is being fetched
  if (isAuthenticated && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p>Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!isAuthenticated || !isSystemMasterAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              {!isAuthenticated ? 
                "Please log in to access the SystemMaster dashboard" : 
                "Only SystemMaster accounts can access this dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/login'}>
              {!isAuthenticated ? "Go to Login" : "Back to Login"}
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
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setDialogStep(1);
              setNewClient({ name: "", email: "", business_type: "", password: "" });
              setSelectedFeatures([]);
              setTelephonySetup({ enabled: false, provider_type: "twilio", phone_number: "", display_name: "" });
            }
          }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Client & Business</DialogTitle>
              <DialogDescription>
                {dialogStep === 1 ? "Enter client details and select business type" : 
                 dialogStep === 2 ? "Select features for the business" :
                 dialogStep === 3 ? "Configure telephony for the call center" :
                 "Review and create"}
              </DialogDescription>
            </DialogHeader>
            
            {dialogStep === 1 && (
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
                  <Label htmlFor="client-password">Password</Label>
                  <Input
                    id="client-password"
                    type="password"
                    placeholder="Enter password for client"
                    value={newClient.password}
                    onChange={(e) => setNewClient(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-4">
                  <Label>Business Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {businessTypes.map((type) => (
                      <Card 
                        key={type.id}
                        className={`cursor-pointer transition-all ${
                          newClient.business_type === type.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setNewClient(prev => ({ ...prev, business_type: type.id }))}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl mb-2">{type.icon}</div>
                          <div className="font-medium text-sm">{type.name}</div>
                          <div className="text-xs text-muted-foreground">{type.category}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {dialogStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label>Select Features for {newClient.name}</Label>
                    <Badge variant="secondary">{selectedFeatures.length} selected</Badge>
                  </div>
                  
                  {groupedFeatures && Object.entries(groupedFeatures).map(([category, features]) => (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{category}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {features.map((feature) => (
                          <div key={feature.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={feature.id}
                              checked={selectedFeatures.includes(feature.id)}
                              onCheckedChange={() => handleFeatureToggle(feature.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <Label 
                                htmlFor={feature.id}
                                className="text-sm font-medium cursor-pointer flex items-center gap-2"
                              >
                                <span>{feature.icon}</span>
                                {feature.name}
                              </Label>
                              <p className="text-xs text-muted-foreground mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {dialogStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telephony Provider Setup
                    </CardTitle>
                    <CardDescription>
                      Configure call center capabilities for this business
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="enable-telephony"
                        checked={telephonySetup.enabled}
                        onCheckedChange={(checked) => setTelephonySetup(prev => ({ ...prev, enabled: !!checked }))}
                      />
                      <Label htmlFor="enable-telephony" className="cursor-pointer">
                        Enable Call Center / Telephony
                      </Label>
                    </div>

                    {telephonySetup.enabled && (
                      <>
                        <div className="grid gap-2">
                          <Label>Provider Type</Label>
                          <Select
                            value={telephonySetup.provider_type}
                            onValueChange={(value: "twilio" | "sip" | "pbx" | "mock") => 
                              setTelephonySetup(prev => ({ ...prev, provider_type: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="twilio">Twilio (Cloud)</SelectItem>
                              <SelectItem value="sip">SIP Trunk (On-Premise)</SelectItem>
                              <SelectItem value="pbx">PBX (Asterisk/FreePBX)</SelectItem>
                              <SelectItem value="mock">Mock (Testing)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            {telephonySetup.provider_type === 'twilio' && "Cloud-based telephony via Twilio"}
                            {telephonySetup.provider_type === 'sip' && "Connect to existing SIP trunk or provider"}
                            {telephonySetup.provider_type === 'pbx' && "Connect to on-premise PBX system"}
                            {telephonySetup.provider_type === 'mock' && "For testing - no actual calls"}
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="phone-number">Business Phone Number</Label>
                          <Input
                            id="phone-number"
                            placeholder="+1234567890"
                            value={telephonySetup.phone_number}
                            onChange={(e) => setTelephonySetup(prev => ({ ...prev, phone_number: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">
                            The main phone number for this business (can be configured later)
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="phone-display-name">Display Name (optional)</Label>
                          <Input
                            id="phone-display-name"
                            placeholder="Main Office Line"
                            value={telephonySetup.display_name}
                            onChange={(e) => setTelephonySetup(prev => ({ ...prev, display_name: e.target.value }))}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            <DialogFooter>
              {dialogStep === 2 && (
                <Button variant="outline" onClick={() => setDialogStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {dialogStep === 3 && (
                <Button variant="outline" onClick={() => setDialogStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              {dialogStep === 1 && (
                <Button 
                  onClick={() => setDialogStep(2)}
                  disabled={!newClient.name || !newClient.email || !newClient.password || !newClient.business_type}
                >
                  Next: Select Features
                </Button>
              )}
              {dialogStep === 2 && (
                <Button 
                  onClick={() => {
                    // Only show telephony step if call-center feature is selected
                    if (selectedFeatures.includes('call-center')) {
                      setDialogStep(3);
                    } else {
                      createClientMutation.mutate();
                    }
                  }}
                  disabled={createClientMutation.isPending}
                >
                  {selectedFeatures.includes('call-center') 
                    ? "Next: Telephony Setup" 
                    : createClientMutation.isPending 
                      ? "Creating..." 
                      : "Create Client & Business"}
                </Button>
              )}
              {dialogStep === 3 && (
                <Button 
                  onClick={() => createClientMutation.mutate()}
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? "Creating..." : "Create Client & Business"}
                </Button>
              )}
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
                  <p className="text-base">{getBusinessTypeLabel(selectedClient.business_type)}</p>
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
            Client Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            System Analytics
          </TabsTrigger>
          <TabsTrigger value="role-management" className="gap-2">
            <Shield className="w-4 h-4" />
            Role Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <ClientManagement clients={clients} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.totalBusinesses || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Registered businesses
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
                  {analyticsData?.activeBusinesses || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.totalBusinesses 
                    ? Math.round((analyticsData.activeBusinesses / analyticsData.totalBusinesses) * 100)
                    : 0}% active rate
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
                  {analyticsData?.totalBranches || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all clients
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.totalEmployees || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active staff members
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders This Month</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.ordersThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total orders placed
                </p>
              </CardContent>
            </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analyticsData?.revenueThisMonth?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  From paid orders
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pharmacy Analytics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prescriptions This Month</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.totalPrescriptions || 0}</div>
                <p className="text-xs text-muted-foreground">Total prescriptions received</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
                <Pill className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.activePrescriptions || 0}</div>
                <p className="text-xs text-muted-foreground">In progress or ready</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.totalPatients || 0}</div>
                <p className="text-xs text-muted-foreground">Registered patients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Checkouts This Month</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.checkoutsThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">Completed transactions</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="role-management" className="space-y-4">
          <SystemMasterRoleManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};