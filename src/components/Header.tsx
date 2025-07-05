
import { Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BranchSelector } from "./BranchSelector";
import { BusinessTypeSelector } from "./BusinessTypeSelector";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <BusinessTypeSelector />
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
          <span className="text-sm">Admin User</span>
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
