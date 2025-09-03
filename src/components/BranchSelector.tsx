
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useAuth } from "@/contexts/AuthContext";

export const BranchSelector = () => {
  const { branches, selectedBranch, setSelectedBranch } = useBranch();
  const { selectedBusinessType } = useBusinessType();
  const { userProfile, userBranchId } = useAuth();

  const activeBranches = branches.filter(branch => branch.isActive);
  const branchLabel = selectedBusinessType?.terminology.branch || 'Branch';

  // Find the user's assigned branch from the branch list
  const userBranch = branches.find(branch => branch.id === userBranchId);

  return (
    <div className="flex items-center space-x-2">
      <MapPin size={16} className="text-gray-400" />
      <div className="flex items-center space-x-2">
        <span className="text-white font-medium">
          {userBranch ? userBranch.name : `${branchLabel} ${userBranchId}`}
        </span>
        <Badge variant="outline" className="text-xs">
          {userProfile?.primary_role || 'Employee'}
        </Badge>
      </div>
    </div>
  );
};
