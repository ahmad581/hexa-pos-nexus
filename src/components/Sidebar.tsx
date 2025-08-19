
import { useState } from "react";
import { FileText, LayoutDashboard, ListChecks, Settings, Users, ShoppingBag, File, Home, Hotel, ClipboardList, UserPlus, BarChartBig, Phone, Menu, ChevronLeft, Pill, Package, Calendar, Dumbbell, Car, Heart } from "lucide-react";
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
    { to: "/orders", icon: ShoppingBag, label: "Orders" },
    { to: "/inventory", icon: Package, label: "Inventory" }
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
    { to: "/inventory", icon: Package, label: "Inventory" }
  ];

  const clinicItems = [
    { to: "/patients", icon: Users, label: "Patients" },
    { to: "/appointments", icon: ClipboardList, label: "Appointments" }
  ];

  const pharmacyItems = [
    { to: "/prescriptions", icon: Pill, label: "Prescriptions" }
  ];

  const groceryItems = [
    { to: "/grocery-inventory", icon: Package, label: "Inventory" },
    { to: "/suppliers", icon: Users, label: "Suppliers" }
  ];

  const gymItems = [
    { to: "/members", icon: Users, label: "Members" },
    { to: "/classes", icon: Calendar, label: "Classes" },
    { to: "/equipment", icon: Dumbbell, label: "Equipment" }
  ];

  const autoRepairItems = [
    { to: "/auto-services", icon: Car, label: "Services" },
    { to: "/vehicles", icon: Car, label: "Vehicles" }
  ];

  const petCareItems = [
    { to: "/pet-appointments", icon: Calendar, label: "Appointments" },
    { to: "/pets", icon: Heart, label: "Pets" }
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
      case 'pharmacy':
        return pharmacyItems;
      case 'grocery':
        return groceryItems;
      case 'gym':
        return gymItems;
      case 'auto-repair':
        return autoRepairItems;
      case 'pet-care':
        return petCareItems;
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
        {/* Header with Logo and Toggle */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {selectedBusinessType?.name?.charAt(0) || 'B'}
                </span>
              </div>
              <span className="font-semibold text-sm">
                {selectedBusinessType?.name || 'Business'}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:bg-gray-800"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
