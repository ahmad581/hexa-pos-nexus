import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { AccessDenied } from "@/components/AccessDenied";

interface BusinessRouteProps {
  children: React.ReactNode;
  allowedBusinessTypes: string[];
}

export const BusinessRoute = ({ children, allowedBusinessTypes }: BusinessRouteProps) => {
  const { selectedBusinessType } = useBusinessType();

  if (!selectedBusinessType) {
    return (
      <AccessDenied
        title="Business not selected"
        description="Select a business type to access this page."
      />
    );
  }

  if (!allowedBusinessTypes.includes(selectedBusinessType.id)) {
    return (
      <AccessDenied
        title="Not available"
        description="This page isn’t available for your current business type."
        actionLabel="Go to dashboard"
        actionTo="/"
      />
    );
  }

  return <>{children}</>;
};

