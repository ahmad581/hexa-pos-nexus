import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranch } from "@/contexts/BranchContext";
import { toast } from "@/components/ui/use-toast";

export interface PharmacyPatient {
  id: string;
  branch_id: string;
  business_id?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  address?: string;
  allergies?: string[];
  conditions?: string[];
  insurance_provider?: string;
  insurance_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePatientInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  address?: string;
  allergies?: string[];
  conditions?: string[];
  insurance_provider?: string;
  insurance_id?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export const usePharmacyPatients = () => {
  const { selectedBranch } = useBranch();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: ["pharmacy_patients", selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];

      const { data, error } = await supabase
        .from("pharmacy_patients")
        .select("*")
        .eq("branch_id", selectedBranch.id)
        .order("last_name", { ascending: true });

      if (error) throw error;
      return data as PharmacyPatient[];
    },
    enabled: !!selectedBranch?.id,
  });

  const createPatient = useMutation({
    mutationFn: async (input: CreatePatientInput) => {
      if (!selectedBranch?.id) throw new Error("No branch selected");

      const { data, error } = await supabase
        .from("pharmacy_patients")
        .insert({
          branch_id: selectedBranch.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy_patients"] });
      toast({ title: "Patient created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create patient", description: error.message, variant: "destructive" });
    },
  });

  const updatePatient = useMutation({
    mutationFn: async ({ id, ...input }: Partial<PharmacyPatient> & { id: string }) => {
      const { data, error } = await supabase
        .from("pharmacy_patients")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy_patients"] });
      toast({ title: "Patient updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update patient", description: error.message, variant: "destructive" });
    },
  });

  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pharmacy_patients")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy_patients"] });
      toast({ title: "Patient deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete patient", description: error.message, variant: "destructive" });
    },
  });

  const searchPatients = async (query: string) => {
    if (!selectedBranch?.id || !query.trim()) return [];

    const { data, error } = await supabase
      .from("pharmacy_patients")
      .select("*")
      .eq("branch_id", selectedBranch.id)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data as PharmacyPatient[];
  };

  const getPatientById = async (id: string) => {
    const { data, error } = await supabase
      .from("pharmacy_patients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as PharmacyPatient;
  };

  const getPatientPrescriptions = async (patientId: string) => {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  return {
    patients,
    isLoading,
    error,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    getPatientById,
    getPatientPrescriptions,
  };
};
