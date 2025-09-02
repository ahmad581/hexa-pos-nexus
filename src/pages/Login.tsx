
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { demoLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(async () => {
      const validCredentials = [
        // Manager accounts
        { email: "restaurant@bizhub.com", password: "demo123" },
        { email: "hotel@bizhub.com", password: "demo123" },
        { email: "salon@bizhub.com", password: "demo123" },
        { email: "clinic@bizhub.com", password: "demo123" },
        { email: "retail@bizhub.com", password: "demo123" },
        { email: "pharmacy@bizhub.com", password: "demo123" },
        { email: "grocery@bizhub.com", password: "demo123" },
        { email: "gym@bizhub.com", password: "demo123" },
        { email: "autorepair@bizhub.com", password: "demo123" },
        { email: "petcare@bizhub.com", password: "demo123" },
        // Employee accounts
        { email: "restaurant.server@bizhub.com", password: "demo123" },
        { email: "restaurant.chef@bizhub.com", password: "demo123" },
        { email: "hotel.front@bizhub.com", password: "demo123" },
        { email: "hotel.beach@bizhub.com", password: "demo123" },
        { email: "salon.stylist@bizhub.com", password: "demo123" },
        { email: "salon.mall@bizhub.com", password: "demo123" },
        { email: "clinic.nurse@bizhub.com", password: "demo123" },
        { email: "clinic.north@bizhub.com", password: "demo123" },
        { email: "retail.sales@bizhub.com", password: "demo123" },
        { email: "retail.outlet@bizhub.com", password: "demo123" },
        { email: "pharmacy.tech@bizhub.com", password: "demo123" },
        { email: "pharmacy.west@bizhub.com", password: "demo123" },
        { email: "grocery.cashier@bizhub.com", password: "demo123" },
        { email: "gym.trainer@bizhub.com", password: "demo123" },
        { email: "autorepair.tech@bizhub.com", password: "demo123" },
        { email: "petcare.vet@bizhub.com", password: "demo123" }
      ];

      const isValid = validCredentials.some(cred => 
        cred.email === email && cred.password === password
      );

      if (isValid) {
        try {
          await demoLogin(email);
          toast({
            title: "Login Successful",
            description: "Welcome to BizHub POS!",
          });
          navigate("/");
        } catch (error) {
          toast({
            title: "Login Failed",
            description: "Demo login failed",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const fillCredentials = (businessEmail: string) => {
    setEmail(businessEmail);
    setPassword("demo123");
  };

  const employeeAccounts = [
    // Managers
    { email: "restaurant@bizhub.com", name: "Alex Thompson", business: "Restaurant", branch: "Mall Branch", role: "Manager", icon: "🍽️" },
    { email: "hotel@bizhub.com", name: "Sophie Chen", business: "Hotel", branch: "Central Hotel", role: "Manager", icon: "🏨" },
    { email: "salon@bizhub.com", name: "Rachel Green", business: "Hair Salon", branch: "Uptown Salon", role: "Manager", icon: "💇" },
    { email: "clinic@bizhub.com", name: "Dr. Emma Johnson", business: "Medical Clinic", branch: "Downtown Clinic", role: "Manager", icon: "🏥" },
    { email: "retail@bizhub.com", name: "Mike Brown", business: "Retail Store", branch: "Mall Store", role: "Manager", icon: "🛍️" },
    { email: "pharmacy@bizhub.com", name: "Dr. Lisa Adams", business: "Pharmacy", branch: "Main Pharmacy", role: "Manager", icon: "💊" },
    
    // Employees
    { email: "restaurant.server@bizhub.com", name: "Maria Rodriguez", business: "Restaurant", branch: "Mall Branch", role: "Server", icon: "🍽️" },
    { email: "hotel.front@bizhub.com", name: "Daniel Kumar", business: "Hotel", branch: "Central Hotel", role: "Front Desk", icon: "🏨" },
    { email: "salon.stylist@bizhub.com", name: "Marcus Jackson", business: "Hair Salon", branch: "Uptown Salon", role: "Stylist", icon: "💇" },
    { email: "clinic.nurse@bizhub.com", name: "Nurse Tom Davis", business: "Medical Clinic", branch: "Downtown Clinic", role: "Nurse", icon: "🏥" },
    { email: "retail.sales@bizhub.com", name: "Ashley Moore", business: "Retail Store", branch: "Mall Store", role: "Sales Associate", icon: "🛍️" },
    { email: "pharmacy.tech@bizhub.com", name: "Kevin Wright", business: "Pharmacy", branch: "Main Pharmacy", role: "Pharmacy Tech", icon: "💊" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h1 className="text-3xl font-bold text-white">BizHub POS</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="business@bizhub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  <LogIn className="mr-2" size={16} />
                  Sign In
                </>
              )}
            </Button>
          </form>
          
            <div className="text-center text-gray-400 text-sm">
            <p className="mb-4 text-lg font-medium text-white">Demo Employee Accounts</p>
            <p className="mb-4 text-gray-300">Password: demo123 for all accounts</p>
            
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="text-sm text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
              >
                Or try Magic Link Login
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {employeeAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="ghost"
                  className="text-left justify-start p-4 h-auto bg-gray-700/50 hover:bg-gray-700 border border-gray-600"
                  onClick={() => fillCredentials(account.email)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <span className="text-xl">{account.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{account.name}</div>
                      <div className="text-xs text-gray-300">{account.role}</div>
                      <div className="text-xs text-green-400">{account.business}</div>
                      <div className="text-xs text-gray-400 truncate">{account.branch}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
