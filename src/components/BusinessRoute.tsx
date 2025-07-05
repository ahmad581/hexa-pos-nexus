
import { Navigate } from "react-router-dom";
import { useBusinessType } from "@/contexts/BusinessTypeContext";

interface BusinessRouteProps {
  children: React.ReactNode;
  allowedBusinessTypes: string[];
}

export const BusinessRoute = ({ children, allowedBusinessTypes }: BusinessRouteProps) => {
  const { selectedBusinessType } = useBusinessType();

  if (!selectedBusinessType || !allowedBusinessTypes.includes(selectedBusinessType.id)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
