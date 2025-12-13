import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  category: string;
  terminology: {
    branch: string;
    branches: string;
    unit: string;
    units: string;
    customer: string;
    customers: string;
    service: string;
    services: string;
  };
  is_active: boolean;
}

export interface BusinessTypeFeature {
  id: string;
  business_type_id: string;
  feature_id: string;
  is_default: boolean;
}

export const useBusinessTypes = () => {
  const { data: businessTypes = [], isLoading, error } = useQuery({
    queryKey: ['business-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_types')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      
      return data.map(bt => ({
        ...bt,
        terminology: bt.terminology as BusinessType['terminology']
      })) as BusinessType[];
    }
  });

  return { businessTypes, isLoading, error };
};

export const useBusinessTypeFeatures = (businessTypeId?: string) => {
  const { data: features = [], isLoading, error } = useQuery({
    queryKey: ['business-type-features', businessTypeId],
    queryFn: async () => {
      if (!businessTypeId) return [];
      
      const { data, error } = await supabase
        .from('business_type_features')
        .select(`
          id,
          business_type_id,
          feature_id,
          is_default,
          available_features (
            id,
            name,
            description,
            icon,
            category
          )
        `)
        .eq('business_type_id', businessTypeId);

      if (error) throw error;
      return data;
    },
    enabled: !!businessTypeId
  });

  return { features, isLoading, error };
};
