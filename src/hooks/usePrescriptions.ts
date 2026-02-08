import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/components/ui/use-toast";

export type PrescriptionStatus = "received" | "verified" | "processing" | "ready" | "dispensed" | "cancelled";
export type PrescriptionType = "new" | "refill" | "transfer" | "compound" | "controlled";

export interface Prescription {
  id: string;
  branch_id: string;
  business_id?: string;
  patient_id?: string;
  patient_name: string;
  patient_phone?: string;
  doctor_name?: string;
  medication_name: string;
  dosage?: string;
  quantity: number;
  status: PrescriptionStatus;
  prescription_number?: string;
  instructions?: string;
  filled_date?: string;
  prescription_type?: PrescriptionType;
  refills_remaining?: number;
  refills_total?: number;
  is_controlled_substance?: boolean;
  schedule?: string;
  verified_by?: string;
  verified_at?: string;
  dispensed_by?: string;
  dispensed_at?: string;
  copay_amount?: number;
  insurance_billed?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined patient data
  pharmacy_patients?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    insurance_provider?: string;
    insurance_id?: string;
    allergies?: string[];
  };
}

export interface CreatePrescriptionInput {
  patient_id?: string;
  patient_name: string;
  patient_phone?: string;
  doctor_name?: string;
  medication_name: string;
  dosage?: string;
  quantity: number;
  instructions?: string;
  prescription_type?: PrescriptionType;
  refills_total?: number;
  is_controlled_substance?: boolean;
  schedule?: string;
  copay_amount?: number;
}

export const usePrescriptions = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: prescriptions = [], isLoading, error } = useQuery({
    queryKey: ["prescriptions", selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          pharmacy_patients (
            id,
            first_name,
            last_name,
            phone,
            insurance_provider,
            insurance_id,
            allergies
          )
        `)
        .eq("branch_id", selectedBranch.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Prescription[];
    },
    enabled: !!selectedBranch?.id,
  });

  const createPrescription = useMutation({
    mutationFn: async (input: CreatePrescriptionInput) => {
      if (!selectedBranch?.id) throw new Error("No branch selected");

      const prescriptionNumber = `RX${Date.now().toString().slice(-8)}`;

      const { data, error } = await supabase
        .from("prescriptions")
        .insert({
          branch_id: selectedBranch.id,
          patient_id: input.patient_id,
          patient_name: input.patient_name,
          patient_phone: input.patient_phone,
          doctor_name: input.doctor_name,
          medication_name: input.medication_name,
          dosage: input.dosage,
          quantity: input.quantity,
          instructions: input.instructions,
          prescription_number: prescriptionNumber,
          status: "received",
          prescription_type: input.prescription_type || "new",
          refills_remaining: input.refills_total || 0,
          refills_total: input.refills_total || 0,
          is_controlled_substance: input.is_controlled_substance || false,
          schedule: input.schedule,
          copay_amount: input.copay_amount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast({ title: "Prescription created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create prescription", description: error.message, variant: "destructive" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, additionalData = {} }: { 
      id: string; 
      status: PrescriptionStatus;
      additionalData?: Partial<Prescription>;
    }) => {
      const updateData: Record<string, unknown> = { status, ...additionalData };

      if (status === "dispensed") {
        updateData.dispensed_at = new Date().toISOString();
        updateData.filled_date = new Date().toISOString().split("T")[0];
      }

      if (status === "verified") {
        updateData.verified_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("prescriptions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast({ title: `Prescription ${variables.status}` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update prescription", description: error.message, variant: "destructive" });
    },
  });

  const fillPrescription = (id: string) => updateStatus.mutate({ id, status: "ready" });
  const dispensePrescription = (id: string) => updateStatus.mutate({ id, status: "dispensed" });
  const verifyPrescription = (id: string) => updateStatus.mutate({ id, status: "verified" });
  const startProcessing = (id: string) => updateStatus.mutate({ id, status: "processing" });
  const cancelPrescription = (id: string) => updateStatus.mutate({ id, status: "cancelled" });

  const requestRefill = useMutation({
    mutationFn: async (prescriptionId: string) => {
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) throw new Error("Prescription not found");
      if ((prescription.refills_remaining || 0) <= 0) throw new Error("No refills remaining");

      const { data, error } = await supabase
        .from("prescriptions")
        .update({
          status: "received",
          refills_remaining: (prescription.refills_remaining || 0) - 1,
          prescription_type: "refill",
        })
        .eq("id", prescriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      toast({ title: "Refill requested successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to request refill", description: error.message, variant: "destructive" });
    },
  });

  return {
    prescriptions,
    isLoading,
    error,
    createPrescription,
    updateStatus,
    fillPrescription,
    dispensePrescription,
    verifyPrescription,
    startProcessing,
    cancelPrescription,
    requestRefill,
  };
};
