import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useBusinessFeatures } from "@/hooks/useBusinessFeatures";
import { useTranslation } from "@/contexts/TranslationContext";
import { Loader2 } from "lucide-react";

// Analytics components
import {
  OrdersAnalytics,
  InventoryAnalytics,
  EmployeeAnalytics,
  CallCenterAnalytics,
  MenuAnalytics,
  TablesAnalytics,
  AppointmentsAnalytics,
  MembersAnalytics,
  ProductsAnalytics,
  RoomsAnalytics,
  PrescriptionsAnalytics,
} from "@/components/dashboard/analytics";

// Map feature IDs to their analytics components
const FEATURE_ANALYTICS_MAP: Record<string, React.ComponentType> = {
  'order-management': OrdersAnalytics,
  'inventory-management': InventoryAnalytics,
  'employee-management': EmployeeAnalytics,
  'call-center': CallCenterAnalytics,
  'menu-management': MenuAnalytics,
  'table-management': TablesAnalytics,
  'appointment-scheduling': AppointmentsAnalytics,
  'member-management': MembersAnalytics,
  'product-management': ProductsAnalytics,
  'room-management': RoomsAnalytics,
  'prescription-management': PrescriptionsAnalytics,
};

// Feature categories by business type for better organization
const BUSINESS_TYPE_FEATURES: Record<string, string[]> = {
  'restaurant': ['order-management', 'menu-management', 'table-management', 'inventory-management', 'employee-management', 'call-center'],
  'hotel': ['room-management', 'appointment-scheduling', 'inventory-management', 'employee-management', 'call-center'],
  'salon': ['appointment-scheduling', 'employee-management', 'inventory-management', 'call-center'],
  'gym': ['member-management', 'check-in-system', 'class-management', 'equipment-management', 'employee-management', 'inventory-management', 'call-center'],
  'retail': ['product-management', 'inventory-management', 'order-management', 'employee-management', 'call-center'],
  'pharmacy': ['prescription-management', 'inventory-management', 'employee-management', 'call-center'],
  'grocery': ['product-management', 'inventory-management', 'order-management', 'employee-management', 'call-center'],
  'auto-repair': ['appointment-scheduling', 'inventory-management', 'employee-management', 'call-center'],
  'pet-care': ['appointment-scheduling', 'inventory-management', 'employee-management', 'call-center'],
};

export const Dashboard = () => {
  const { selectedBusinessType } = useBusinessType();
  const { enabledFeatures, isLoading } = useBusinessFeatures();
  const { t } = useTranslation();

  // Get the list of analytics to show based on enabled features and business type
  const analyticsToShow = useMemo(() => {
    if (isLoading) return [];

    // Get features relevant to this business type
    const businessTypeId = selectedBusinessType?.id || '';
    const relevantFeatures = BUSINESS_TYPE_FEATURES[businessTypeId] || Object.keys(FEATURE_ANALYTICS_MAP);

    // Filter to only enabled features that have analytics and are relevant to the business type
    const enabledFeatureIds = enabledFeatures.map(f => f.id);
    
    return relevantFeatures
      .filter(featureId => {
        // Check if feature is enabled AND has an analytics component
        const isEnabled = enabledFeatureIds.includes(featureId);
        const hasAnalytics = FEATURE_ANALYTICS_MAP[featureId];
        return isEnabled && hasAnalytics;
      })
      .map(featureId => ({
        id: featureId,
        Component: FEATURE_ANALYTICS_MAP[featureId],
      }));
  }, [enabledFeatures, selectedBusinessType, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (analyticsToShow.length === 0) {
    return (
      <div className="space-y-6 p-1">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.overview')}</p>
        </div>
        <Card className="p-8 border border-border/50 bg-card/50">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 rounded-full bg-muted/50">
              <svg className="w-12 h-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No Analytics Available</h3>
              <p className="text-muted-foreground mt-1 max-w-md">
                Analytics will appear here based on the features enabled for your business. 
                Contact your administrator to enable features.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('dashboard.overview')}</p>
      </div>

      {/* Analytics Widgets - Rendered based on enabled features */}
      <div className="space-y-6">
        {analyticsToShow.map(({ id, Component }) => (
          <Card key={id} className="p-6 border border-border/50 bg-card/50 backdrop-blur-sm">
            <Component />
          </Card>
        ))}
      </div>
    </div>
  );
};
