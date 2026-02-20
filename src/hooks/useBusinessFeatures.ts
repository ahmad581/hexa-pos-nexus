import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface BusinessFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

// Map feature IDs to route paths and permissions
const FEATURE_ROUTE_MAP: Record<string, string[]> = {
  'menu-management': ['/menu'],
  'table-management': ['/tables'],
  'order-management': ['/orders'],
  'inventory-management': ['/inventory', '/retail-inventory', '/grocery-inventory'],
  'employee-management': ['/employees'],
  'analytics-reporting': ['/analytics'],
  'call-center': ['/call-center'],
  'room-management': ['/rooms'],
  'hotel-services': ['/hotel-services'],
  'appointment-scheduling': ['/appointments', '/pet-appointments'],
  'stylist-management': ['/stylists', '/salon-services', '/salon-clients'],
  'product-management': ['/products', '/retail-pos', '/retail-orders', '/retail-customers', '/retail-returns'],
  'prescription-management': ['/prescriptions', '/pharmacy-patients', '/pharmacy-pos'],
  'member-management': ['/members'],
  'membership-plans': ['/membership-plans'],
  'check-in-system': ['/check-ins'],
  'class-management': ['/classes', '/class-registrations'],
  'equipment-management': ['/equipment'],
  'trainer-management': ['/trainers'],
  'visit-history': ['/visit-history'],
  'service-management': ['/auto-services'],
  'billing-payments': ['/billing'],
  'member-engagement': ['/member-engagement'],
  'qr-checkin': ['/check-ins'],
  'class-management-registrations': ['/class-registrations'],
};

export const useBusinessFeatures = () => {
  const { userProfile, isAuthenticated, user } = useAuth();

  const { data: enabledFeatures = [], isLoading } = useQuery({
    queryKey: ['business-features', userProfile?.business_id, user?.id],
    queryFn: async () => {
      if (!userProfile?.business_id) return [];

      const { data, error } = await supabase
        .from('business_features')
        .select(`
          feature_id,
          available_features (
            id,
            name,
            description,
            icon,
            category
          )
        `)
        .eq('business_id', userProfile.business_id)
        .eq('is_enabled', true);

      if (error) throw error;

      return data?.map(bf => bf.available_features as BusinessFeature).filter(Boolean) || [];
    },
    enabled: isAuthenticated && !!userProfile?.business_id,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const hasFeatureAccess = (featureId: string): boolean => {
    // SystemMaster has access to everything
    if (userProfile?.primary_role === 'SystemMaster' || user?.email === 'ahmadalodat530@gmail.com') {
      return true;
    }

    // If no business_id, user has access to all (legacy users or demo mode)
    if (!userProfile?.business_id) {
      return true;
    }

    // Check if feature is in enabled features
    return enabledFeatures.some(f => f.id === featureId);
  };

  const hasRouteAccess = (route: string): boolean => {
    // SystemMaster has access to everything
    if (userProfile?.primary_role === 'SystemMaster' || user?.email === 'ahmadalodat530@gmail.com') {
      return true;
    }

    // If no business_id, user has access to all (legacy users or demo mode)
    if (!userProfile?.business_id) {
      return true;
    }

    // Always allow access to dashboard and settings
    if (route === '/' || route === '/settings') {
      return true;
    }

    // Check if any enabled feature grants access to this route
    for (const feature of enabledFeatures) {
      const allowedRoutes = FEATURE_ROUTE_MAP[feature.id] || [];
      if (allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute))) {
        return true;
      }
    }

    return false;
  };

  return {
    enabledFeatures,
    isLoading,
    hasFeatureAccess,
    hasRouteAccess,
  };
};
