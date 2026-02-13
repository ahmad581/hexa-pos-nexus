import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "sonner";

export interface RetailProduct {
  id: string;
  business_id: string;
  branch_id: string;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  category: string;
  brand: string | null;
  cost_price: number;
  selling_price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  stock_quantity: number;
  min_stock: number;
  size: string | null;
  color: string | null;
  material: string | null;
  weight: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RetailProductInsert = Omit<RetailProduct, 'id' | 'created_at' | 'updated_at'>;

export const useRetailProducts = () => {
  const { userProfile } = useAuth();
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const businessId = userProfile?.business_id;
  const branchId = selectedBranch?.id;

  const query = useQuery({
    queryKey: ['retail-products', businessId, branchId],
    queryFn: async () => {
      let q = supabase
        .from('retail_products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (businessId) q = q.eq('business_id', businessId);
      if (branchId) q = q.eq('branch_id', branchId);

      const { data, error } = await q;
      if (error) throw error;
      return data as RetailProduct[];
    },
    enabled: !!businessId,
  });

  const createProduct = useMutation({
    mutationFn: async (product: RetailProductInsert) => {
      const { data, error } = await supabase
        .from('retail_products')
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-products'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RetailProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from('retail_products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('retail_products')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retail-products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => toast.error(error.message),
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
