
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { useBusinessType } from "@/contexts/BusinessTypeContext";

export const BusinessTypeSelector = () => {
  const { businessTypes, selectedBusinessType, setSelectedBusinessType } = useBusinessType();

  return (
    <div className="flex items-center space-x-2">
      <Building2 size={16} className="text-gray-400" />
      <Select
        value={selectedBusinessType?.id || ''}
        onValueChange={(businessTypeId) => {
          const businessType = businessTypes.find(bt => bt.id === businessTypeId);
          if (businessType) setSelectedBusinessType(businessType);
        }}
      >
        <SelectTrigger className="w-52 bg-gray-700 border-gray-600 text-white">
          <SelectValue placeholder="Select Business Type" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-700">
          {businessTypes.map((businessType) => (
            <SelectItem key={businessType.id} value={businessType.id} className="text-white hover:bg-gray-700">
              <div className="flex items-center space-x-2">
                <span>{businessType.icon}</span>
                <span>{businessType.name}</span>
                <Badge variant="outline" className="text-xs">
                  {businessType.category}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
