import { Navigate } from "react-router-dom";
import { useBusinessFeatures } from "@/hooks/useBusinessFeatures";

interface FeatureRouteProps {
  children: React.ReactNode;
  featureId: string;
}

export const FeatureRoute = ({ children, featureId }: FeatureRouteProps) => {
  const { hasFeatureAccess, isLoading } = useBusinessFeatures();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasFeatureAccess(featureId)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
