
import { useState } from "react";
import { FileText, LayoutDashboard, ListChecks, Settings, Users, ShoppingBag, File, Home, Hotel, ClipboardList, UserPlus, BarChartBig, Phone, Menu, ChevronLeft, Pill, Package, Calendar, Dumbbell, Car, Heart, Building, Shield } from "lucide-react";
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
    isSystemMaster,
    isCashier,
    isManager
  } = useRole();
  const { hasRouteAccess } = useBusinessFeatures();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  // Move these to the top - React hooks must be called before any conditional returns
  const isCashierRole = isCashier();
  const isManagerRole = isManager();

  // Define helper function before any conditional returns to avoid reference errors
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

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
          <SheetContent side="left" className="w-3/4 sm:w-60 bg-sidebar-background text-sidebar-foreground">
            <SheetHeader className="text-left">
              <SheetTitle className="text-sidebar-foreground">{t('nav.menu')}</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              {employeeNavigationItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
                    isActiveRoute(item.to) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-sidebar-accent'
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
        <aside className={`hidden md:flex flex-col bg-sidebar-background border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}>
          {/* Header with Logo and Toggle */}
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
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
              className="hover:bg-sidebar-accent"
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
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-sidebar-accent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-2">{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
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

  // Cashiers only get access to Menu, Tables, and Inventory (view only)
  // Managers get full branch-level access
  const filteredNavigationItems = isCashierRole ? [] : [
    { to: "/", icon: LayoutDashboard, label: t('nav.dashboard') },
    ...(canAccessEmployees() && hasRouteAccess('/employees') ? [{ to: "/employees", icon: UserPlus, label: t('nav.employees') }] : []),
    ...(canHandleCalls() && hasRouteAccess('/call-center') ? [{ to: "/call-center", icon: Phone, label: t('nav.callCenter') }] : []),
    { to: "/settings", icon: Settings, label: t('nav.settings') },
  ];

  const filteredRestaurantItems = [
    // Cashiers explicitly get Menu, Tables, Inventory
    ...((isCashierRole || canAccessMenu()) && hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    ...((isCashierRole || canAccessTables()) && hasRouteAccess('/tables') ? [{ to: "/tables", icon: Users, label: t('nav.tables') }] : []),
    ...((isManagerRole || (!isCashierRole && canHandleOrders())) && hasRouteAccess('/orders') ? [{ to: "/orders", icon: ShoppingBag, label: t('nav.orders') }] : []),
    ...((isCashierRole || canManageInventory()) && hasRouteAccess('/inventory') ? [{ to: "/inventory", icon: Package, label: t('nav.inventory') }] : [])
  ];

  const hotelItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    { to: "/rooms", icon: Home, label: t('nav.rooms') },
    { to: "/hotel-services", icon: ListChecks, label: t('nav.services') }
  ].filter(item => hasRouteAccess(item.to));

  const salonItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    { to: "/appointments", icon: ClipboardList, label: t('nav.appointments') },
    { to: "/stylists", icon: Users, label: t('nav.stylists') }
  ].filter(item => hasRouteAccess(item.to));

  const retailItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    { to: "/products", icon: ShoppingBag, label: t('nav.products') },
    { to: "/retail-inventory", icon: Package, label: t('nav.inventory') }
  ].filter(item => hasRouteAccess(item.to));

  const clinicItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    { to: "/patients", icon: Users, label: "Patients" },
    { to: "/appointments", icon: ClipboardList, label: t('nav.appointments') }
  ].filter(item => hasRouteAccess(item.to));

  const pharmacyItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    { to: "/prescriptions", icon: Pill, label: t('nav.prescriptions') },
    { to: "/pharmacy-patients", icon: Users, label: "Patients" },
    { to: "/pharmacy-pos", icon: ShoppingBag, label: "Checkout" }
  ].filter(item => hasRouteAccess(item.to));

  const groceryItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    { to: "/grocery-inventory", icon: Package, label: t('nav.inventory') },
    { to: "/suppliers", icon: Users, label: "Suppliers" }
  ].filter(item => hasRouteAccess(item.to));

  const gymItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    { to: "/members", icon: Users, label: t('nav.members') },
    { to: "/classes", icon: Calendar, label: "Classes" },
    { to: "/equipment", icon: Dumbbell, label: "Equipment" }
  ].filter(item => hasRouteAccess(item.to));

  const autoRepairItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
    { to: "/auto-services", icon: Car, label: t('nav.services') },
    { to: "/vehicles", icon: Car, label: "Vehicles" }
  ].filter(item => hasRouteAccess(item.to));

  const petCareItems = [
    ...(hasRouteAccess('/menu') ? [{ to: "/menu", icon: FileText, label: t('nav.menu') }] : []),
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
        <SheetContent side="left" className="w-3/4 sm:w-60 bg-sidebar-background text-sidebar-foreground">
          <SheetHeader className="text-left">
            <SheetTitle className="text-sidebar-foreground">{t('nav.menu')}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {filteredNavigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 py-2 px-4 rounded-md ${
                  isActiveRoute(item.to) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-sidebar-accent'
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
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-sidebar-accent'
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
      <aside className={`hidden md:flex flex-col bg-sidebar-background border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}>
        {/* Header with Logo and Toggle */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
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
            className="hover:bg-sidebar-accent"
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
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-sidebar-accent'
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
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-sidebar-accent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
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
