import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, Trash2 } from "lucide-react";
import { CreateBusinessDialog } from "@/components/CreateBusinessDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CustomBusiness {
  id: string;
  name: string;
  business_type: string;
  icon: string;
  category: string;
  terminology: any;
  created_at: string;
  features: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  }>;
}

export const BusinessManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ['custom-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_businesses')
        .select(`
          *,
          business_features (
            available_features (
              id, name, description, icon, category
            )
          )
        `)
        .eq('user_id', userProfile?.id);

      if (error) throw error;

      return data?.map(business => ({
        ...business,
        features: business.business_features?.map(bf => bf.available_features).filter(Boolean) || []
      })) as CustomBusiness[];
    },
    enabled: !!userProfile?.id
  });

  const deleteMutation = useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase
        .from('custom_businesses')
        .delete()
        .eq('id', businessId)
        .eq('user_id', userProfile?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-businesses'] });
      toast.success("Business deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete business");
      console.error(error);
    }
  });

  if (isLoading) {
    return <div className="p-6">Loading businesses...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Business Management</h1>
          <p className="text-muted-foreground">
            Create and manage your custom business configurations
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Business
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses?.map((business) => (
          <Card key={business.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{business.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <CardDescription>{business.category}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteMutation.mutate(business.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {business.features.map((feature) => (
                      <Badge key={feature.id} variant="secondary" className="text-xs">
                        {feature.icon} {feature.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Created {new Date(business.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!businesses || businesses.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">No businesses yet</h3>
                <p className="text-muted-foreground">
                  Create your first custom business to get started
                </p>
                <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Business
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateBusinessDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};