
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useBranch } from "@/contexts/BranchContext";

export const BranchSelector = () => {
  const { branches, selectedBranch, setSelectedBranch } = useBranch();

  const activeBranches = branches.filter(branch => branch.isActive);

  return (
    <div className="flex items-center space-x-2">
      <MapPin size={16} className="text-gray-400" />
      <Select
        value={selectedBranch?.id || ''}
        onValueChange={(branchId) => {
          const branch = branches.find(b => b.id === branchId);
          if (branch) setSelectedBranch(branch);
        }}
      >
        <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
          <SelectValue placeholder="Select Branch" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {activeBranches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id} className="text-white hover:bg-gray-700">
              <div className="flex items-center space-x-2">
                <span>{branch.name}</span>
                <Badge variant="outline" className="text-xs">
                  {branch.address.split(',')[1]?.trim() || 'Branch'}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
