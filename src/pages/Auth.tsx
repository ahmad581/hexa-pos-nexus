import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, Building2, Crown } from "lucide-react";
import { toast } from "sonner";
import { Navigate, useSearchParams } from "react-router-dom";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const isMasterLogin = searchParams.get('master') === 'true';

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={isMasterLogin ? "/system-master" : "/"} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      // Validate SystemMaster email if this is a master login
      if (isMasterLogin && !email.includes('systemmaster')) {
        setError("Only SystemMaster accounts can use this login method.");
        setIsLoading(false);
        return;
      }
      
      await login(email);
      toast.success("Magic link sent! Check your email to complete login.");
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || "Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1 text-center">
          <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
            isMasterLogin ? 'bg-purple-600' : 'bg-primary'
          }`}>
            {isMasterLogin ? (
              <Crown className="w-6 h-6 text-white" />
            ) : (
              <Building2 className="w-6 h-6 text-primary-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isMasterLogin ? 'SystemMaster Login' : 'Welcome to BizHub'}
          </CardTitle>
          <CardDescription>
            {isMasterLogin 
              ? 'Enter your SystemMaster email to access the master dashboard'
              : 'Enter your email to access your business management dashboard'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Magic Link...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Demo Accounts Available:
            </p>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <code className="bg-muted px-2 py-1 rounded">restaurant@bizhub.com</code>
              <span className="text-xs">(Super Admin Access)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};