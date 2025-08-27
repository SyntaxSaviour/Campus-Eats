import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginCredentials } from "@shared/schema";

export default function RestaurantLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.user.role !== "restaurant") {
        toast({
          title: "Access denied",
          description: "This login is for restaurant owners only.",
          variant: "destructive",
        });
        return;
      }
      
      login(data.user, data.restaurant);
      toast({
        title: "Login successful!",
        description: "Welcome back to CampusEats!",
      });
      setLocation("/restaurant/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    loginMutation.mutate(data);
  };

  return (
    <main className="pt-16 min-h-screen" data-testid="restaurant-login-page">
      <div className="max-w-md mx-auto mt-20 px-4">
        <Card className="shadow-lg border border-border" data-testid="login-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="text-secondary-foreground text-2xl" />
              </div>
              <h2 className="text-2xl font-bold mb-2" data-testid="login-title">Restaurant Login</h2>
              <p className="text-muted-foreground" data-testid="login-subtitle">Access your restaurant dashboard</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="business@restaurant.com" 
                          {...field} 
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Enter your password" 
                          {...field} 
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  variant="secondary"
                  className="w-full"
                  disabled={loginMutation.isPending}
                  data-testid="submit-login"
                >
                  {loginMutation.isPending ? "Logging in..." : "Login as Restaurant"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/restaurant/signup" className="text-secondary hover:underline" data-testid="link-signup">
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
