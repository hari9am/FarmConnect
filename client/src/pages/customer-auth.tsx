import { useEffect, useState } from "react";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, LogIn, Leaf, ShieldCheck, Phone, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

const OTP_LENGTH = 6;

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number"),
});

const registerSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

type PhoneData = z.infer<typeof phoneSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function CustomerAuth() {
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [otpRequested, setOtpRequested] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated() && getUserRole() === "customer") {
      navigate("/customer/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const phoneForm = useForm<PhoneData>({
    resolver: zodResolver(phoneSchema),
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const sendOtpMutation = useMutation({
    mutationFn: async (data: { phone: string; isLogin?: boolean }) => {
      const res = await apiRequest("POST", "/api/auth/send-otp", { 
        phone: data.phone, 
        role: "customer",
        isLogin: data.isLogin 
      });
      return res.json();
    },
    onSuccess: (data) => {
      setOtpRequested(true);
      setIsNewUser(data.isNewUser);
      setResendTimer(60);
      toast({ title: t("otp_sent") || "OTP sent", description: t("otp_sent_desc") || "We sent a 6-digit OTP to your phone." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send OTP", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp, userData }: { phone: string; otp: string; userData?: any }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { phone, otp, userData });
      return res.json();
    },
    onSuccess: (data: any) => {
      localStorage.setItem("farmconnect-token", data.token);
      localStorage.setItem("farmconnect-user", JSON.stringify(data.user));
      toast({ title: "Success!", description: isNewUser ? "Registration successful!" : "Welcome back to FarmConnect." });
      navigate("/customer/dashboard");
    },
    onError: (error: any) => {
      toast({ title: "Invalid OTP", description: error.message || "Please try again.", variant: "destructive" });
    },
  });

  const handleSendOtp = () => {
    const phone = phoneForm.getValues("phone");
    if (!phone) {
      toast({ title: "Phone required", description: "Please enter your phone number", variant: "destructive" });
      return;
    }
    sendOtpMutation.mutate({ phone, isLogin: true });
  };

  const handleVerifyOtp = () => {
    const phone = phoneForm.getValues("phone");
    if (!phone || otpCode.length !== OTP_LENGTH) return;
    if (isNewUser) {
      setIsLogin(false);
      registerForm.setValue("phone", phone);
    } else {
      const userData = { username: "User", phone, role: "customer", language: "en" };
      verifyOtpMutation.mutate({ phone, otp: otpCode, userData });
    }
  };

  const handleRegisterSubmit = (data: RegisterData) => {
    const userData = { username: data.username, phone: data.phone, role: "customer", language: "en" };
    verifyOtpMutation.mutate({ phone: data.phone, otp: otpCode, userData });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    phoneForm.reset();
    registerForm.reset();
    setOtpRequested(false);
    setOtpCode("");
    setResendTimer(0);
    setIsNewUser(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans text-foreground pb-12">
      {/* Organic Farm Background */}
      <div className="farm-bg">
        <div className="farm-leaf top-[-10%] left-[-10%]" />
        <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent opacity-5" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-4 py-6 md:px-8 glass-ultra border-b border-white/20 sticky top-0 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 backdrop-blur rounded-2xl flex items-center justify-center border border-primary/20">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-black text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>FarmConnect.</h1>
            </div>
            <Button variant="ghost" onClick={() => navigate("/role")} className="text-foreground hover:bg-primary/10 rounded-xl font-bold">
              <ArrowLeft className="h-5 w-5 mr-1" /> {t("back") || 'Back'}
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-[440px] animate-fade-up">
            <div className="text-center mb-8">
               <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                 <ShieldCheck className="w-3.5 h-3.5 mr-2" /> {t("secure_channel") || 'Secure Connection'}
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                 {isLogin ? (t("gateway_login") || 'Login') : (t("gateway_setup") || 'Register')}
               </h2>
               <p className="text-muted-foreground font-medium text-sm">
                 {isLogin ? (t("sign_into_consumer_protocol") || 'Access the fresh marketplace.') : (t("join_collective_buy_direct") || 'Join our soil-to-soul movement.')}
               </p>
            </div>

            <div className="glass-card p-1 border border-white/20 shadow-2xl overflow-hidden rounded-[2.5rem]">
              <div className="bg-white/70 h-full p-8 md:p-10 rounded-[2.3rem] shadow-inner">
                {isLogin ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest ml-1">{t("phone_number") || 'Phone Number'}</Label>
                      <div className="flex gap-3">
                        <div className="w-20 rounded-2xl bg-white/60 border border-primary/10 flex items-center justify-center font-bold text-primary shadow-sm h-14">+91</div>
                        <Input
                          placeholder={t("enter_phone_number") || '9876543210'}
                          className="h-14 rounded-2xl bg-white/80 border-primary/10 text-lg font-bold placeholder:text-muted-foreground/40 focus:ring-primary shadow-sm"
                          type="tel"
                          {...phoneForm.register("phone")}
                        />
                      </div>
                      {phoneForm.formState.errors.phone && <p className="text-xs text-destructive font-bold ml-1">{phoneForm.formState.errors.phone.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest ml-1">{t("otp_code") || 'OTP Verification'}</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={OTP_LENGTH}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                        disabled={!otpRequested || verifyOtpMutation.isPending}
                        className="h-16 text-3xl tracking-[0.4em] text-center font-black rounded-2xl bg-white/80 border-primary/10 text-primary placeholder:text-muted-foreground/20 focus:ring-primary shadow-sm"
                      />

                      {!otpRequested ? (
                        <Button 
                          className="w-full btn-organic py-8 text-lg rounded-2xl shadow-xl shadow-primary/20 mt-4" 
                          onClick={handleSendOtp} 
                          disabled={sendOtpMutation.isPending}
                        >
                          {sendOtpMutation.isPending ? (t("connecting_btn") || 'Connecting...') : (t("transmit_otp") || 'Send OTP')}
                          <Zap className="ml-2 w-5 h-5 fill-current" />
                        </Button>
                      ) : (
                        <Button 
                          className="w-full btn-organic py-8 text-lg rounded-2xl shadow-xl shadow-primary/20 mt-4" 
                          onClick={handleVerifyOtp} 
                          disabled={verifyOtpMutation.isPending || otpCode.length !== OTP_LENGTH}
                        >
                          {verifyOtpMutation.isPending ? (t("decrypting_btn") || 'Verifying...') : (t("initialize_session") || 'Login')}
                        </Button>
                      )}

                      {otpRequested && (
                        <div className="text-center mt-4">
                          {resendTimer > 0 ? (
                            <span className="text-xs text-muted-foreground font-bold">{t("resend_otp_in") || 'Resend in'} {resendTimer}s</span>
                          ) : (
                            <button onClick={handleSendOtp} disabled={sendOtpMutation.isPending} className="text-xs text-primary hover:underline font-black uppercase tracking-widest">
                              {t("resend_transmission") || 'Resend OTP'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-center mt-10 pt-8 border-t border-primary/5">
                      <p className="text-xs text-muted-foreground font-bold">
                        {t("no_active_node") || 'New explorer?'}
                        <button onClick={switchMode} className="text-accent hover:text-accent/80 font-black ml-2 uppercase tracking-tight">
                          {t("register_node") || 'Join Platform'}
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest ml-1">{t("full_name") || 'Your Full Name'}</Label>
                      <Input
                        placeholder={t("your_identity") || 'John Doe'}
                        {...registerForm.register("username")}
                        className="h-14 rounded-2xl bg-white/80 border-primary/10 text-lg font-bold focus:ring-primary shadow-sm"
                      />
                      {registerForm.formState.errors.username && <p className="text-xs text-destructive font-bold ml-1">{registerForm.formState.errors.username.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest ml-1">{t("phone_number") || 'Phone Number'}</Label>
                      <div className="flex gap-3">
                        <div className="w-20 rounded-2xl bg-white/60 border border-primary/10 flex items-center justify-center font-bold text-primary shadow-sm h-14">+91</div>
                        <Input
                          placeholder='9876543210'
                          className="h-14 rounded-2xl bg-white/80 border-primary/10 text-lg font-bold focus:ring-primary shadow-sm"
                          type="tel"
                          {...registerForm.register("phone")}
                        />
                      </div>
                      {registerForm.formState.errors.phone && <p className="text-xs text-destructive font-bold ml-1">{registerForm.formState.errors.phone.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-muted-foreground font-black text-[10px] uppercase tracking-widest ml-1">{t("otp_code") || 'OTP Verification'}</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={OTP_LENGTH}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                        disabled={verifyOtpMutation.isPending}
                        className="h-16 text-3xl tracking-[0.4em] text-center font-black rounded-2xl bg-white/80 border-primary/10 text-primary placeholder:text-muted-foreground/20 focus:ring-primary shadow-sm"
                      />
                      
                      {!otpRequested && (
                        <Button 
                          className="w-full btn-organic py-8 text-lg rounded-2xl shadow-xl shadow-primary/20 mt-4" 
                          onClick={() => {
                            const phone = registerForm.getValues("phone");
                            if (!phone) return;
                            sendOtpMutation.mutate({ phone, isLogin: false });
                          }} 
                          disabled={sendOtpMutation.isPending}
                        >
                          {sendOtpMutation.isPending ? (t("sending_btn") || 'Sending...') : (t("transmit_otp") || 'Send OTP')}
                        </Button>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-organic py-8 text-lg rounded-2xl shadow-xl shadow-primary/20 mt-4" 
                      disabled={verifyOtpMutation.isPending || otpCode.length !== OTP_LENGTH}
                    >
                      {verifyOtpMutation.isPending ? (t("deploying_btn") || 'Joining...') : (t("finalize_protocol") || 'Complete Register')}
                    </Button>

                    <div className="text-center mt-10 pt-8 border-t border-primary/5">
                      <p className="text-xs text-muted-foreground font-bold">
                        {t("node_already_exists") || 'Already a member?'}
                        <button onClick={switchMode} className="text-accent hover:text-accent/80 font-black ml-2 uppercase tracking-tight">
                          {t("access_node") || 'Login'}
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

