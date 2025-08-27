import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { studentSignupSchema, type StudentSignup } from "@shared/schema";

export default function StudentSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  
  const form = useForm<StudentSignup>({
    resolver: zodResolver(studentSignupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      studentId: "",
      role: "student",
      isVerified: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: StudentSignup) => {
      const response = await apiRequest("POST", "/api/auth/student/signup", data);
      return response.json();
    },
    onSuccess: (data) => {
      login(data.user);
      toast({
        title: "Account created successfully!",
        description: "Welcome to CampusEats!",
      });
      setLocation("/student/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Signup failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StudentSignup) => {
    signupMutation.mutate(data);
  };

  return (
    <main className="pt-16 min-h-screen" data-testid="student-signup-page">
      <div className="max-w-md mx-auto mt-20 px-4">
        <Card className="shadow-lg border border-border" data-testid="signup-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="text-primary-foreground text-2xl" />
              </div>
              <h2 className="text-2xl font-bold mb-2" data-testid="signup-title">Student Sign Up</h2>
              <p className="text-muted-foreground" data-testid="signup-subtitle">Join CampusEats with your student email</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
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
                      <FormLabel>Student Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="yourname@srmist.edu.in" 
                          {...field} 
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Must be a valid @srmist.edu.in email address
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your student ID" 
                          {...field} 
                          data-testid="input-student-id"
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
                  className="w-full"
                  disabled={signupMutation.isPending}
                  data-testid="submit-signup"
                >
                  {signupMutation.isPending ? "Creating account..." : "Sign Up as Student"}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/student/login" className="text-primary hover:underline" data-testid="link-login">
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
