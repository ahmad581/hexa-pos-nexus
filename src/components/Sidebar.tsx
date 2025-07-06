
import { useState } from "react";
import { FileText, LayoutDashboard, ListChecks, Settings, Users, ShoppingBag, File, Home, Hotel, ClipboardList, UserPlus, BarChartBig, Phone, Menu, X } from "lucide-react";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  to: string;
  icon: any;
  label: string;
}

export const Sidebar = () => {
  const { selectedBusinessType } = useBusinessType();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems: NavItem[] = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/employees", icon: UserPlus, label: "Employees" },
    { to: "/analytics", icon: BarChartBig, label: "Analytics" },
    { to: "/call-center", icon: Phone, label: "Call Center" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  const restaurantItems = [
    { to: "/menu", icon: FileText, label: "Menu" },
    { to: "/tables", icon: Users, label: "Tables" },
    { to: "/orders", icon: ShoppingBag, label: "Orders" }
  ];

  const hotelItems = [
    { to: "/rooms", icon: Home, label: "Rooms" },
    { to: "/hotel-services", icon: ListChecks, label: "Services" }
  ];

  const salonItems = [
    { to: "/appointments", icon: ClipboardList, label: "Appointments" },
    { to: "/stylists", icon: Users, label: "Stylists" }
  ];

  const retailItems = [
    { to: "/products", icon: ShoppingBag, label: "Products" },
    { to: "/inventory", icon: File, label: "Inventory" }
  ];

  const clinicItems = [
    { to: "/patients", icon: Users, label: "Patients" },
    { to: "/appointments", icon: ClipboardList, label: "Appointments" }
  ];

  const getBusinessSpecificItems = () => {
    switch (selectedBusinessType?.id) {
      case 'restaurant':
        return restaurantItems;
      case 'hotel':
        return hotelItems;
      case 'hair-salon':
        return salonItems;
      case 'retail-store':
        return retailItems;
      case 'medical-clinic':
        return clinicItems;
      default:
        return [];
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-3/4 sm:w-60 bg-gray-900 text-white">
          <SheetHeader className="text-left">
            <SheetTitle className="text-white">Menu</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
                  isActiveRoute(item.to) 
                    ? 'bg-green-600 text-white' 
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {getBusinessSpecificItems().map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
                  isActiveRoute(item.to) 
                    ? 'bg-green-600 text-white' 
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <Button
            variant="ghost"
            className="text-red-500 hover:bg-red-500/10 justify-start w-full"
            onClick={logout}
          >
            Logout
          </Button>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-gray-900 border-r border-gray-700 text-white transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}>
        {/* Toggle Button */}
        <div className="p-4 border-b border-gray-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full justify-center hover:bg-gray-800"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="py-6 flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center py-2 px-4 rounded-md mx-2 mb-1 ${
                isActiveRoute(item.to) 
                  ? 'bg-green-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Link>
          ))}
          {getBusinessSpecificItems().map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center py-2 px-4 rounded-md mx-2 mb-1 ${
                isActiveRoute(item.to) 
                  ? 'bg-green-600 text-white' 
                  : 'hover:bg-gray-800'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Button
            variant="ghost"
            className={`text-red-500 hover:bg-red-500/10 w-full ${
              isCollapsed ? 'px-2' : 'justify-start'
            }`}
            onClick={logout}
            title={isCollapsed ? 'Logout' : undefined}
          >
            {isCollapsed ? '⟲' : 'Logout'}
          </Button>
        </div>
      </aside>
    </>
  );
};
