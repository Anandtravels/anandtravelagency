import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AgentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, isAgent, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If already authenticated and agent, redirect to agent dashboard
  useEffect(() => {
    if (user && isAgent && !loading) {
      navigate("/agent-dashboard", { replace: true });
    }
  }, [user, isAgent, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
      </div>
    );
  }

  if (user && isAgent) {
    return <Navigate to="/agent-dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For debugging only - uncomment if you need to debug auth issues
      /*
      import { debugAuth } from '@/utils/authDebugger';
      const debugResult = await debugAuth(email, password);
      console.log("Auth debug result:", debugResult);
      */
      
      const { user, error } = await signIn(email, password, 'agent');
      
      if (error) {
        console.error("Agent login error:", error);
        toast({
          title: "Authentication Error",
          description: error.message || "Invalid agent credentials",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login Successful",
        description: "Welcome to the agent dashboard",
      });
      
      navigate("/agent-dashboard", { replace: true });
    } catch (error: any) {
      console.error("Agent login exception:", error);
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-travel-blue-dark">
            Agent Login
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access your agent dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-travel-blue-dark hover:bg-travel-blue-dark/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AgentLogin;
