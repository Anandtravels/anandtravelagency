import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAdmin, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<'admin' | 'agent'>('admin');

  // If user is already logged in and is an admin, redirect to admin dashboard
  useEffect(() => {
    if (user && isAdmin && !loading) {
      navigate("/admin");
    }
  }, [user, isAdmin, loading, navigate]);

  // If already authenticated and admin, return early
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
      </div>
    );
  }

  // Second check for immediate redirect
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password, loginType);
      
      if (error) {
        toast({
          title: "Authentication Error",
          description: "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login Successful",
        description: loginType === 'admin' ? "Welcome to the admin dashboard" : "Welcome to the agent dashboard",
      });
      
      navigate(loginType === 'admin' ? "/admin" : "/agent-dashboard", { replace: true });
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during login",
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
            {loginType === 'admin' ? 'Admin Login' : 'Agent Login'}
          </CardTitle>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setLoginType('admin')}
              className={`px-4 py-2 rounded ${
                loginType === 'admin' 
                  ? 'bg-travel-blue-dark text-white' 
                  : 'bg-gray-100'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setLoginType('agent')}
              className={`px-4 py-2 rounded ${
                loginType === 'agent' 
                  ? 'bg-travel-blue-dark text-white' 
                  : 'bg-gray-100'
              }`}
            >
              Agent
            </button>
          </div>
          <CardDescription className="text-center">
            Sign in to access the {loginType === 'admin' ? 'admin' : 'agent'} dashboard
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
                placeholder="admin@anandtravels.com"
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

export default AdminLogin;
