
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BranchSelector } from "./BranchSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useTranslation } from "@/contexts/TranslationContext";

export const Header = () => {
  const { logout, userEmail } = useAuth();
  const { selectedBusinessType } = useBusinessType();
  const { t } = useTranslation();

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{selectedBusinessType?.icon}</span>
          <span className="text-white font-medium">{selectedBusinessType?.name}</span>
        </div>
        <div className="w-px h-6 bg-gray-600"></div>
        <BranchSelector />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="text-gray-300 relative">
          <Bell size={18} />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs">
            3
          </Badge>
        </Button>
        
        <div className="flex items-center space-x-2 text-gray-300">
          <User size={18} />
          <span className="text-sm">{userEmail}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={logout}
          className="text-gray-300 hover:text-red-400"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
};
