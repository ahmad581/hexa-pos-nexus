import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BranchSelector } from "./BranchSelector";
import { NotificationPanel } from "./notifications/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessType } from "@/contexts/BusinessTypeContext";

export const Header = () => {
  const { logout, userEmail, businessName } = useAuth();
  const { selectedBusinessType } = useBusinessType();

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{selectedBusinessType?.icon}</span>
          <span className="text-foreground font-medium">
            {businessName || selectedBusinessType?.name || 'Business'}
          </span>
        </div>
        <div className="w-px h-6 bg-border"></div>
        <BranchSelector />
      </div>
      
      <div className="flex items-center space-x-4">
        <NotificationPanel />
        
        <div className="flex items-center space-x-2 text-muted-foreground">
          <User size={18} />
          <span className="text-sm">{userEmail}</span>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={logout}
          className="text-muted-foreground hover:text-red-400"
        >
          <LogOut size={18} />
        </Button>
      </div>
    </header>
  );
};
