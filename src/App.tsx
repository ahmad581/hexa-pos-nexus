
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BusinessTypeProvider } from "./contexts/BusinessTypeContext";
import { BranchProvider } from "./contexts/BranchContext";
import { OrderProvider } from "./contexts/OrderContext";
import { CallProvider } from "./contexts/CallContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BusinessRoute } from "./components/BusinessRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
import { Analytics } from "./pages/Analytics";
import { Menu } from "./pages/Menu";
import { Tables } from "./pages/Tables";
import { Orders } from "./pages/Orders";
import { CallCenter } from "./pages/CallCenter";
import { Settings } from "./pages/Settings";
import { Rooms } from "./pages/hotel/Rooms";
import { Services as HotelServices } from "./pages/hotel/Services";
import { Appointments } from "./pages/salon/Appointments";
import { Stylists } from "./pages/salon/Stylists";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BusinessTypeProvider>
          <BranchProvider>
            <OrderProvider>
              <CallProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
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
                      
                      {/* Restaurant-specific routes */}
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
                      
                      {/* Hotel-specific routes */}
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
                      
                      {/* Hair Salon-specific routes */}
                      <Route path="appointments" element={
                        <BusinessRoute allowedBusinessTypes={['hair-salon']}>
                          <Appointments />
                        </BusinessRoute>
                      } />
                      <Route path="stylists" element={
                        <BusinessRoute allowedBusinessTypes={['hair-salon']}>
                          <Stylists />
                        </BusinessRoute>
                      } />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </CallProvider>
            </OrderProvider>
          </BranchProvider>
        </BusinessTypeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
