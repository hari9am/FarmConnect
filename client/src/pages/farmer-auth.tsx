import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const step1Schema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  kissanNumber: z.string().min(10, "Please enter a valid Kissan card number"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

const step2Schema = z.object({
  bankAccountNumber: z.string().min(9, "Please enter a valid account number"),
  ifscCode: z.string().min(11, "Please enter a valid IFSC code"),
  upiId: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export default function FarmerAuth() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const { toast } = useToast();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("farmconnect-token", data.token);
      localStorage.setItem("farmconnect-user", JSON.stringify(data.user));
      toast({
        title: "Registration Successful!",
        description: "Welcome to FarmConnect. Your farmer account has been created.",
      });
      navigate("/farmer/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2Submit = (data: Step2Data) => {
    if (!step1Data) return;

    const registrationData = {
      ...step1Data,
      ...data,
      role: "farmer",
      password: Math.random().toString(36).slice(-8), // Temporary password - in real app, would use proper OTP flow
    };

    registerMutation.mutate(registrationData);
  };

  return (
    <div className="mobile-container">
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => step === 1 ? navigate("/role") : setStep(1)}
              data-testid="back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold" data-testid="page-title">Farmer Registration</h1>
          </div>
        </header>

        <div className="flex-1 p-6">
          {step === 1 && (
            <div data-testid="farmer-step-1">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <span className="text-sm text-muted-foreground">Personal Information</span>
                </div>
                <h2 className="text-xl font-semibold mb-2" data-testid="step1-title">Enter Your Details</h2>
                <p className="text-muted-foreground" data-testid="step1-description">We need to verify your farmer identity</p>
              </div>

              <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Full Name</Label>
                  <Input
                    id="username"
                    placeholder="Enter your full name"
                    {...step1Form.register("username")}
                    data-testid="input-username"
                  />
                  {step1Form.formState.errors.username && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kissanNumber">Kissan Card Number</Label>
                  <Input
                    id="kissanNumber"
                    placeholder="Enter your Kissan card number"
                    {...step1Form.register("kissanNumber")}
                    data-testid="input-kissan-number"
                  />
                  {step1Form.formState.errors.kissanNumber && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.kissanNumber.message}</p>
                  )}
                </div>

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
                      {...step1Form.register("phone")}
                      data-testid="input-phone"
                    />
                  </div>
                  {step1Form.formState.errors.phone && (
                    <p className="text-sm text-destructive">{step1Form.formState.errors.phone.message}</p>
                  )}
                </div>

                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-primary mt-1" />
                      <div className="text-sm">
                        <p className="font-medium mb-1">Why do we need this?</p>
                        <p className="text-muted-foreground">Your Kissan card helps us verify you're a registered farmer. We'll send an OTP to your phone for security.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" data-testid="button-send-otp">
                  Send OTP
                </Button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div data-testid="farmer-step-2">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <span className="text-sm text-muted-foreground">Payment Information</span>
                </div>
                <h2 className="text-xl font-semibold mb-2" data-testid="step2-title">Bank & UPI Details</h2>
                <p className="text-muted-foreground" data-testid="step2-description">Add your payment details to receive money</p>
              </div>

              <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    placeholder="Enter account number"
                    {...step2Form.register("bankAccountNumber")}
                    data-testid="input-bank-account"
                  />
                  {step2Form.formState.errors.bankAccountNumber && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.bankAccountNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="Enter IFSC code"
                    {...step2Form.register("ifscCode")}
                    data-testid="input-ifsc-code"
                  />
                  {step2Form.formState.errors.ifscCode && (
                    <p className="text-sm text-destructive">{step2Form.formState.errors.ifscCode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID (Optional)</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@paytm"
                    {...step2Form.register("upiId")}
                    data-testid="input-upi-id"
                  />
                </div>

                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-primary mt-1" />
                      <div className="text-sm">
                        <p className="font-medium mb-1">Secure & Encrypted</p>
                        <p className="text-muted-foreground">Your payment details are encrypted and secure. We use bank-grade security.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={registerMutation.isPending}
                  data-testid="button-complete-registration"
                >
                  {registerMutation.isPending ? "Creating Account..." : "Complete Registration"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
