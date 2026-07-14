import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft, Shield, Smartphone, Banknote, Lock, Star,
  CheckCircle2, Zap, Gift, Wallet, Package, Truck, ChevronRight, Loader2, Leaf, ShieldCheck
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { addPoints, REWARD_POINTS_PER_PURCHASE, getWalletBalance } from "@/lib/rewards";
import { openHostedCheckout } from "@/lib/pay";
import { useLanguage } from "@/hooks/use-language";

interface PaymentParams {
  cropId: string;
}

// ─── Success Screen ──────────────────────────────────────────────────────────
function SuccessScreen({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-xl animate-fade-in px-6">
      <div className="glass-ultra rounded-[3rem] p-12 flex flex-col items-center gap-8 max-w-sm w-full border border-white/40 shadow-2xl text-center bg-white/90">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white shadow-2xl animate-bounce">
            <CheckCircle2 className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute top-0 right-0 w-10 h-10 rounded-2xl bg-accent flex items-center justify-center shadow-lg border-2 border-white">
            <Zap className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("order_confirmed") || 'Harvest Secured!'}</h2>
          <p className="text-muted-foreground text-sm font-black uppercase tracking-widest">{t("order_confirmed_desc") || 'Your organic batch is being prepared.'}</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-6 py-3 shadow-inner">
          <Gift className="w-5 h-5 text-primary" />
          <span className="text-xs font-black text-primary uppercase tracking-widest">+ {REWARD_POINTS_PER_PURCHASE} {t("seeds_earned") || 'Seeds Earned'}</span>
        </div>
        <Button
          className="w-full btn-organic py-8 rounded-3xl text-lg font-black shadow-xl"
          onClick={onClose}
        >
          {t("continue_shopping") || 'Return to Marketplace'}
        </Button>
      </div>
    </div>
  );
}

// ─── Main Payment Component ──────────────────────────────────────────────────
export default function Payment() {
  const [, navigate] = useLocation();
  const { cropId } = useParams<PaymentParams>();
  const [paymentMethod, setPaymentMethod] = useState("hosted");
  const [isPaying, setIsPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const quantity = parseInt(urlParams.get("quantity") || "1");
  const urlDR = urlParams.get("deliveryRequestId");
  const urlPM = (urlParams.get("paymentMethod") || "").toLowerCase();
  const [deliveryRequestId] = useState<string | null>(urlDR);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);

  const walletBalance = getWalletBalance();

  useEffect(() => {
    if (!urlPM) return;
    const allowed = new Set(["hosted", "cod"]);
    if (allowed.has(urlPM)) setPaymentMethod(urlPM);
  }, [urlPM]);

  const { data: crop, isLoading } = useQuery({
    queryKey: ["/api/crops", cropId],
    queryFn: () => fetch(`/api/crops/${cropId}`).then(res => res.json()),
    enabled: !!cropId,
    staleTime: 60_000,
  });

  useEffect(() => {
    (async () => {
      try {
        if (!deliveryRequestId) { setDeliveryFee(0); return; }
        const token = localStorage.getItem("farmconnect-token");
        const res = await fetch(`/api/delivery-requests/${deliveryRequestId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const dr = await res.json();
          const fee = Number(dr?.proposedDeliveryPrice || 0);
          setDeliveryFee(isFinite(fee) ? fee : 0);
        }
      } catch {
        setDeliveryFee(0);
      }
    })();
  }, [deliveryRequestId]);

  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen text-foreground font-sans flex items-center justify-center bg-background">
        <div className="farm-bg fixed inset-0 z-0 pointer-events-none opacity-20">
          <div className="farm-leaf top-[-10%] left-[-10%]" />
          <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="w-72 h-48 glass-ultra rounded-[2.5rem] animate-pulse bg-primary/10 shadow-xl" />
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="mobile-container min-h-screen text-foreground flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-20 h-20 rounded-[2rem] bg-primary/5 flex items-center justify-center mb-6 border border-primary/20 shadow-inner">
           <Package className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-black mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("product_not_found") || 'Checkout Failed'}</h1>
        <p className="text-muted-foreground text-sm mb-8 font-black uppercase tracking-widest">{t("product_removed_desc") || 'Batch session expired or item unavailable.'}</p>
        <Button className="btn-organic px-10 py-4 h-16 rounded-2xl font-black shadow-lg" onClick={() => navigate("/customer/dashboard")}>
          {t("back_to_market") || 'Market Access'}
        </Button>
      </div>
    );
  }

  const subtotal = parseFloat(crop.pricePerUnit) * quantity;
  const walletDiscount = useWallet ? Math.min(walletBalance, subtotal + deliveryFee) : 0;
  const totalAmount = Math.max(0, subtotal + deliveryFee - walletDiscount);

  const clearCart = () => {
    try {
      localStorage.removeItem("farmconnect-cart");
      window.dispatchEvent(new CustomEvent("cart:updated"));
    } catch {}
  };

  const handleSuccess = () => {
    clearCart();
    addPoints(REWARD_POINTS_PER_PURCHASE);
    setShowReview(true);
  };

  const handleConfirmOrder = async () => {
    if (!crop) return;
    try {
      setIsPaying(true);
      await apiRequest("POST", "/api/orders", {
        cropId: crop.id,
        quantity,
        totalPrice: totalAmount.toString(),
        status: "pending",
      });
      handleSuccess();
    } catch (error: any) {
      toast({ title: t("update_failed"), description: error.message, variant: "destructive" });
    } finally {
      setIsPaying(false);
    }
  };

  const handleHostedCheckout = async () => {
    try {
      setIsPaying(true);
      await openHostedCheckout({
        amount: totalAmount,
        cropId: crop.id,
        quantity,
        successPath: "/customer/dashboard",
        cancelPath: `/product/${cropId}`,
      });
    } catch (err: any) {
      toast({ title: t("update_failed"), description: err?.message, variant: "destructive" });
    } finally {
      setIsPaying(false);
    }
  };

  const paymentMethods = [
    {
      id: "hosted",
      icon: Smartphone,
      label: t("upi_cards") || 'Digital Payout',
      description: t("razorpay_desc") || 'Instant secure connection',
      badge: "Fastest",
      badgeColor: "bg-primary/20 text-primary border-primary/10",
    },
    {
      id: "cod",
      icon: Banknote,
      label: "Direct-to-Farmer",
      description: t("cod_desc") || 'Cash on fulfillment',
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="min-h-screen text-foreground font-sans relative pb-12">
      {/* Background System */}
      <div className="farm-bg fixed inset-0 z-0">
        <div className="farm-leaf top-[-10%] left-[-10%] opacity-10" />
        <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      </div>

      {showSuccess && (
        <SuccessScreen onClose={() => { setShowSuccess(false); navigate("/customer/dashboard"); }} />
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-[100] px-4 py-6 md:px-8 border-b border-white/20 glass-ultra shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/product/${cropId}`)}
                className="w-10 h-10 rounded-2xl bg-white/50 border border-primary/10 flex items-center justify-center text-primary hover:bg-white/80 transition shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-black text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                  {t("secure_checkout") || 'Secure Connection'}
                </h1>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-60">
                  {t("end_to_end_encrypted") || 'Encrypted Harvest Access'}
                </p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
          <div className="grid md:grid-cols-5 gap-8">
             {/* Left Column: Order Analysis */}
             <div className="md:col-span-3 space-y-6">
                <div className="glass-card p-1 shadow-2xl animate-fade-up">
                  <div className="bg-white/95 rounded-[2.5rem] p-8 space-y-8 border border-white/20 shadow-inner">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                          <Package className="w-5 h-5 text-primary" />
                       </div>
                       <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t("order_summary") || 'Harvest Specification'}</h2>
                    </div>

                    <div className="flex items-center gap-6 group">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/5 shrink-0 shadow-2xl group-hover:scale-105 transition-transform">
                        <img
                          src={crop.images?.[0] || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?auto=format&fit=crop&w=300&q=80"}
                          alt={crop.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-foreground text-2xl tracking-tighter leading-none" style={{ fontFamily: 'var(--font-display)' }}>{crop.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <Badge variant="outline" className="rounded-full border-primary/10 text-primary bg-primary/5 text-[10px] font-black">{quantity} {crop.unit}</Badge>
                           <p className="text-[10px] font-black text-muted-foreground uppercase">Batch Pricing Secure</p>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-black uppercase tracking-widest text-muted-foreground opacity-60">{t("subtotal")}</span>
                        <span className="font-black text-foreground">₹{subtotal.toFixed(0)}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2">
                             <Truck className="w-3.5 h-3.5" /> Logistics
                          </span>
                          <span className="font-black text-foreground">₹{deliveryFee.toFixed(0)}</span>
                        </div>
                      )}
                      {walletDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-black uppercase tracking-widest text-accent flex items-center gap-2">
                             <Zap className="w-3.5 h-3.5 fill-current" /> {t("wallet_applied") || 'Ecosystem Credit'}
                          </span>
                          <span className="font-black text-accent text-lg">−₹{walletDiscount.toFixed(0)}</span>
                        </div>
                      )}
                      
                      <div className="pt-6 border-t border-primary/10 flex justify-between items-end">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t("total") || 'Impact Total'}</p>
                           <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                              <ShieldCheck className="w-3 h-3 text-primary opacity-40" />
                              <p className="text-[8px] font-black text-muted-foreground uppercase">Price Integrity Verified</p>
                           </div>
                        </div>
                        <span className="text-5xl font-black text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>₹{totalAmount.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="bg-accent/5 border border-accent/10 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-white border border-accent/20 flex items-center justify-center shadow-inner">
                         <Gift className="w-5 h-5 text-accent" />
                      </div>
                      <p className="text-[10px] font-black text-accent uppercase tracking-widest leading-relaxed">
                        {t("earn_points_msg", { points: REWARD_POINTS_PER_PURCHASE }) || `Collect ${REWARD_POINTS_PER_PURCHASE} Seed Points with this sustainabile purchase`}
                      </p>
                    </div>
                  </div>
                </div>
             </div>

             {/* Right Column: Transaction Nodes */}
             <div className="md:col-span-2 space-y-6">
                {walletBalance > 0 && (
                  <div
                    className={`glass-card p-1 transition-all duration-300 cursor-pointer animate-fade-up ${useWallet ? 'shadow-2xl shadow-primary/20' : 'shadow-lg'}`}
                    style={{ animationDelay: '80ms' }}
                    onClick={() => setUseWallet(!useWallet)}
                  >
                    <div className={`rounded-[2rem] p-6 border transition-all duration-300 flex items-center justify-between ${useWallet ? 'bg-primary/5 border-primary/30' : 'bg-white/80 border-white/40 shadow-inner'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${useWallet ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-110' : 'bg-primary/10 text-primary border border-primary/10'}`}>
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-foreground uppercase tracking-tight">{t("farm_wallet") || 'Seed Wallet'}</p>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">₹{walletBalance.toFixed(0)} Available</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${useWallet ? 'bg-primary border-primary shadow-sm' : 'border-primary/20 bg-white'}`}>
                        {useWallet && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                      </div>
                    </div>
                  </div>
                )}

                <div className="glass-card p-1 shadow-2xl animate-fade-up" style={{ animationDelay: '160ms' }}>
                  <div className="bg-white/95 rounded-[2.5rem] p-8 space-y-6 border border-white/20 shadow-inner">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                          <Shield className="w-5 h-5 text-primary" />
                       </div>
                       <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">{t("payment_method") || 'Payout Mechanism'}</h2>
                    </div>

                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                      {paymentMethods.map((method) => {
                        const isSelected = paymentMethod === method.id;
                        return (
                          <div
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`p-1 rounded-[1.8rem] transition-all duration-300 relative ${isSelected ? 'shadow-xl shadow-primary/10 translate-x-1' : ''}`}
                          >
                            <Label htmlFor={method.id} className={`flex items-center gap-4 p-5 rounded-[1.8rem] cursor-pointer border-2 transition-all duration-300 ${
                              isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-background/40 border-white shadow-inner opacity-60'
                            }`}>
                              <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSelected ? 'bg-primary text-white shadow-xl shadow-primary/10' : 'bg-primary/10 text-primary border border-primary/10'}`}>
                                <method.icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-xs uppercase tracking-widest text-foreground">{method.label}</span>
                                  {method.badge && <span className="text-[8px] font-black px-2 py-0.5 rounded-lg border border-primary/20 text-primary uppercase tracking-widest bg-primary/5">{method.badge}</span>}
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground mt-1">{method.description}</p>
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>

                    <div className="pt-6 space-y-4">
                      <Button
                        className="w-full btn-organic py-8 rounded-[1.5rem] text-lg font-black shadow-2xl group/btn"
                        disabled={isPaying}
                        onClick={paymentMethod === "hosted" ? handleHostedCheckout : handleConfirmOrder}
                      >
                         {isPaying ? (
                           <Loader2 className="animate-spin h-6 w-6" />
                         ) : (
                           <>
                             {paymentMethod === "cod" ? <Banknote className="w-6 h-6 mr-3" /> : <Lock className="w-5 h-5 mr-3" />}
                             <span className="group-hover/btn:translate-x-1 transition-transform">{paymentMethod === "cod" ? 'Commit Order' : 'Authorize Payout'}</span>
                             <div className="ml-3 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs">₹{totalAmount.toFixed(0)}</div>
                           </>
                         )}
                      </Button>
                      
                      <div className="text-center">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{t("ssl_encryption_msg") || 'Encrypted Harvest-Layer Security'}</p>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </main>
      </div>

      {/* Modern High-End Review Interface */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="glass-ultra border-white/40 bg-white/95 text-foreground rounded-[3rem] max-w-sm mx-auto p-12 overflow-hidden shadow-[0_48px_80px_-16px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 mx-auto flex items-center justify-center border border-primary/20">
               <Star className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-3xl font-black text-center tracking-tighter leading-tight text-primary uppercase italic" style={{ fontFamily: 'var(--font-display)' }}>
              {t("experience_rating") || 'Rate the Batch'}
            </DialogTitle>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest text-center opacity-70">{t("feedback_helps_others") || 'Your feedback optimizes our community harvests.'}</p>
          </DialogHeader>
          <div className="space-y-8 py-10">
            <div className="flex items-center space-x-3 justify-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  className="p-1 transform hover:scale-150 transition-all duration-500 ease-out active:scale-95"
                >
                  <Star className={`h-12 w-12 transition-all drop-shadow-2xl ${reviewRating >= n ? "text-accent fill-accent scale-110" : "text-primary/10"}`} />
                </button>
              ))}
            </div>
            
            <div className="glass-card p-1">
              <Textarea
                placeholder={t("cultivation_feedback") || 'Detail your experience with this harvest...'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="bg-white/50 border-white/20 text-foreground placeholder:text-muted-foreground/30 rounded-[2rem] p-6 font-bold shadow-inner focus:ring-primary h-36 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-4">
            <Button
              disabled={reviewRating === 0 || submittingReview}
              className="w-full btn-organic py-8 rounded-[1.8rem] font-black text-lg shadow-xl"
              onClick={async () => {
                if (!crop) return;
                try {
                  setSubmittingReview(true);
                  await apiRequest("POST", "/api/reviews", {
                    cropId: crop.id,
                    farmerId: crop.farmerId,
                    rating: reviewRating,
                    comment: reviewComment.trim() || undefined,
                  });
                  toast({ title: t("reward_points_earned", { points: REWARD_POINTS_PER_PURCHASE }) });
                  setShowReview(false);
                  setShowSuccess(true);
                } catch (err: any) {
                  toast({ title: t("update_failed"), description: err.message, variant: "destructive" });
                } finally {
                  setSubmittingReview(false);
                }
              }}
            >
              {submittingReview ? <Loader2 className="animate-spin h-6 w-6" /> : (t("broadcast_feedback") || "Broadcast Feedback")}
            </Button>
            <button
              className="text-[10px] font-black text-muted-foreground hover:text-primary transition-all py-3 uppercase tracking-[0.3em] opacity-40 hover:opacity-100"
              onClick={() => { setShowReview(false); setShowSuccess(true); }}
            >
              Skip Transmission
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const Badge = ({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: string }) => (
  <div className={`inline-flex items-center rounded-3xl text-xs px-3 py-1 ${className}`}>
    {children}
  </div>
);

