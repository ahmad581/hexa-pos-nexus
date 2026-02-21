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
import { FeatureRoute } from "./components/FeatureRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
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
import { SalonServices } from "./pages/salon/SalonServices";
import { SalonClients } from "./pages/salon/SalonClients";
import { SalonPOS } from "./pages/salon/SalonPOS";
import { SalonPackages } from "./pages/salon/SalonPackages";
import { StylistSchedule } from "./pages/salon/StylistSchedule";

// Retail imports
import { Products } from "./pages/businesses/retail/Products";
import { Inventory } from "./pages/businesses/retail/Inventory";
import { RetailCustomers } from "./pages/businesses/retail/Customers";
import { RetailPOS } from "./pages/businesses/retail/RetailPOS";
import { RetailOrders } from "./pages/businesses/retail/RetailOrders";
import { RetailReturns } from "./pages/businesses/retail/Returns";

// Pharmacy imports
import { Prescriptions } from "./pages/businesses/pharmacy/Prescriptions";
import { Patients } from "./pages/businesses/pharmacy/Patients";
import { PatientProfile } from "./pages/businesses/pharmacy/PatientProfile";
import { PharmacyPOS } from "./pages/businesses/pharmacy/PharmacyPOS";

// Grocery imports
import { GroceryInventory } from "./pages/businesses/grocery/Inventory";

// Gym imports
import { Members } from "./pages/businesses/gym/Members";
import { CheckIns } from "./pages/businesses/gym/CheckIns";
import { Classes } from "./pages/businesses/gym/Classes";
import { Equipment } from "./pages/businesses/gym/Equipment";
import { MembershipPlans } from "./pages/businesses/gym/MembershipPlans";
import { Trainers } from "./pages/businesses/gym/Trainers";
import { VisitHistory } from "./pages/businesses/gym/VisitHistory";
import { Billing } from "./pages/businesses/gym/Billing";
import { ClassRegistrations } from "./pages/businesses/gym/ClassRegistrations";
import { MemberEngagement } from "./pages/businesses/gym/MemberEngagement";

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
                        <Route index element={
                          <RoleBasedRoute allowedRoles={['SystemMaster', 'SuperManager', 'Manager', 'HallManager', 'HrManager', 'CallCenterEmp', 'Employee']} fallbackPath="/menu">
                            <Dashboard />
                          </RoleBasedRoute>
                        } />
                        <Route path="employees" element={
                          <RoleBasedRoute allowedRoles={['SystemMaster', 'SuperManager', 'Manager', 'HrManager']}>
                            <Employees />
                          </RoleBasedRoute>
                        } />
                        <Route path="call-center" element={
                          <RoleBasedRoute allowedRoles={['SystemMaster', 'SuperManager', 'Manager', 'CallCenterEmp']}>
                            <CallCenter />
                          </RoleBasedRoute>
                        } />
                        <Route path="settings" element={
                          <RoleBasedRoute allowedRoles={['SystemMaster', 'SuperManager', 'Manager', 'HallManager', 'HrManager', 'CallCenterEmp', 'Employee']} fallbackPath="/menu">
                            <Settings />
                          </RoleBasedRoute>
                        } />
                        <Route path="orders" element={
                          <RoleBasedRoute allowedRoles={['SystemMaster', 'SuperManager', 'Manager', 'HallManager', 'Cashier', 'CallCenterEmp']}>
                            <Orders />
                          </RoleBasedRoute>
                        } />
                        
                        {/* Menu route - available for all business types with menu-management feature */}
                        <Route path="menu" element={
                          <FeatureRoute featureId="menu-management">
                            <Menu />
                          </FeatureRoute>
                        } />
                        <Route path="tables" element={
                          <BusinessRoute allowedBusinessTypes={['restaurant']}>
                            <Tables />
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
                        <Route path="salon-services" element={
                          <BusinessRoute allowedBusinessTypes={['hair-salon']}>
                            <SalonServices />
                          </BusinessRoute>
                        } />
                        <Route path="salon-clients" element={
                          <BusinessRoute allowedBusinessTypes={['hair-salon']}>
                            <SalonClients />
                          </BusinessRoute>
                        } />
                        <Route path="salon-pos" element={
                          <BusinessRoute allowedBusinessTypes={['hair-salon']}>
                            <SalonPOS />
                          </BusinessRoute>
                        } />
                        <Route path="salon-packages" element={
                          <BusinessRoute allowedBusinessTypes={['hair-salon']}>
                            <SalonPackages />
                          </BusinessRoute>
                        } />
                        <Route path="salon-schedule" element={
                          <BusinessRoute allowedBusinessTypes={['hair-salon']}>
                            <StylistSchedule />
                          </BusinessRoute>
                        } />
                        
                        {/* Retail routes */}
                        <Route path="inventory" element={<RestaurantInventory />} />
                        <Route path="products" element={
                          <BusinessRoute allowedBusinessTypes={['retail-store']}>
                            <Products />
                          </BusinessRoute>
                        } />
                        <Route path="retail-inventory" element={
                          <BusinessRoute allowedBusinessTypes={['retail-store']}>
                            <Inventory />
                          </BusinessRoute>
                        } />
                        <Route path="retail-customers" element={
                          <BusinessRoute allowedBusinessTypes={['retail-store']}>
                            <RetailCustomers />
                          </BusinessRoute>
                        } />
                        <Route path="retail-pos" element={
                          <BusinessRoute allowedBusinessTypes={['retail-store']}>
                            <RetailPOS />
                          </BusinessRoute>
                        } />
                        <Route path="retail-orders" element={
                          <BusinessRoute allowedBusinessTypes={['retail-store']}>
                            <RetailOrders />
                          </BusinessRoute>
                        } />
                        <Route path="retail-returns" element={
                          <BusinessRoute allowedBusinessTypes={['retail-store']}>
                            <RetailReturns />
                          </BusinessRoute>
                        } />
                        
                        {/* Pharmacy routes */}
                        <Route path="prescriptions" element={
                          <BusinessRoute allowedBusinessTypes={['pharmacy']}>
                            <Prescriptions />
                          </BusinessRoute>
                        } />
                        <Route path="pharmacy-patients" element={
                          <BusinessRoute allowedBusinessTypes={['pharmacy']}>
                            <Patients />
                          </BusinessRoute>
                        } />
                        <Route path="patient/:id" element={
                          <BusinessRoute allowedBusinessTypes={['pharmacy']}>
                            <PatientProfile />
                          </BusinessRoute>
                        } />
                        <Route path="pharmacy-pos" element={
                          <BusinessRoute allowedBusinessTypes={['pharmacy']}>
                            <PharmacyPOS />
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
                        <Route path="check-ins" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <CheckIns />
                          </BusinessRoute>
                        } />
                        <Route path="classes" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <Classes />
                          </BusinessRoute>
                        } />
                        <Route path="equipment" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <Equipment />
                          </BusinessRoute>
                        } />
                        <Route path="membership-plans" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <MembershipPlans />
                          </BusinessRoute>
                        } />
                        <Route path="trainers" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <Trainers />
                          </BusinessRoute>
                        } />
                        <Route path="visit-history" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <VisitHistory />
                          </BusinessRoute>
                        } />
                        <Route path="billing" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <Billing />
                          </BusinessRoute>
                        } />
                        <Route path="class-registrations" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <ClassRegistrations />
                          </BusinessRoute>
                        } />
                        <Route path="member-engagement" element={
                          <BusinessRoute allowedBusinessTypes={['gym']}>
                            <MemberEngagement />
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