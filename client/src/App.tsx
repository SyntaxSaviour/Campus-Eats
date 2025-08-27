import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import StudentSignup from "@/pages/auth/student-signup";
import StudentLogin from "@/pages/auth/student-login";
import RestaurantSignup from "@/pages/auth/restaurant-signup";
import RestaurantLogin from "@/pages/auth/restaurant-login";
import StudentDashboard from "@/pages/student/dashboard";
import RestaurantDashboard from "@/pages/restaurant/dashboard";

function ProtectedRoute({ 
  component: Component, 
  requiredRole 
}: { 
  component: React.ComponentType; 
  requiredRole: string;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || user?.role !== requiredRole) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth/student/signup" component={StudentSignup} />
      <Route path="/auth/student/login" component={StudentLogin} />
      <Route path="/auth/restaurant/signup" component={RestaurantSignup} />
      <Route path="/auth/restaurant/login" component={RestaurantLogin} />
      <Route path="/student/dashboard">
        <ProtectedRoute component={StudentDashboard} requiredRole="student" />
      </Route>
      <Route path="/restaurant/dashboard">
        <ProtectedRoute component={RestaurantDashboard} requiredRole="restaurant" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
