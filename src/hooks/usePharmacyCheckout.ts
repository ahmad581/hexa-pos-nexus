import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/components/ui/use-toast";

export interface PharmacyCheckout {
  id: string;
  branch_id: string;
  business_id?: string;
  patient_id?: string;
  prescription_ids: string[];
  subtotal: number;
  insurance_covered: number;
  copay: number;
  otc_items_total: number;
  total: number;
  payment_method?: string;
  payment_status: string;
  counseling_acknowledged: boolean;
  created_at?: string;
}

export interface CreateCheckoutInput {
  patient_id?: string;
  prescription_ids: string[];
  subtotal: number;
  insurance_covered?: number;
  copay?: number;
  otc_items_total?: number;
  total: number;
  payment_method?: string;
  counseling_acknowledged?: boolean;
}

export const usePharmacyCheckout = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: checkouts = [], isLoading, error } = useQuery({
    queryKey: ["pharmacy_checkout", selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];

      const { data, error } = await supabase
        .from("pharmacy_checkout")
        .select(`
          *,
          pharmacy_patients (
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .eq("branch_id", selectedBranch.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedBranch?.id,
  });

  const createCheckout = useMutation({
    mutationFn: async (input: CreateCheckoutInput) => {
      if (!selectedBranch?.id) throw new Error("No branch selected");

      const { data, error } = await supabase
        .from("pharmacy_checkout")
        .insert({
          branch_id: selectedBranch.id,
          patient_id: input.patient_id,
          prescription_ids: input.prescription_ids,
          subtotal: input.subtotal,
          insurance_covered: input.insurance_covered || 0,
          copay: input.copay || 0,
          otc_items_total: input.otc_items_total || 0,
          total: input.total,
          payment_method: input.payment_method,
          payment_status: "completed",
          counseling_acknowledged: input.counseling_acknowledged || false,
        })
        .select()
        .single();

      if (error) throw error;

      // Mark all prescriptions as dispensed
      for (const prescriptionId of input.prescription_ids) {
        await supabase
          .from("prescriptions")
          .update({
            status: "dispensed",
            dispensed_at: new Date().toISOString(),
            filled_date: new Date().toISOString().split("T")[0],
          })
          .eq("id", prescriptionId);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy_checkout"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast({ title: "Checkout completed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to complete checkout", description: error.message, variant: "destructive" });
    },
  });

  const getTodayCheckouts = () => {
    const today = new Date().toISOString().split("T")[0];
    return checkouts.filter(c => c.created_at?.startsWith(today));
  };

  const getTotalRevenue = () => {
    return checkouts.reduce((sum, c) => sum + (c.total || 0), 0);
  };

  return {
    checkouts,
    isLoading,
    error,
    createCheckout,
    getTodayCheckouts,
    getTotalRevenue,
  };
};
