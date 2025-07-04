
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      if (email === "admin@hexapos.com" && password === "admin123") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", email);
        toast({
          title: "Login Successful",
          description: "Welcome to Hexa POS!",
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
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Hexa POS</h1>
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
            <p>Demo credentials:</p>
            <p>Email: admin@hexapos.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
