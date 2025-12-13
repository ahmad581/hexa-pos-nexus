
import { useState } from "react";
import { FileText, LayoutDashboard, ListChecks, Settings, Users, ShoppingBag, File, Home, Hotel, ClipboardList, UserPlus, BarChartBig, Phone, Menu, ChevronLeft, Pill, Package, Calendar, Dumbbell, Car, Heart, Building, Shield, Crown } from "lucide-react";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { useTranslation } from "@/contexts/TranslationContext";
import { useBusinessFeatures } from "@/hooks/useBusinessFeatures";
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
  const { t } = useTranslation();
  const { 
    canManageUsers, 
    canViewAnalytics, 
    canAccessBusinessManagement,
    canAccessEmployees,
    canHandleCalls,
    canAccessMenu,
    canAccessTables,
    canHandleOrders,
    canManageInventory,
    canOnlyCheckInOut,
    isSystemMaster
  } = useRole();
  const { hasRouteAccess } = useBusinessFeatures();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // For employees who can only check in/out, show minimal menu
  if (canOnlyCheckInOut()) {
    const employeeNavigationItems: NavItem[] = [
      { to: "/", icon: LayoutDashboard, label: t('nav.dashboard') },
      { to: "/settings", icon: Settings, label: t('nav.settings') },
    ];
    
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
              <SheetTitle className="text-white">{t('nav.menu')}</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              {employeeNavigationItems.map((item) => (
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
              {t('auth.logout')}
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
            {employeeNavigationItems.map((item) => (
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
              title={isCollapsed ? t('auth.logout') : undefined}
            >
              {isCollapsed ? '⟲' : t('auth.logout')}
            </Button>
          </div>
        </aside>
      </>
    );
  }

  const filteredNavigationItems = [
    { to: "/", icon: LayoutDashboard, label: t('nav.dashboard') },
    ...(isSystemMaster() ? [{ to: "/system-master", icon: Crown, label: "SystemMaster Dashboard" }] : []),
    ...(canAccessEmployees() && hasRouteAccess('/employees') ? [{ to: "/employees", icon: UserPlus, label: t('nav.employees') }] : []),
    ...(canViewAnalytics() && hasRouteAccess('/analytics') ? [{ to: "/analytics", icon: BarChartBig, label: t('nav.analytics') }] : []),
    ...(canHandleCalls() && hasRouteAccess('/call-center') ? [{ to: "/call-center", icon: Phone, label: t('nav.callCenter') }] : []),
    { to: "/settings", icon: Settings, label: t('nav.settings') },
  ];

  const filteredRestaurantItems = [
    ...(canAccessMenu() && hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    ...(canAccessTables() && hasRouteAccess('/tables') ? [{ to: "/tables", icon: Users, label: t('nav.tables') }] : []),
    ...(canHandleOrders() && hasRouteAccess('/orders') ? [{ to: "/orders", icon: ShoppingBag, label: t('nav.orders') }] : []),
    ...(canManageInventory() && hasRouteAccess('/inventory') ? [{ to: "/inventory", icon: Package, label: t('nav.inventory') }] : [])
  ];

  const hotelItems = [
    { to: "/rooms", icon: Home, label: t('nav.rooms') },
    { to: "/hotel-services", icon: ListChecks, label: t('nav.services') }
  ].filter(item => hasRouteAccess(item.to));

  const salonItems = [
    { to: "/appointments", icon: ClipboardList, label: t('nav.appointments') },
    { to: "/stylists", icon: Users, label: t('nav.stylists') }
  ].filter(item => hasRouteAccess(item.to));

  const retailItems = [
    { to: "/products", icon: ShoppingBag, label: t('nav.products') },
    { to: "/retail-inventory", icon: Package, label: t('nav.inventory') }
  ].filter(item => hasRouteAccess(item.to));

  const clinicItems = [
    { to: "/patients", icon: Users, label: "Patients" },
    { to: "/appointments", icon: ClipboardList, label: t('nav.appointments') }
  ].filter(item => hasRouteAccess(item.to));

  const pharmacyItems = [
    { to: "/prescriptions", icon: Pill, label: t('nav.prescriptions') }
  ].filter(item => hasRouteAccess(item.to));

  const groceryItems = [
    { to: "/grocery-inventory", icon: Package, label: t('nav.inventory') },
    { to: "/suppliers", icon: Users, label: "Suppliers" }
  ].filter(item => hasRouteAccess(item.to));

  const gymItems = [
    { to: "/members", icon: Users, label: t('nav.members') },
    { to: "/classes", icon: Calendar, label: "Classes" },
    { to: "/equipment", icon: Dumbbell, label: "Equipment" }
  ].filter(item => hasRouteAccess(item.to));

  const autoRepairItems = [
    { to: "/auto-services", icon: Car, label: t('nav.services') },
    { to: "/vehicles", icon: Car, label: "Vehicles" }
  ].filter(item => hasRouteAccess(item.to));

  const petCareItems = [
    { to: "/pet-appointments", icon: Calendar, label: t('nav.appointments') },
    { to: "/pets", icon: Heart, label: "Pets" }
  ].filter(item => hasRouteAccess(item.to));

  const getBusinessSpecificItems = () => {
    switch (selectedBusinessType?.id) {
      case 'restaurant':
        return filteredRestaurantItems;
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
            <SheetTitle className="text-white">{t('nav.menu')}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {filteredNavigationItems.map((item) => (
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
            {t('auth.logout')}
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
          {filteredNavigationItems.map((item) => (
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
