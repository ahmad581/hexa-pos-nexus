import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { TelephonyProvider, BusinessPhoneNumber, TelephonyProviderType } from "@/types/telephony";
import { Json } from "@/integrations/supabase/types";

// Helper type for database operations
type DbTelephonyProvider = {
  business_id: string;
  provider_type: string;
  display_name: string;
  config?: Json;
  is_active?: boolean;
  is_default?: boolean;
  webhook_mode?: string;
};

type DbPhoneNumber = {
  business_id: string;
  provider_id: string;
  phone_number: string;
  display_name?: string | null;
  is_default?: boolean;
  capabilities?: string[];
  external_id?: string | null;
  is_active?: boolean;
};

export const useTelephonyProviders = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const businessId = userProfile?.business_id;

  // Fetch telephony providers
  const { data: providers = [], isLoading: isLoadingProviders } = useQuery({
    queryKey: ['telephony-providers', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('telephony_providers')
        .select('*')
        .eq('business_id', businessId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as TelephonyProvider[];
    },
    enabled: !!businessId,
  });

  // Fetch business phone numbers
  const { data: phoneNumbers = [], isLoading: isLoadingNumbers } = useQuery({
    queryKey: ['business-phone-numbers', businessId],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('business_phone_numbers')
        .select('*')
        .eq('business_id', businessId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      return data as BusinessPhoneNumber[];
    },
    enabled: !!businessId,
  });

  // Get default provider
  const defaultProvider = providers.find(p => p.is_default && p.is_active);
  
  // Get default phone number
  const defaultPhoneNumber = phoneNumbers.find(n => n.is_default && n.is_active);
  
  // Get outbound capable numbers
  const outboundNumbers = phoneNumbers.filter(n => 
    n.is_active && n.capabilities?.includes('outbound')
  );

  // Create telephony provider
  const createProviderMutation = useMutation({
    mutationFn: async (provider: Omit<TelephonyProvider, 'id' | 'created_at' | 'updated_at'>) => {
      const dbProvider: DbTelephonyProvider = {
        business_id: provider.business_id,
        provider_type: provider.provider_type,
        display_name: provider.display_name,
        config: provider.config as Json,
        is_active: provider.is_active,
        is_default: provider.is_default,
        webhook_mode: provider.webhook_mode,
      };
      
      const { data, error } = await supabase
        .from('telephony_providers')
        .insert(dbProvider)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telephony-providers', businessId] });
      toast({ title: 'Telephony provider created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update telephony provider
  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TelephonyProvider> & { id: string }) => {
      const dbUpdates: Partial<DbTelephonyProvider> = {
        ...(updates.business_id && { business_id: updates.business_id }),
        ...(updates.provider_type && { provider_type: updates.provider_type }),
        ...(updates.display_name && { display_name: updates.display_name }),
        ...(updates.config && { config: updates.config as Json }),
        ...(updates.is_active !== undefined && { is_active: updates.is_active }),
        ...(updates.is_default !== undefined && { is_default: updates.is_default }),
        ...(updates.webhook_mode && { webhook_mode: updates.webhook_mode }),
      };
      
      const { data, error } = await supabase
        .from('telephony_providers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telephony-providers', businessId] });
      toast({ title: 'Provider updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Create phone number
  const createPhoneNumberMutation = useMutation({
    mutationFn: async (phoneNumber: Omit<BusinessPhoneNumber, 'id' | 'created_at' | 'updated_at'>) => {
      const dbPhoneNumber: DbPhoneNumber = {
        business_id: phoneNumber.business_id,
        provider_id: phoneNumber.provider_id,
        phone_number: phoneNumber.phone_number,
        display_name: phoneNumber.display_name,
        is_default: phoneNumber.is_default,
        capabilities: phoneNumber.capabilities as string[],
        external_id: phoneNumber.external_id,
        is_active: phoneNumber.is_active,
      };
      
      const { data, error } = await supabase
        .from('business_phone_numbers')
        .insert(dbPhoneNumber)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-phone-numbers', businessId] });
      toast({ title: 'Phone number added' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update phone number
  const updatePhoneNumberMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BusinessPhoneNumber> & { id: string }) => {
      const dbUpdates: Partial<DbPhoneNumber> = {
        ...(updates.business_id && { business_id: updates.business_id }),
        ...(updates.provider_id && { provider_id: updates.provider_id }),
        ...(updates.phone_number && { phone_number: updates.phone_number }),
        ...(updates.display_name !== undefined && { display_name: updates.display_name }),
        ...(updates.is_default !== undefined && { is_default: updates.is_default }),
        ...(updates.capabilities && { capabilities: updates.capabilities as string[] }),
        ...(updates.external_id !== undefined && { external_id: updates.external_id }),
        ...(updates.is_active !== undefined && { is_active: updates.is_active }),
      };
      
      const { data, error } = await supabase
        .from('business_phone_numbers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-phone-numbers', businessId] });
      toast({ title: 'Phone number updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Set default provider
  const setDefaultProvider = async (providerId: string) => {
    // First, unset all as default
    await supabase
      .from('telephony_providers')
      .update({ is_default: false })
      .eq('business_id', businessId);
    
    // Set new default
    await supabase
      .from('telephony_providers')
      .update({ is_default: true })
      .eq('id', providerId);
    
    queryClient.invalidateQueries({ queryKey: ['telephony-providers', businessId] });
    toast({ title: 'Default provider updated' });
  };

  // Set default phone number
  const setDefaultPhoneNumber = async (phoneNumberId: string) => {
    // First, unset all as default
    await supabase
      .from('business_phone_numbers')
      .update({ is_default: false })
      .eq('business_id', businessId);
    
    // Set new default
    await supabase
      .from('business_phone_numbers')
      .update({ is_default: true })
      .eq('id', phoneNumberId);
    
    queryClient.invalidateQueries({ queryKey: ['business-phone-numbers', businessId] });
    toast({ title: 'Default phone number updated' });
  };

  return {
    providers,
    phoneNumbers,
    defaultProvider,
    defaultPhoneNumber,
    outboundNumbers,
    isLoading: isLoadingProviders || isLoadingNumbers,
    createProvider: createProviderMutation.mutate,
    updateProvider: updateProviderMutation.mutate,
    createPhoneNumber: createPhoneNumberMutation.mutate,
    updatePhoneNumber: updatePhoneNumberMutation.mutate,
    setDefaultProvider,
    setDefaultPhoneNumber,
    isCreatingProvider: createProviderMutation.isPending,
    isUpdatingProvider: updateProviderMutation.isPending,
    isCreatingNumber: createPhoneNumberMutation.isPending,
    isUpdatingNumber: updatePhoneNumberMutation.isPending,
  };
};
