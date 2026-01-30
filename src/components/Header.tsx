import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BranchSelector } from "./BranchSelector";
import { NotificationPanel } from "./notifications/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessType } from "@/contexts/BusinessTypeContext";

export const Header = () => {
  const { logout, userEmail } = useAuth();
  const { selectedBusinessType } = useBusinessType();

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
        <NotificationPanel />
        
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
