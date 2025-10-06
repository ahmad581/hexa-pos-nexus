
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [masterDialogOpen, setMasterDialogOpen] = useState(false);
  const [masterEmail, setMasterEmail] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterError, setMasterError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { demoLogin, login } = useAuth();
  const { t } = useTranslation();

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
            title: t('auth.login') + " Successful",
            description: "Welcome to BizHub POS!",
          });
          navigate("/");
        } catch (error) {
          toast({
            title: t('auth.login') + " Failed",
            description: "Demo login failed",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: t('auth.login') + " Failed",
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

  const handleMasterLogin = async () => {
    if (!masterEmail || !masterPassword) {
      setMasterError("Please enter both email and password");
      return;
    }

    setMasterLoading(true);
    setMasterError("");

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: masterEmail,
        password: masterPassword,
      });

      if (authError) {
        setMasterError("Invalid email or password");
        setMasterLoading(false);
        return;
      }

      // Verify SystemMaster role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, primary_role')
        .eq('email', masterEmail)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setMasterError("Profile not found in the system.");
        setMasterLoading(false);
        return;
      }

      if (profile.primary_role !== 'SystemMaster') {
        await supabase.auth.signOut();
        setMasterError("This email is not authorized for SystemMaster access.");
        setMasterLoading(false);
        return;
      }
      
      toast({
        title: t('auth.login') + " Successful",
        description: "Welcome to SystemMaster Dashboard!",
      });

      setMasterDialogOpen(false);
      setMasterEmail("");
      setMasterPassword("");
      setMasterError("");
      navigate("/system-master");
    } catch (error: any) {
      console.error('SystemMaster login error:', error);
      setMasterError(error.message || "Failed to process login. Please try again.");
    } finally {
      setMasterLoading(false);
    }
  };

  const handleMasterDialogClose = () => {
    setMasterDialogOpen(false);
    setMasterEmail("");
    setMasterPassword("");
    setMasterError("");
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
              <Label htmlFor="email" className="text-gray-300">{t('auth.username')}</Label>
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
              <Label htmlFor="password" className="text-gray-300">{t('auth.password')}</Label>
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
                  {t('auth.login')}
                </>
              )}
            </Button>
          </form>
          
            <div className="text-center text-gray-400 text-sm">
            <p className="mb-4 text-lg font-medium text-white">{t('auth.demoCredentials')}</p>
            <p className="mb-4 text-gray-300">Password: demo123 for all accounts</p>
            
            <div className="mb-6 space-y-2">
              <Dialog open={masterDialogOpen} onOpenChange={setMasterDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-sm text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white w-full"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    {t('auth.loginAsMaster')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-purple-600" />
                      SystemMaster Login
                    </DialogTitle>
                    <DialogDescription>
                      Enter your SystemMaster email address to verify access and login.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="master-email">Email Address</Label>
                      <Input
                        id="master-email"
                        type="email"
                        placeholder="systemmaster@bizhub.com"
                        value={masterEmail}
                        onChange={(e) => setMasterEmail(e.target.value)}
                        className="col-span-3"
                        disabled={masterLoading}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="master-password">Password</Label>
                      <Input
                        id="master-password"
                        type="password"
                        placeholder="Enter your password"
                        value={masterPassword}
                        onChange={(e) => setMasterPassword(e.target.value)}
                        className="col-span-3"
                        disabled={masterLoading}
                      />
                    </div>
                    
                    {masterError && (
                      <Alert variant="destructive">
                        <AlertDescription>{masterError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <DialogFooter className="gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleMasterDialogClose}
                      disabled={masterLoading}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      onClick={handleMasterLogin}
                      disabled={masterLoading || !masterEmail || !masterPassword}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {masterLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Next"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
