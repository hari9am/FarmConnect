import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, ShoppingBag, Plus, Minus, Leaf, ShieldCheck, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

type CartItem = {
  cropId: string;
  name: string;
  pricePerUnit: number;
  unit: string;
  quantity: number;
  image?: string | null;
  farmerId: string;
};

const CART_KEY = "farmconnect-cart";

export default function CartPage() {
  const [, navigate] = useLocation();
  const [items, setItems] = useState<CartItem[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);

  const updateLocalStorage = (updated: CartItem[]) => {
    setItems(updated);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("cart:updated"));
  };

  const handleQtyChange = (cropId: string, qty: number) => {
    const updated = items.map((it) => (it.cropId === cropId ? { ...it, quantity: Math.max(1, qty) } : it));
    updateLocalStorage(updated);
  };

  const handleRemove = (cropId: string) => {
    const updated = items.filter((it) => it.cropId !== cropId);
    updateLocalStorage(updated);
  };

  const total = useMemo(() => items.reduce((sum, it) => sum + it.pricePerUnit * it.quantity, 0), [items]);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans text-foreground pb-40">
      {/* Background System */}
      <div className="farm-bg fixed inset-0 z-0">
        <div className="farm-leaf top-[-10%] left-[-10%] opacity-10" />
        <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="glass-ultra px-4 py-6 md:px-8 border-b border-white/20 sticky top-0 z-50 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/customer/dashboard")}
                className="w-10 h-10 rounded-2xl bg-white/50 border border-primary/10 flex items-center justify-center text-primary hover:bg-white/80 transition shadow-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-xl font-black text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                  {t("cart") || 'Your Harvest Cart'}
                </h1>
              </div>
            </div>
            {items.length > 0 && (
              <div className={`inline-flex items-center rounded-3xl text-xs px-3 py-1 bg-primary/10 text-primary border-primary/10 font-black`}>
                {items.length} {items.length === 1 ? 'Item' : 'Items'}
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 px-4 py-8 max-w-4xl mx-auto w-full space-y-6">
          {items.length === 0 ? (
            <div className="glass-card p-1 animate-fade-up">
              <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-16 text-center border border-white/20 shadow-xl">
                <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-primary/10">
                  <ShoppingBag className="h-10 w-10 text-primary opacity-20" />
                </div>
                <h2 className="text-3xl font-black text-primary mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                   {t("cart_empty") || 'Cart is Empty'}
                </h2>
                <p className="text-muted-foreground font-medium mb-10 max-w-xs mx-auto">
                   Explore our fresh local marketplace to fill your cart.
                </p>
                <Button 
                  onClick={() => navigate("/customer/dashboard")}
                  className="btn-organic px-12 py-8 text-lg rounded-2xl"
                >
                  <Zap className="w-5 h-5 mr-3 fill-current" />
                  {t("back_to_market") || 'Explore Marketplace'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-2 px-2 mb-2">
                 <Leaf className="w-4 h-4 text-primary" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Local Sustainably Sourced Yields</p>
              </div>

              {items.map((it, idx) => (
                <div key={it.cropId} className="glass-card p-1" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] p-4 md:p-6 border border-white/20 flex gap-4 md:gap-8 items-center shadow-lg relative overflow-hidden group">
                    <img
                      src={it.image || "https://images.unsplash.com/photo-1546470427-e2a45bcd0c8c?auto=format&fit=crop&w=200&h=200"}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] object-cover border border-primary/5 shadow-inner"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-foreground text-xl md:text-2xl tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{it.name}</h4>
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">₹{it.pricePerUnit} / {it.unit}</p>
                        </div>
                        <button 
                          onClick={() => handleRemove(it.cropId)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors flex items-center justify-center border border-red-100"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                        <div className="flex items-center bg-primary/5 rounded-2xl p-1 gap-2 border border-primary/5">
                          <button onClick={() => handleQtyChange(it.cropId, it.quantity - 1)} className="w-10 h-10 rounded-[0.9rem] bg-white border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition shadow-sm">
                             <Minus className="h-4 w-4 text-primary font-black" />
                          </button>
                          <span className="w-8 text-center font-black text-lg text-primary">{it.quantity}</span>
                          <button onClick={() => handleQtyChange(it.cropId, it.quantity + 1)} className="w-10 h-10 rounded-[0.9rem] bg-white border border-primary/10 flex items-center justify-center hover:bg-primary/10 transition shadow-sm">
                             <Plus className="h-4 w-4 text-primary font-black" />
                          </button>
                        </div>

                        <div className="text-right">
                           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Item Total</p>
                           <p className="text-2xl font-black text-primary tracking-tighter leading-none">₹{(it.pricePerUnit * it.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full px-4 pb-8 z-50 pointer-events-none">
            <div className="max-w-xl mx-auto pointer-events-auto">
              <div className="glass-ultra rounded-[2.5rem] p-6 border border-white/30 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-white/95 dark:bg-card/95">
                <div className="space-y-6">
                   <div className="flex items-center justify-between px-2">
                     <div className="space-y-1">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t("total") || 'Grand Total'}</p>
                        <div className="flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4 text-primary/40" />
                           <p className="text-[10px] font-bold text-muted-foreground">{t("secure_payout") || 'Verified Secure Connection'}</p>
                        </div>
                     </div>
                     <span className="text-4xl font-black text-primary tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>₹{total.toFixed(2)}</span>
                   </div>
                   
                   <Button 
                    className="w-full btn-organic py-8 text-lg font-black tracking-tight shadow-xl group/pay" 
                    onClick={() => navigate(`/payment/${items[0]?.cropId}?quantity=${items[0]?.quantity || 1}`)}
                   >
                    {t("checkout") || 'Secure Shipment'}
                    <Zap className="ml-3 w-5 h-5 fill-current group-hover:scale-125 transition-transform" />
                   </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



