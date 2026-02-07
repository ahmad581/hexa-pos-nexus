import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useBusinessTypes, useBusinessTypeFeatures } from "@/hooks/useBusinessTypes";

interface AvailableFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface CreateBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBusinessDialog = ({ open, onOpenChange }: CreateBusinessDialogProps) => {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const { user, userProfile, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Fetch business types from database
  const { businessTypes, isLoading: isLoadingTypes } = useBusinessTypes();
  
  // Fetch features for selected business type
  const { features: businessTypeFeatures } = useBusinessTypeFeatures(selectedType);

  // Check both authentication and SystemMaster role
  const isSystemMaster = userProfile?.primary_role === 'SystemMaster';
  const canCreateBusiness = isAuthenticated && user?.id && isSystemMaster;

  // Fetch ALL features so we can show shared features for any business type
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
    enabled: !!canCreateBusiness,
  });

  // Auto-select default features when business type changes
  useEffect(() => {
    if (businessTypeFeatures && businessTypeFeatures.length > 0) {
      const defaultFeatureIds = businessTypeFeatures
        .filter(bf => bf.is_default)
        .map(bf => bf.feature_id);
      setSelectedFeatures(defaultFeatureIds);
    }
  }, [businessTypeFeatures]);

  useEffect(() => {
    if (open) {
      if (!isAuthenticated || !user?.id) {
        toast.error("You must be logged in to create businesses");
      } else if (!isSystemMaster) {
        toast.error("Only SystemMaster accounts can create businesses");
      }
    }
  }, [open, isAuthenticated, user?.id, isSystemMaster]);

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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user?.id) {
        throw new Error("You must be logged in to create a business");
      }
      if (!isSystemMaster) {
        throw new Error("Only SystemMaster accounts can create businesses");
      }

      const selectedBusinessType = businessTypes.find(bt => bt.id === selectedType);
      if (!selectedBusinessType) throw new Error("Business type not found");

      console.log('Creating business with user_id:', user.id);

      // Create the business with terminology from the database
      const { data: business, error: businessError } = await supabase
        .from('custom_businesses')
        .insert({
          user_id: user.id,
          name: businessName,
          business_type: selectedType,
          icon: selectedBusinessType.icon,
          category: selectedBusinessType.category,
          terminology: selectedBusinessType.terminology
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Add features
      if (selectedFeatures.length > 0) {
        const featureInserts = selectedFeatures.map(featureId => ({
          business_id: business.id,
          feature_id: featureId
        }));

        const { error: featuresError } = await supabase
          .from('business_features')
          .insert(featureInserts);

        if (featuresError) throw featuresError;
      }

      return business;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-businesses'] });
      toast.success("Business created successfully!");
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create business error:', error);
      toast.error(error.message || "Failed to create business");
    }
  });

  const resetForm = () => {
    setStep(1);
    setBusinessName("");
    setSelectedType("");
    setSelectedFeatures([]);
  };

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const groupedFeatures = availableFeatures?.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, AvailableFeature[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Business</DialogTitle>
          <DialogDescription>
            Set up a custom business with the features you need
            {(!isAuthenticated || !user?.id) && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                ⚠️ You must be logged in to create businesses
              </div>
            )}
            {isAuthenticated && user?.id && !isSystemMaster && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                ⚠️ Only SystemMaster accounts can create businesses
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-4">
              <Label>Business Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {businessTypes.map((type) => (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all ${
                      selectedType === type.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedType(type.id)}
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

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => setStep(2)}
                disabled={!businessName.trim() || !selectedType || !canCreateBusiness}
              >
                {!isAuthenticated || !user?.id ? "Please log in first" : 
                 !isSystemMaster ? "SystemMaster access required" : 
                 "Next: Select Features"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Select Features for {businessName}</Label>
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

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button 
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !canCreateBusiness}
              >
                {!isAuthenticated || !user?.id ? "Please log in first" : 
                 !isSystemMaster ? "SystemMaster access required" : 
                 createMutation.isPending ? "Creating..." : "Create Business"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};