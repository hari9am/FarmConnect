import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, PlusCircle, Home, ListChecks, User, Sprout, Globe, Zap, Settings, Leaf, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { useLanguage } from "@/hooks/use-language";
import LiveMarketPrices from "@/components/live-market-prices";
import { apiRequest } from "@/lib/queryClient";
import FarmingChatBot from "@/components/farming-chat-bot";

export default function FarmerDashboard() {
  const [location, navigate] = useLocation();
  const { t } = useLanguage();
  const [showUpcomingBanner, setShowUpcomingBanner] = useState(false);
  const headerRef = useRef(null);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/farmer/auth");
      return;
    }
    const role = getUserRole();
    if (role !== "farmer") {
      navigate("/role");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    try {
      const flag = localStorage.getItem("fc-recent-upcoming");
      if (flag === "1") {
        setShowUpcomingBanner(true);
        localStorage.removeItem("fc-recent-upcoming");
      }
    } catch {}
  }, []);

  const { data: crops = [], isLoading } = useQuery({
    queryKey: ["/api/farmer/crops"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/farmer/crops");
      return await response.json();
    },
    enabled: isAuthenticated() && getUserRole() === "farmer",
    staleTime: 60_000,
  });

  const user = JSON.parse(localStorage.getItem("farmconnect-user") || "{}");

  const stats = useMemo(() => ({
    activeCrops: crops.length,
    monthlyEarnings: (crops as any[]).reduce((sum: number, c: any) => sum + (parseFloat(c.pricePerUnit) || 0) * (parseFloat(c.quantity) || 0), 0),
  }), [crops]);



  return (
    <div className="min-h-screen text-foreground font-sans overflow-x-hidden relative pb-32">
      {/* Immersive Organic Background */}
      <div className="farm-bg">
        <div className="farm-leaf top-[-10%] left-[-10%]" />
        <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent opacity-5" />
        
        {/* Natural Decorations */}
        <div className="creeper-vine plant-decoration top-20 left-10" />
        <div className="creeper-vine plant-decoration bottom-20 right-10" style={{ transform: 'scale(0.8) rotate(180deg)' }} />
        <div className="leaf-pattern plant-decoration top-40 right-20" />
        <div className="leaf-pattern plant-decoration bottom-40 left-20" style={{ animationDelay: '3s' }} />
        <div className="leaf-pattern plant-decoration top-60 left-1/2" style={{ animationDelay: '6s' }} />
      </div>

      <div className="flex flex-col min-h-screen relative z-10">
        <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 p-4">
          <div className="glass-ultra rounded-[2rem] p-3 flex items-center justify-between shadow-2xl border border-white/20">
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                <Sprout className="w-5 h-5 text-primary" />
              </div>
              <div className="max-w-[150px] md:max-w-none">
                <h1 className="text-base md:text-lg font-black tracking-tight flex items-center gap-1" style={{ fontFamily: 'var(--font-display)' }}>
                  {t("good_morning") || "Hello"}, {user.username || 'Farmer'} <Leaf className="w-4 h-4 text-primary" />
                </h1>
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{t("farm_management") || "Farm Control Center"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                className="w-10 h-10 rounded-full bg-background/50 border border-border hover:bg-primary/5 relative shadow-sm"
              >
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shadow-lg">3</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="h-28" />

        {showUpcomingBanner && (
          <div className="px-4 animate-fade-up">
            <div className="glass-ultra border-primary/30 bg-primary/5 p-5 rounded-[2rem] flex items-start justify-between border shadow-lg">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                  <div className="font-black text-primary uppercase tracking-tight text-sm">{t("upcoming_yield_secured") || "Yield Broadcast Live"}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">{t("broadcasted_hyper_local") || "Your upcoming harvest is now visible to local customers."}</div>
                </div>
              </div>
              <button className="text-xs font-black text-primary px-3 py-1 bg-primary/10 rounded-full" onClick={() => setShowUpcomingBanner(false)}>{t("dismiss") || "Clear"}</button>
            </div>
          </div>
        )}

        <main className="flex-1 px-4 space-y-8 pt-4 max-w-5xl mx-auto w-full">
          <section className="animate-fade-up">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-black text-xl font-display text-primary tracking-tight">{t("harvest_health") || "Harvest Health"}</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div 
                className="glass-card p-1 cursor-pointer group shadow-xl"
                onClick={() => navigate('/farmer/activity')}
              >
                <div className="bg-white/60 h-full rounded-[1.8rem] p-6 relative overflow-hidden flex flex-col justify-between border border-white/20">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex justify-center items-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_var(--primary)] animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-primary leading-none">{stats.activeCrops}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-2">{t("active_yields") || "Active Yields"}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-1 group shadow-xl">
                <div className="bg-white/60 h-full rounded-[1.8rem] p-6 relative overflow-hidden flex flex-col justify-between border border-white/20">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-accent text-white flex justify-center items-center shadow-lg rotate-[-12deg] group-hover:rotate-0 transition-all duration-500">
                      <span className="font-black text-xl">₹</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-foreground">₹{stats.monthlyEarnings > 0 ? stats.monthlyEarnings.toLocaleString('en-IN') : '—'}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-2">{t("est_value") || "Revenue Est."}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="animate-fade-up glass-card p-1 shadow-2xl" style={{ animationDelay: '100ms' }}>
            <div className="bg-white/70 rounded-[2rem] p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-tighter">{t("village_market_index") || "Village Market Index"}</h3>
              </div>
              <div className="rounded-[1.5rem] overflow-hidden border border-border bg-white/40 shadow-inner">
                <LiveMarketPrices state="Karnataka" district="Bengaluru" />
              </div>
            </div>
          </section>
        </main>

        {/* Action Centric Navigation */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md z-50">
          <nav className="glass-ultra rounded-[2.5rem] px-8 py-4 flex justify-between items-center border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
             <button className="flex flex-col items-center gap-1 group">
               <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl transform active:scale-95 transition">
                 <Home className="h-6 w-6" />
               </div>
             </button>
             <button className="text-muted-foreground hover:text-primary transition-all p-2 rounded-xl group" onClick={() => navigate("/farmer/activity")}>
               <ListChecks className="h-7 w-7 group-hover:-translate-y-1 transition" />
             </button>
             
             <div className="relative -top-8">
                <div className="p-[6px] bg-white rounded-3xl shadow-2xl border border-border">
                  <button 
                    className="w-16 h-16 rounded-[1.3rem] bg-accent text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 relative overflow-hidden"
                    onClick={() => navigate("/farmer/actions")}
                  >
                    <PlusCircle className="w-9 h-9" />
                  </button>
                </div>
             </div>

             <button className="text-muted-foreground hover:text-primary transition-all p-2 rounded-xl group relative" onClick={() => navigate("/messages")}>
               <MessageCircle className="h-7 w-7 group-hover:-translate-y-1 transition" />
               <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-white">3</span>
             </button>
             <button className="text-muted-foreground hover:text-primary transition-all p-2 rounded-xl group" onClick={() => navigate("/profile")}>
               <User className="h-7 w-7 group-hover:-translate-y-1 transition" />
             </button>
          </nav>
        </div>
      </div>
      
      <div className="fixed z-50 right-6 bottom-32 group">
         <FarmingChatBot />
      </div>
    </div>
  );
}

