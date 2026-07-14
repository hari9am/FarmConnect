import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, Gift } from "lucide-react";
import { getPoints, redeemAllPossible, getWalletBalance, POINTS_PER_CASH_UNIT, CASH_PER_POINTS } from "@/lib/rewards";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export default function RewardsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [points, setPoints] = useState(0);
  const [wallet, setWallet] = useState(0);

  const refresh = () => {
    setPoints(getPoints());
    setWallet(getWalletBalance());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRedeem = () => {
    const { redeemedPoints, cashAdded } = redeemAllPossible();
    if (redeemedPoints > 0) {
      toast({ 
        title: t("rewards"), 
        description: t("converted_points_to", { points: redeemedPoints, cash: cashAdded }) 
      });
      refresh();
    } else {
      toast({ 
        title: t("your_points"), 
        description: t("need_more_points", { points: POINTS_PER_CASH_UNIT }), 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
      {/* Space Backdrop */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-20 grain-noise"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="glass-ultra p-4 fixed top-0 left-0 w-full z-50 h-20 flex items-center border-b border-white/10">
          <div className="flex items-center space-x-4 max-w-2xl mx-auto w-full">
            <h1 className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70" style={{ fontFamily: 'var(--font-display)' }}>
              {t("rewards")}
            </h1>
          </div>
        </header>

        <div className="flex-1 pt-24 pb-12 px-4 max-w-2xl mx-auto w-full space-y-6">
          {/* Points Card */}
          <div className="glass-card p-1 animate-fade-up">
            <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[1.3rem] p-6 border border-white/5 flex items-center justify-between relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent"></div>
               <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{t("your_points")}</p>
                <p className="text-4xl font-black text-white tracking-tighter">{points}</p>
              </div>
              <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/30">
                <Gift className="h-7 w-7 text-violet-400" />
              </div>
            </div>
          </div>

          {/* Wallet Balance Card */}
          <div className="glass-card p-1 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[1.3rem] p-6 border border-white/5 flex items-center justify-between relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-transparent"></div>
               <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{t("wallet_balance")}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-400">₹</span>
                  <p className="text-4xl font-black text-white tracking-tighter">{wallet.toFixed(2)}</p>
                </div>
              </div>
              <div className="w-14 h-14 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center border border-fuchsia-500/30">
                <IndianRupee className="h-7 w-7 text-fuchsia-400" />
              </div>
            </div>
          </div>

          {/* Redemption Terminal */}
          <div className="glass-card p-1 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[1.3rem] p-8 border border-white/5 text-center">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">{t("conversion_rate")}</h3>
              <div className="inline-flex items-center gap-4 py-3 px-6 bg-white/5 rounded-2xl border border-white/10 mb-8">
                <span className="text-2xl font-black text-white">{POINTS_PER_CASH_UNIT}</span>
                <span className="text-slate-500 text-xs font-bold">POINTS</span>
                <div className="w-4 h-[2px] bg-slate-700"></div>
                <span className="text-2xl font-black text-fuchsia-400">₹{CASH_PER_POINTS}</span>
                <span className="text-slate-500 text-xs font-bold">CASH</span>
              </div>
              <Button 
                className="w-full btn-3d h-16 text-lg font-black tracking-tight" 
                onClick={handleRedeem}
              >
                {t("redeem_now")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
