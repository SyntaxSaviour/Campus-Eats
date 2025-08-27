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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { restaurantSignupSchema, type RestaurantSignup } from "@shared/schema";

export default function RestaurantSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  
  const form = useForm<RestaurantSignup>({
    resolver: zodResolver(restaurantSignupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      businessLicense: "",
      campusLocation: "",
      role: "restaurant",
      isVerified: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: RestaurantSignup) => {
      const response = await apiRequest("POST", "/api/auth/restaurant/signup", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user, data.restaurant);
      toast({
        title: "Account created successfully!",
        description: "Welcome to CampusEats!",
      });
      setLocation("/restaurant/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RestaurantSignup) => {
    signupMutation.mutate(data);
  };

  return (
    <main className="pt-16 min-h-screen" data-testid="restaurant-signup-page">
      <div className="max-w-md mx-auto mt-20 px-4">
        <Card className="shadow-lg border border-border" data-testid="signup-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="text-secondary-foreground text-2xl" />
              </div>
              <h2 className="text-2xl font-bold mb-2" data-testid="signup-title">Restaurant Sign Up</h2>
              <p className="text-muted-foreground" data-testid="signup-subtitle">Partner with CampusEats</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter restaurant name" 
                          {...field} 
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  name="businessLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business License Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter license number" 
                          {...field} 
                          data-testid="input-license"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="campusLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campus Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-location">
                            <SelectValue placeholder="Select campus area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Food Court">Food Court</SelectItem>
                          <SelectItem value="Near Hostel Block A">Near Hostel Block A</SelectItem>
                          <SelectItem value="Near Hostel Block B">Near Hostel Block B</SelectItem>
                          <SelectItem value="Academic Block">Academic Block</SelectItem>
                          <SelectItem value="Off Campus">Off Campus</SelectItem>
                        </SelectContent>
                      </Select>
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
                          placeholder="Create a password" 
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
                  disabled={signupMutation.isPending}
                  data-testid="submit-signup"
                >
                  {signupMutation.isPending ? "Creating account..." : "Sign Up as Restaurant"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/restaurant/login" className="text-secondary hover:underline" data-testid="link-login">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
