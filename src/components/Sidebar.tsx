
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Menu, 
  Table, 
  Phone,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessType } from "@/contexts/BusinessTypeContext";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { selectedBusinessType } = useBusinessType();
  
  const businessTerms = selectedBusinessType?.terminology || {
    units: 'Tables',
    services: 'Menu'
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "Employees", path: "/employees" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Menu, label: businessTerms.services, path: "/menu" },
    { icon: Table, label: businessTerms.units, path: "/tables" },
    { icon: Phone, label: "Call Center", path: "/call-center" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className={cn(
      "bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-lg">BizHub POS</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors",
                isActive && "bg-green-600 text-white border-r-2 border-green-400",
                collapsed && "justify-center"
              )
            }
          >
            <item.icon size={20} />
            {!collapsed && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
