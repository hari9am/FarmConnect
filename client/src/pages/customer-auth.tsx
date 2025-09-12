import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const customerSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  termsAccepted: z.boolean().refine(val => val, "You must accept the terms and conditions"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function CustomerAuth() {
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      termsAccepted: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("farmconnect-token", data.token);
      localStorage.setItem("farmconnect-user", JSON.stringify(data.user));
      toast({
        title: isLogin ? "Welcome back!" : "Registration Successful!",
        description: isLogin ? "You have successfully logged in." : "Welcome to FarmConnect. Your customer account has been created.",
      });
      navigate("/customer/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CustomerFormData) => {
    const submitData = isLogin 
      ? { phone: data.phone, password: data.password }
      : { ...data, role: "customer" };
    
    registerMutation.mutate(submitData);
  };

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/role")}
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold" data-testid="page-title">
              {isLogin ? "Customer Login" : "Customer Registration"}
            </h1>
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="mb-6 text-center">
            <img 
              src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
              alt="Fresh produce at local farmers market" 
              className="w-24 h-24 mx-auto rounded-full mb-4 object-cover border-2 border-accent/20"
            />
            <h2 className="text-xl font-semibold mb-2" data-testid="form-title">
              {isLogin ? "Welcome Back" : "Join FarmConnect"}
            </h2>
            <p className="text-muted-foreground" data-testid="form-description">
              {isLogin ? "Sign in to your account" : "Get fresh produce directly from farmers"}
            </p>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Full Name</Label>
                <Input
                  id="username"
                  placeholder="Enter your full name"
                  {...form.register("username")}
                  data-testid="input-username"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex space-x-2">
                <Select defaultValue="+91">
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+91">+91</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  className="flex-1"
                  {...form.register("phone")}
                  data-testid="input-phone"
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isLogin ? "Password" : "Create Password"}</Label>
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                {...form.register("password")}
                data-testid="input-password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            {!isLogin && (
              <div className="flex items-start space-x-3 bg-muted p-4 rounded-lg">
                <Checkbox
                  id="terms"
                  {...form.register("termsAccepted")}
                  data-testid="checkbox-terms"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the <Button variant="link" className="p-0 h-auto text-primary">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto text-primary">Privacy Policy</Button>
                </Label>
              </div>
            )}

            {!isLogin && form.formState.errors.termsAccepted && (
              <p className="text-sm text-destructive">{form.formState.errors.termsAccepted.message}</p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
              data-testid="button-submit"
            >
              {registerMutation.isPending 
                ? (isLogin ? "Signing In..." : "Creating Account...") 
                : (isLogin ? "Sign In" : "Register & Send OTP")
              }
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary"
                  onClick={() => setIsLogin(!isLogin)}
                  data-testid="toggle-auth-mode"
                >
                  {isLogin ? "Register" : "Sign In"}
                </Button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
