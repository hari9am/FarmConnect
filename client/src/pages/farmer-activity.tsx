import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import { ArrowLeft, Calendar, Home, ListChecks, Loader2, MessageCircle, Plus, PlusCircle, Sprout, User, Truck, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import FarmingChatBot from "@/components/farming-chat-bot";

export default function FarmerActivity() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [priceErrors, setPriceErrors] = useState<Record<string, string>>({});
  const priceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/farmer/auth");
      return;
    }

    if (getUserRole() !== "farmer") {
      navigate("/role");
      return;
    }
  }, [navigate]);

  const { data: crops = [], isLoading, error, refetch: refetchCrops } = useQuery({
    queryKey: ["/api/farmer/crops"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/farmer/crops");
      return response.json();
    },
    enabled: isAuthenticated() && getUserRole() === "farmer",
  });

  const { data: upcoming = [], isLoading: isLoadingUpcoming, error: errorUpcoming, refetch: refetchUpcoming } = useQuery({
    queryKey: ["/api/upcoming"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/upcoming");
      return response.json();
    },
    enabled: isAuthenticated() && getUserRole() === "farmer",
  });

  const deleteCropMutation = useMutation({
    mutationFn: async (cropId: string) => {
      const res = await apiRequest("DELETE", `/api/crops/${cropId}`);
      return res.json();
    },
    onSuccess: async () => {
      await refetchCrops();
      queryClient.invalidateQueries({ queryKey: ["/api/farmer/delivery-requests"] });
    },
  });

  const deleteUpcomingMutation = useMutation({
    mutationFn: async (cropId: string) => {
      const res = await apiRequest("DELETE", `/api/upcoming/${cropId}`);
      return res.json();
    },
    onSuccess: async () => {
      await refetchUpcoming();
    },
  });

  const { data: deliveryRequests = [], refetch: refetchDR } = useQuery({
    queryKey: ["/api/farmer/delivery-requests"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/farmer/delivery-requests");
      return res.json();
    },
    enabled: isAuthenticated() && getUserRole() === "farmer",
  });

  const priceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const res = await apiRequest("PATCH", `/api/delivery-requests/${id}/price`, {
        proposedDeliveryPrice: price,
      });
      return res.json();
    },
    onSuccess: async () => {
      await refetchDR();
      setSubmittingId(null);
    },
    onError: async (error: any) => {
      const msg = String(error?.message || "Failed to send price");
      if (submittingId) {
        setPriceErrors((prev) => ({ ...prev, [submittingId]: msg }));
      }
      setSubmittingId(null);
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden relative">
      <div className="farm-bg fixed inset-0 z-0 pointer-events-none">
        <div className="farm-leaf" style={{ top: '-10%', left: '-10%', background: 'var(--primary)' }} />
        <div className="farm-leaf" style={{ bottom: '-10%', right: '-10%', background: 'var(--accent)' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="glass-ultra p-4 fixed top-0 left-0 w-full z-50 h-20 flex items-center border-b border-border">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/farmer/dashboard')} className="rounded-2xl h-10 w-10 text-primary hover:bg-primary/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="space-y-0.5">
                <h1 className="text-xl font-black tracking-tight text-primary" style={{ fontFamily: 'var(--font-display)' }}>{t("activity")}</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("manage_farm_ops")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/messages")}
              className="rounded-2xl h-10 w-10 text-primary hover:bg-primary/10"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-24 pb-32 px-4 max-w-7xl mx-auto w-full space-y-8">
          <FarmingChatBot />

          {/* Delivery Requests Section */}
          <section className="animate-fade-up">
            <div className="glass-card p-6 border border-border shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground">{t("delivery_requests")}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t("new_orders_desc")}</p>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                  {(deliveryRequests?.length || 0)} {t("active")}
                </Badge>
              </div>
              
              {Array.isArray(deliveryRequests) && deliveryRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deliveryRequests.map((dr: any) => (
                    <div key={dr.id} className="bg-background/50 border border-border rounded-3xl p-5 space-y-4 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t("customer")}</p>
                          <h4 className="font-bold text-foreground tracking-tight">
                            {dr.customerName ? dr.customerName : `${String(dr.customerId).slice(0, 8)}...`}
                          </h4>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase rounded-lg">
                          {dr.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                         <p>{t("quantity")}: <span className="text-foreground">{dr.quantity}</span></p>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={0}
                          className={`flex-1 h-12 px-4 rounded-xl border bg-background text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${priceErrors[dr.id] ? "border-destructive/50" : "border-border"}`}
                          placeholder={t("enter_amount")}
                          defaultValue={dr.proposedDeliveryPrice ? Number(dr.proposedDeliveryPrice) : ""}
                          ref={(el) => { priceInputRefs.current[dr.id] = el; }}
                        />
                        <Button
                          onClick={() => {
                            const el = priceInputRefs.current[dr.id];
                            const val = el ? Number(el.value) : Number(dr.proposedDeliveryPrice ?? NaN);
                            if (!isFinite(val) || val < 0) {
                              setPriceErrors((prev) => ({ ...prev, [dr.id]: t("enter_valid_amount") }));
                              return;
                            }
                            setPriceErrors((prev) => ({ ...prev, [dr.id]: "" }));
                            setSubmittingId(dr.id);
                            priceMutation.mutate({ id: dr.id, price: val });
                          }}
                          disabled={submittingId === dr.id}
                          className="btn-organic h-12 px-6 font-black uppercase tracking-widest text-[10px]"
                        >
                          {submittingId === dr.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-white" />
                          ) : (
                            t("send_price")
                          )}
                        </Button>
                      </div>
                      {priceErrors[dr.id] && (
                        <p className="text-[10px] font-bold text-destructive flex items-center gap-2">
                           <AlertCircle className="w-3 h-3" />
                           {priceErrors[dr.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-primary/5 rounded-3xl border border-dashed border-primary/20">
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
                    <Truck className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-2">{t("no_delivery_requests")}</h3>
                  <p className="text-sm font-bold text-muted-foreground max-w-xs mx-auto">{t("delivery_requests_empty_desc")}</p>
                </div>
              )}
            </div>
          </section>

          {/* My Crops Section */}
          <section className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="glass-card p-6 border border-border shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                    <Sprout className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground">{t("my_crops")}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t("manage_produce_desc")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchCrops()}
                  disabled={isLoading}
                  className="rounded-2xl h-10 w-10 text-primary hover:bg-primary/10"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12 space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("loading_crops")}</p>
                </div>
              ) : crops.length === 0 ? (
                <div className="text-center py-12 bg-primary/5 rounded-3xl border border-dashed border-primary/20">
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
                    <Sprout className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-2">{t("no_crops_yet")}</h3>
                  <p className="text-sm font-bold text-muted-foreground max-w-xs mx-auto mb-6">{t("start_add_first_crop")}</p>
                  <Button onClick={() => navigate("/farmer/add-crop")} className="btn-organic px-8 font-black uppercase tracking-widest text-[10px] h-14">
                    <Plus className="h-5 w-5 mr-3" />
                    {t("add_first_crop")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crops.map((crop: any) => (
                    <div key={crop.id} className="bg-background/50 border border-border rounded-3xl p-4 flex items-center gap-4 relative overflow-hidden hover:shadow-md transition-all group">
                      <img
                        src={crop.images?.[0] || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?auto=format&fit=crop&w=100&h=100"}
                        alt={crop.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-border"
                      />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-black text-foreground tracking-tight">{crop.name}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {crop.quantity} {crop.unit} {t("available")}
                        </p>
                        <p className="text-lg font-black text-primary">₹{crop.pricePerUnit}/{crop.unit}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                          <button onClick={() => navigate(`/farmer/edit-crop/${crop.id}`)} className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition-all">
                             <RefreshCw className="w-4 h-4 text-primary" />
                          </button>
                          <button 
                             onClick={async () => {
                               if (window.confirm(t("confirm_delete_crop"))) {
                                  try { await deleteCropMutation.mutateAsync(crop.id); } catch(e) { console.error(e); }
                               }
                             }}
                             className="w-9 h-9 rounded-xl bg-destructive/5 border border-destructive/10 flex items-center justify-center hover:bg-destructive/10 transition-all"
                          >
                             <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Crops Section */}
          <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="glass-card p-6 border border-border shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-foreground">{t("upcoming_crops")}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t("plan_future_harvest_desc")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchUpcoming()}
                  disabled={isLoadingUpcoming}
                  className="rounded-2xl h-10 w-10 text-primary hover:bg-primary/10"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingUpcoming ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {isLoadingUpcoming ? (
                <div className="text-center py-12 space-y-4">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{t("loading_upcoming_crops")}</p>
                </div>
              ) : !upcoming || upcoming.length === 0 ? (
                <div className="text-center py-12 bg-primary/5 rounded-3xl border border-dashed border-primary/20">
                  <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border shadow-sm">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-black text-foreground mb-2">{t("no_upcoming_yet")}</h3>
                  <p className="text-sm font-bold text-muted-foreground max-w-xs mx-auto mb-6">{t("start_add_upcoming")}</p>
                  <Button onClick={() => navigate("/farmer/add-upcoming-crop")} className="btn-organic px-8 font-black uppercase tracking-widest text-[10px] h-14">
                    <Plus className="h-5 w-5 mr-3" />
                    {t("add_upcoming_crop")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map((uc: any) => {
                    const planted = uc.plantedDate ? new Date(uc.plantedDate) : null;
                    const yieldTime = uc.yieldTime || {};
                    const parts = [
                      yieldTime.years ? `${yieldTime.years}y` : null,
                      yieldTime.months ? `${yieldTime.months}m` : null,
                      yieldTime.days ? `${yieldTime.days}d` : null,
                    ].filter(Boolean).join(" ");

                    return (
                      <div key={uc.id} className="bg-background/50 border border-border rounded-3xl p-5 flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                          <Calendar className="w-7 h-7 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-black text-foreground tracking-tight">{uc.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {planted ? `${t("planted_on")}: ${planted.toLocaleDateString()}` : (t("planned"))}
                          </p>
                          {parts && (
                            <p className="text-xs font-black text-primary">{t("yield_in")}: {parts}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                           <button onClick={() => navigate(`/farmer/edit-upcoming/${uc.id}`)} className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition-all">
                              <RefreshCw className="w-4 h-4 text-primary" />
                           </button>
                           <button 
                             onClick={async () => {
                               if (window.confirm(t("confirm_delete_upcoming"))) {
                                  try { await deleteUpcomingMutation.mutateAsync(uc.id); } catch(e) { console.error(e); }
                               }
                             }}
                             className="w-9 h-9 rounded-xl bg-destructive/5 border border-destructive/10 flex items-center justify-center hover:bg-destructive/10 transition-all"
                           >
                              <Trash2 className="w-4 h-4 text-destructive" />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="glass-ultra rounded-[2.5rem] p-4 flex justify-around items-center border border-border shadow-2xl">
              <button onClick={() => navigate("/farmer/dashboard")} className="flex flex-col items-center gap-1 group">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Home className="h-5 w-5" />
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">{t("home")}</span>
              </button>

              <button onClick={() => navigate("/farmer/activity")} className="flex flex-col items-center gap-1 group">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all shadow-sm border border-primary/20">
                    <ListChecks className="h-5 w-5" />
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-widest text-primary">{t("activity")}</span>
              </button>

              <button 
                 onClick={() => navigate("/farmer/actions")}
                 className="w-16 h-16 -mt-10 rounded-3xl bg-primary flex items-center justify-center text-white shadow-lg border-4 border-background transform hover:scale-110 active:scale-95 transition-all"
              >
                 <PlusCircle className="h-8 w-8 text-white" />
              </button>

              <button onClick={() => navigate("/messages")} className="flex flex-col items-center gap-1 group">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <MessageCircle className="h-5 w-5" />
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">{t("messages")}</span>
              </button>

              <button onClick={() => navigate("/profile")} className="flex flex-col items-center gap-1 group">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <User className="h-5 w-5" />
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">{t("profile")}</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
