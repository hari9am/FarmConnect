import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Star, MapPin, User, MessageCircle, ShoppingCart, Minus, Plus, Truck, Leaf, ShieldCheck, Share2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailParams {
  id: string;
}

export default function ProductDetail() {
  const [, navigate] = useLocation();
  const { id } = useParams<ProductDetailParams>();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: crop, isLoading } = useQuery({
    queryKey: ["/api/crops", id],
    queryFn: () => fetch(`/api/crops/${id}`).then(res => res.json()),
    enabled: !!id,
    staleTime: 60_000,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/reviews/crop", id],
    queryFn: () => fetch(`/api/reviews/crop/${id}`).then(res => res.json()),
    enabled: !!id,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex flex-col pt-20 px-4">
        <div className="farm-bg fixed inset-0 z-0 pointer-events-none opacity-20">
          <div className="farm-leaf top-[-10%] left-[-10%]" />
          <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent" />
        </div>
        <div className="relative z-10 space-y-4 animate-pulse">
          <div className="w-full aspect-[4/3] glass-ultra rounded-[2rem]"></div>
          <div className="h-10 w-3/4 glass-ultra rounded-xl"></div>
          <div className="h-6 w-1/4 glass-ultra rounded-lg"></div>
          <div className="h-32 w-full glass-ultra rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="mobile-container min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/20">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>{t("product_not_found") || 'Harvest Not Found'}</h1>
        <p className="text-muted-foreground mb-8 font-medium">{t("product_removed_desc") || 'This item may have already been collected or removed.'}</p>
        <Button className="btn-organic px-8 h-14 rounded-2xl font-bold" onClick={() => navigate("/customer/dashboard")}>
          {t("back_to_market") || 'Return to Marketplace'}
        </Button>
      </div>
    );
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(crop.quantity, quantity + delta));
    setQuantity(newQuantity);
  };

  const handleAskDelivery = async () => {
    try {
      const token = localStorage.getItem("farmconnect-token");
      if (!token) {
        toast({ title: t("login_required"), description: t("please_sign_in_to_request_delivery"), variant: "destructive" });
        return;
      }
      const res = await fetch("/api/delivery-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cropId: crop.id, quantity }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: t("delivery_requested"), description: t("farmer_will_set_price") });
      navigate("/customer/dashboard");
    } catch (e: any) {
      toast({ title: t("request_failed"), description: e?.message, variant: "destructive" });
    }
  };

  const handleDirections = () => {
    try {
      const loc = (crop.location || crop.farmLocation || {}) as any;
      const lat = Number(loc.lat);
      const lng = Number(loc.lng);
      if (!isFinite(lat) || !isFinite(lng)) {
        toast({ title: t("update_failed"), description: t("location_unavailable"), variant: "destructive" });
        return;
      }
      const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lat + "," + lng)}&travelmode=driving`;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast({ title: t("update_failed"), description: t("location_unavailable"), variant: "destructive" });
    }
  };

  const handleBuyNow = () => {
    navigate(`/payment/${crop.id}?quantity=${quantity}`);
  };

  const handleAddToCart = () => {
    try {
      const key = "farmconnect-cart";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const itemIndex = existing.findIndex((it: any) => it.cropId === crop.id);
      const newItem = {
        cropId: crop.id,
        name: crop.name,
        pricePerUnit: parseFloat(crop.pricePerUnit),
        unit: crop.unit,
        quantity,
        image: crop.images?.[0] || null,
        farmerId: crop.farmerId,
      };
      if (itemIndex >= 0) {
        const updatedQty = Math.min(crop.quantity, (existing[itemIndex].quantity || 0) + quantity);
        existing[itemIndex] = { ...existing[itemIndex], quantity: updatedQty };
      } else {
        existing.push(newItem);
      }
      localStorage.setItem(key, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent("cart:updated"));
      toast({ title: t("added_to_cart"), description: `${quantity} ${crop.unit} ${t("added_to_cart")}` });
    } catch (e) {
      toast({ title: t("update_failed"), description: t("error_sending_msg"), variant: "destructive" });
    }
  };

  const handleContactFarmer = async () => {
    try {
      const res = await fetch(`/api/farmers/${crop.farmerId}`);
      if (!res.ok) throw new Error("Failed to fetch farmer");
      const farmer = await res.json();
      navigate(`/chat/${farmer.userId}`);
    } catch {
      toast({ title: t("update_failed"), description: t("error_sending_msg"), variant: "destructive" });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({ title: isFavorite ? t("removed_from_favorites") : t("added_to_favorites") });
  };

  const totalPrice = (parseFloat(crop.pricePerUnit) * quantity).toFixed(2);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen text-foreground font-sans relative pb-48 lg:pb-32">
      {/* Background System */}
      <div className="farm-bg fixed inset-0 z-0">
        <div className="farm-leaf top-[-10%] left-[-10%] opacity-10" />
        <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col">
        {/* Visual Showcase Header */}
        <header className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden group">
          <img 
            src={crop.images?.[0] || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?auto=format&fit=crop&w=1200&q=80"} 
            alt={crop.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[20s] ease-linear"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
          
          <div className="absolute top-0 left-0 right-0 px-4 py-6 flex justify-between items-center z-30">
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="w-12 h-12 rounded-2xl glass-ultra flex items-center justify-center border border-white/20 text-white hover:bg-primary/20 transition-all shadow-xl"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex gap-3">
              <button className="w-12 h-12 rounded-2xl glass-ultra flex items-center justify-center border border-white/20 text-white hover:bg-primary/20 transition-all shadow-xl">
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={toggleFavorite}
                className="w-12 h-12 rounded-2xl glass-ultra flex items-center justify-center border border-white/20 text-white hover:bg-accent/40 transition-all shadow-xl"
              >
                <Heart className={`h-6 w-6 ${isFavorite ? "fill-accent text-accent" : ""}`} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-12 left-6 right-6 z-20">
            <Badge className="bg-primary/90 text-white border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest mb-3 backdrop-blur shadow-lg shadow-primary/20">
              <Leaf className="w-3.5 h-3.5 mr-2" /> {t("harvest_fresh_guarantee") || 'Harvest Fresh Guarantee'}
            </Badge>
          </div>
        </header>

        <div className="px-4 md:px-8 max-w-5xl mx-auto w-full -mt-10 relative z-20 space-y-6">
          {/* Main Product Intelligence Card */}
          <div className="glass-card p-1 shadow-2xl">
            <div className="bg-white/95 dark:bg-card/95 rounded-[2.5rem] p-8 space-y-6 border border-white/20 shadow-inner">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-primary leading-none" style={{ fontFamily: 'var(--font-display)' }}>{crop.name}</h1>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-xl border border-accent/10 font-black text-xs">
                        <Star className="w-4 h-4 fill-accent" />
                        {averageRating}
                     </div>
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{reviews.length} Trust Ratings</p>
                  </div>
                </div>
                <div className="bg-primary/5 p-4 rounded-3xl border border-primary/10 min-w-[140px] text-center">
                  <p className="text-4xl font-black text-primary tracking-tighter">₹{crop.pricePerUnit}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">per {crop.unit}</p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">{t("cultivation_insights") || 'Cultivation Insights'}</p>
                <p className="text-muted-foreground text-lg leading-relaxed font-bold">
                  {crop.description || 'This premium harvest was cultivated using sustainable practices, ensuring maximum nutrient density and flavor profile.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                 <Badge variant="outline" className="rounded-full px-4 py-1.5 border-primary/20 text-primary font-bold bg-primary/5">Organic Mineralization</Badge>
                 <Badge variant="outline" className="rounded-full px-4 py-1.5 border-primary/20 text-primary font-bold bg-primary/5">Zero Synthetics</Badge>
                 <Badge variant="outline" className="rounded-full px-4 py-1.5 border-primary/20 text-primary font-bold bg-primary/5">Sun-Ripened</Badge>
              </div>
            </div>
          </div>

          {/* Logistics & Source System */}
          <div className="grid md:grid-cols-2 gap-6">
             <div className="glass-card p-1">
                <div className="bg-white/95 dark:bg-card/95 rounded-[2rem] p-6 h-full flex flex-col justify-between shadow-lg border border-white/20">
                   <div className="space-y-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                         <ShieldCheck className="w-3 h-3 mr-2" /> {t("verified_farmer") || 'Verified Farmer'}
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User className="w-7 h-7 text-primary" />
                         </div>
                         <div>
                            <p className="font-black text-foreground text-lg leading-none">{t("local_grower") || 'Community Grower'}</p>
                            <p className="text-xs font-bold text-muted-foreground mt-1">Lush Green Farms • 2km away</p>
                         </div>
                      </div>
                   </div>
                   <div className="flex gap-3 mt-8">
                     <button onClick={handleContactFarmer} className="flex-1 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-2 hover:bg-primary/20 transition font-black text-[10px] uppercase tracking-widest text-primary">
                       <MessageCircle className="w-4 h-4" /> Message
                     </button>
                     <button onClick={handleDirections} className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition text-primary">
                       <MapPin className="w-5 h-5" />
                     </button>
                   </div>
                </div>
             </div>

             <div className="glass-card p-1">
                <div className="bg-white/95 dark:bg-card/95 rounded-[2rem] p-6 h-full flex flex-col justify-between shadow-lg border border-white/20">
                   <div className="space-y-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest">
                         <Truck className="w-3 h-3 mr-2" /> {t("fulfillment") || 'Logistics'}
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <ShoppingCart className="w-7 h-7 text-accent" />
                         </div>
                         <div>
                            <p className="font-black text-foreground text-lg leading-none">{crop.quantity} {crop.unit} {t("in_stock") || 'Available'}</p>
                            <p className="text-xs font-bold text-muted-foreground mt-1">Ready for same-day delivery</p>
                         </div>
                      </div>
                   </div>
                   <button onClick={handleAskDelivery} className="w-full mt-8 py-4 rounded-xl border border-accent/20 bg-accent/5 text-[10px] font-black uppercase tracking-[0.2em] text-accent hover:bg-accent/10 transition shadow-sm">
                     {t("ask_delivery_price") || 'Request Delivery Quote'}
                   </button>
                </div>
             </div>
          </div>

          {/* Social Proof (Reviews) */}
          {reviews.length > 0 && (
            <div className="space-y-6 pt-4 pb-12">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-black tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Harvest Feedbacks</h3>
                <button className="text-xs font-black text-primary uppercase tracking-widest">See All</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {reviews.slice(0, 2).map((review: any) => (
                  <div key={review.id} className="glass-card p-1">
                    <div className="bg-white/80 dark:bg-card/80 rounded-[1.5rem] p-5 flex gap-5 border border-white/20 shadow-sm h-full">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center shadow-inner">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-black text-sm text-foreground">Premium User</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed italic line-clamp-2">"{review.comment}"</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Futuristic Bottom Interaction Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-8 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto">
          <div className="glass-ultra rounded-[2.5rem] p-3 border border-white/30 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-white/95 dark:bg-card/95">
             <div className="bg-primary/5 rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4 md:gap-6 border border-primary/10">
                <div className="flex items-center justify-between w-full md:w-auto gap-8 px-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleQuantityChange(-1)} className="w-10 h-10 rounded-full bg-white border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all text-primary shadow-sm">
                      <Minus className="w-5 h-5 font-black" />
                    </button>
                    <p className="text-2xl font-black text-primary min-w-[32px] text-center" style={{ fontFamily: 'var(--font-display)' }}>{quantity}</p>
                    <button onClick={() => handleQuantityChange(1)} className="w-10 h-10 rounded-full bg-white border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all text-primary shadow-sm">
                      <Plus className="w-5 h-5 font-black" />
                    </button>
                  </div>
                  <div className="md:hidden text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Impact Total</p>
                    <p className="text-2xl font-black text-primary leading-none tracking-tighter">₹{totalPrice}</p>
                  </div>
                </div>

                <div className="hidden md:block h-10 w-px bg-primary/10" />

                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={handleAddToCart}
                    className="w-14 h-14 rounded-2xl bg-white border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition-all shrink-0 text-primary shadow-sm"
                  >
                    <ShoppingCart className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 h-14 rounded-2xl btn-organic text-lg font-black flex items-center justify-center gap-3 shadow-xl overflow-hidden group/buy"
                  >
                    <span className="group-hover/buy:translate-x-1 transition-transform">{t("buy_now") || 'Secure Harvest'}</span>
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur">
                       <Plus className="w-4 h-4" />
                    </div>
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

