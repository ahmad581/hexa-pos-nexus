import { useState } from "react";
import { FileText, LayoutDashboard, ListChecks, Settings, Users, ShoppingBag, File, Home, Hotel, ClipboardList, UserPlus, BarChartBig, Phone } from "lucide-react";
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
import { Link } from "react-router-dom";

interface NavItem {
  to: string;
  icon: any;
  label: string;
}

export const Sidebar = () => {
  const { selectedBusinessType } = useBusinessType();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <LayoutDashboard className="h-6 w-6" />
            <span className="sr-only">Open</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-3/4 sm:w-60 bg-gray-900 text-white">
          <SheetHeader className="text-left">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-800 rounded-md"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {getBusinessSpecificItems().map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-800 rounded-md"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <Button
            variant="ghost"
            className="text-red-500 hover:bg-red-500/10 justify-start"
            onClick={logout}
          >
            Logout
          </Button>
        </SheetContent>
      </Sheet>
      <aside className="hidden md:flex flex-col w-60 bg-gray-900 border-r border-gray-700 text-white">
        <nav className="py-6 flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-800 rounded-md"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          {getBusinessSpecificItems().map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center space-x-2 py-2 px-4 hover:bg-gray-800 rounded-md"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="text-red-500 hover:bg-red-500/10 justify-start"
          onClick={logout}
        >
          Logout
        </Button>
      </aside>
    </>
  );
};
