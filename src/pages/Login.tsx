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
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      const validCredentials = [
        { email: "restaurant@hexapos.com", password: "admin123" },
        { email: "hotel@hexapos.com", password: "admin123" },
        { email: "salon@hexapos.com", password: "admin123" },
        { email: "clinic@hexapos.com", password: "admin123" },
        { email: "retail@hexapos.com", password: "admin123" }
      ];

      const isValid = validCredentials.some(cred => 
        cred.email === email && cred.password === password
      );

      if (isValid) {
        login(email);
        toast({
          title: "Login Successful",
          description: "Welcome to BizHub POS!",
        });
        navigate("/");
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

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <h1 className="text-3xl font-bold text-white">BizHub POS</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hexapos.com"
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
          
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p className="mb-2">Demo credentials:</p>
            <div className="space-y-1">
              <p>🍽️ Restaurant: restaurant@hexapos.com</p>
              <p>🏨 Hotel: hotel@hexapos.com</p>
              <p>💇 Salon: salon@hexapos.com</p>
              <p>🏥 Clinic: clinic@hexapos.com</p>
              <p>🛍️ Retail: retail@hexapos.com</p>
              <p className="mt-2">Password: admin123 (for all)</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
