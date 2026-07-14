import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 p-1 glass-card max-w-md w-full mx-4 animate-fade-up">
        <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[1.3rem] p-8 text-center border border-white/5">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
            404
          </h1>
          <p className="text-slate-400 font-medium mb-8">
            {t("page_not_found")}
          </p>
          <Link href="/">
            <Button className="w-full btn-organic h-14 font-black">
              {t("back_to_market")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
