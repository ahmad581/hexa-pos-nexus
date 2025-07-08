
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
        { email: "restaurant@bizhub.com", password: "demo123" },
        { email: "hotel@bizhub.com", password: "demo123" },
        { email: "salon@bizhub.com", password: "demo123" },
        { email: "clinic@bizhub.com", password: "demo123" },
        { email: "retail@bizhub.com", password: "demo123" },
        { email: "pharmacy@bizhub.com", password: "demo123" },
        { email: "grocery@bizhub.com", password: "demo123" },
        { email: "gym@bizhub.com", password: "demo123" },
        { email: "autorepair@bizhub.com", password: "demo123" },
        { email: "petcare@bizhub.com", password: "demo123" }
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

  const fillCredentials = (businessEmail: string) => {
    setEmail(businessEmail);
    setPassword("demo123");
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
          
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p className="mb-3">Demo credentials (Password: demo123):</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("restaurant@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                🍽️ Restaurant
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("hotel@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                🏨 Hotel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("salon@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                💇 Hair Salon
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("clinic@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                🏥 Medical Clinic
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("retail@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                🛍️ Retail Store
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("pharmacy@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                💊 Pharmacy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("grocery@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                🛒 Grocery Store
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("gym@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                💪 Gym & Fitness
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("autorepair@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                🔧 Auto Repair
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fillCredentials("petcare@bizhub.com")}
                className="text-left justify-start p-2 h-auto"
              >
                🐾 Pet Care
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
