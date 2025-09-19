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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

const businessTypes = [
  { id: 'restaurant', name: 'Restaurant', icon: '🍽️', category: 'Food & Beverage' },
  { id: 'hotel', name: 'Hotel', icon: '🏨', category: 'Hospitality' },
  { id: 'hair-salon', name: 'Hair Salon', icon: '💇', category: 'Beauty & Wellness' },
  { id: 'medical-clinic', name: 'Medical Clinic', icon: '🏥', category: 'Healthcare' },
  { id: 'retail-store', name: 'Retail Store', icon: '🛍️', category: 'Retail' },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊', category: 'Healthcare' },
  { id: 'grocery', name: 'Grocery Store', icon: '🛒', category: 'Retail' },
  { id: 'gym', name: 'Gym & Fitness', icon: '💪', category: 'Health & Fitness' },
  { id: 'auto-repair', name: 'Auto Repair', icon: '🔧', category: 'Automotive' },
  { id: 'pet-care', name: 'Pet Care', icon: '🐾', category: 'Pet Services' },
];

export const CreateBusinessDialog = ({ open, onOpenChange }: CreateBusinessDialogProps) => {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Debug authentication status
  useEffect(() => {
    if (open) {
      console.log('CreateBusinessDialog opened, user:', user?.id ? 'authenticated' : 'not authenticated');
      if (!user?.id) {
        toast.error("Please log in to create a business");
      }
    }
  }, [open, user]);

  const { data: availableFeatures } = useQuery({
    queryKey: ['available-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('available_features')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      return data as AvailableFeature[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User must be authenticated to create a business");
      }

      const selectedBusinessType = businessTypes.find(bt => bt.id === selectedType);
      if (!selectedBusinessType) throw new Error("Business type not found");

      // Create the business
      const { data: business, error: businessError } = await supabase
        .from('custom_businesses')
        .insert({
          user_id: user.id,
          name: businessName,
          business_type: selectedType,
          icon: selectedBusinessType.icon,
          category: selectedBusinessType.category,
          terminology: {
            branch: "Branch",
            branches: "Branches",
            unit: "Unit",
            units: "Units",
            customer: "Customer",
            customers: "Customers",
            service: "Service",
            services: "Services"
          }
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
            {!user?.id && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                ⚠️ Please log in first to create a business
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
                disabled={!businessName.trim() || !selectedType || !user?.id}
              >
                {!user?.id ? "Please login first" : "Next: Select Features"}
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
                disabled={createMutation.isPending || !user?.id}
              >
                {!user?.id ? "Please login first" : createMutation.isPending ? "Creating..." : "Create Business"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};