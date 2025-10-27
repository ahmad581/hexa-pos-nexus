import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BusinessTypeProvider } from "./contexts/BusinessTypeContext";
import { BranchProvider } from "./contexts/BranchContext";
import { OrderProvider } from "./contexts/OrderContext";
import { CallProvider } from "./contexts/CallContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { TranslationProvider } from "./contexts/TranslationContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import { BusinessRoute } from "./components/BusinessRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
import { Analytics } from "./pages/Analytics";
import { CallCenter } from "./pages/CallCenter";
import { Settings } from "./pages/Settings";
import { SystemMasterDashboard } from "./pages/SystemMasterDashboard";

// Restaurant imports
import { Menu } from "./pages/businesses/restaurant/Menu";
import { Tables } from "./pages/businesses/restaurant/Tables";
import { Orders } from "./pages/businesses/restaurant/Orders";
import RestaurantInventory from "./pages/businesses/restaurant/Inventory";

// Hotel imports
import { Rooms } from "./pages/hotel/Rooms";
import { Services as HotelServices } from "./pages/hotel/Services";

// Salon imports
import { Appointments } from "./pages/salon/Appointments";
import { Stylists } from "./pages/salon/Stylists";

// Retail imports
import { Products } from "./pages/businesses/retail/Products";
import { Inventory } from "./pages/businesses/retail/Inventory";

// Pharmacy imports
import { Prescriptions } from "./pages/businesses/pharmacy/Prescriptions";

// Grocery imports
import { GroceryInventory } from "./pages/businesses/grocery/Inventory";

// Gym imports
import { Members } from "./pages/businesses/gym/Members";

// Auto repair imports
import { AutoRepairServices } from "./pages/businesses/auto-repair/Services";

// Pet care imports
import { PetAppointments } from "./pages/businesses/pet-care/Appointments";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component for auth redirection
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BusinessTypeProvider>
          <BranchProvider>
            <SettingsProvider>
              <TranslationProvider>
                <OrderProvider>
                  <CallProvider>
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/system-master" element={
                        <RoleBasedRoute allowedRoles={['SystemMaster']}>
                          <SystemMasterDashboard />
                        </RoleBasedRoute>
                      } />
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Layout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<Dashboard />} />
                        <Route path="employees" element={<Employees />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="call-center" element={<CallCenter />} />
                        <Route path="settings" element={<Settings />} />
                        
                        {/* Restaurant routes */}
                        <Route path="menu" element={
                          <BusinessRoute allowedBusinessTypes={['restaurant']}>
                            <Menu />
                          </BusinessRoute>
                        } />
                        <Route path="tables" element={
                          <BusinessRoute allowedBusinessTypes={['restaurant']}>
                            <Tables />
                          </BusinessRoute>
                        } />
                        <Route path="orders" element={
                          <BusinessRoute allowedBusinessTypes={['restaurant']}>
                            <Orders />
                          </BusinessRoute>
                        } />
                        
                        {/* Hotel routes */}
                        <Route path="rooms" element={
                          <BusinessRoute allowedBusinessTypes={['hotel']}>
                            <Rooms />
                          </BusinessRoute>
                        } />
                        <Route path="hotel-services" element={
                          <BusinessRoute allowedBusinessTypes={['hotel']}>
                            <HotelServices />
                          </BusinessRoute>
                        } />
                        
                        {/* Hair Salon routes */}
                        <Route path="appointments" element={
                          <BusinessRoute allowedBusinessTypes={['hair-salon', 'medical-clinic', 'pet-care']}>
                            <Appointments />
                          </BusinessRoute>
                        } />
                        <Route path="stylists" element={
                          <BusinessRoute allowedBusinessTypes={['hair-salon']}>
                            <Stylists />
                          </BusinessRoute>
                        } />
                        
                        {/* Retail routes */}
                        <Route path="products" element={
                          <BusinessRoute allowedBusinessTypes={['retail-store']}>
                            <Products />
                          </BusinessRoute>
                        } />
                        <Route path="inventory" element={<RestaurantInventory />} />
                        
                        {/* Retail inventory route */}
                        <Route path="retail-inventory" element={
                          <BusinessRoute allowedBusinessTypes={['retail-store']}>
                            <Inventory />
                          </BusinessRoute>
                        } />
                        
                        {/* Pharmacy routes */}
                        <Route path="prescriptions" element={
                          <BusinessRoute allowedBusinessTypes={['pharmacy']}>
                            <Prescriptions />
                          </BusinessRoute>
                        } />
                        
                        {/* Grocery routes */}
                        <Route path="grocery-inventory" element={
                          <BusinessRoute allowedBusinessTypes={['grocery']}>
                            <GroceryInventory />
                          </BusinessRoute>
                        } />
                        
                        {/* Gym routes */}
                        <Route path="members" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <Members />
                          </BusinessRoute>
                        } />
                        
                        {/* Auto repair routes */}
                        <Route path="auto-services" element={
                          <BusinessRoute allowedBusinessTypes={['auto-repair']}>
                            <AutoRepairServices />
                          </BusinessRoute>
                        } />
                        
                        {/* Pet care routes */}
                        <Route path="pet-appointments" element={
                          <BusinessRoute allowedBusinessTypes={['pet-care']}>
                            <PetAppointments />
                          </BusinessRoute>
                        } />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </CallProvider>
                </OrderProvider>
              </TranslationProvider>
            </SettingsProvider>
          </BranchProvider>
        </BusinessTypeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;