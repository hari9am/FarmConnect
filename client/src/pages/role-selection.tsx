import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { Sprout, ShoppingCart, Globe, ArrowRight, Zap, Leaf } from "lucide-react";

export default function RoleSelection() {
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === "farmer") navigate("/farmer/dashboard");
      else if (role === "customer") navigate("/customer/dashboard");
    }
  }, [navigate]);

  const languages = [
    { code: "english", name: "English" }, { code: "hindi", name: "हिंदी" },
    { code: "punjabi", name: "ਪੰਜਾਬੀ" }, { code: "tamil", name: "தமிழ்" },
    { code: "telugu", name: "తెలుగు" }, { code: "kannada", name: "ಕನ್ನಡ" },
    { code: "malayalam", name: "മലയാളം" }, { code: "marathi", name: "मराठी" },
    { code: "gujarati", name: "ગુજરાતી" }, { code: "bengali", name: "বাংলা" },
    { code: "odia", name: "ଓଡ଼ିଆ" }, { code: "urdu", name: "اردو" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans text-foreground">
      {/* Organic Farm Background */}
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

      {/* Header */}
      <header className="relative z-10 px-4 py-6 md:px-8 glass-ultra border-b border-border sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 backdrop-blur rounded-2xl flex items-center justify-center border border-primary/20">
              <Sprout className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-primary leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                FarmConnect<span className="text-accent">.</span>
              </h1>
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">{t('connecting_farmers_customers') || 'Soil to Soul'}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center justify-center p-1 rounded-full glass-ultra border border-border">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-10 h-10 rounded-full border-none p-0 flex justify-center [&>span]:hidden [&>svg]:hidden focus:ring-0">
                  <Globe className="h-5 w-5 text-primary" />
                </SelectTrigger>
                <SelectContent className="glass-ultra border-border text-foreground bg-card/95 rounded-2xl">
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="focus:bg-primary/10 rounded-lg">
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-4 flex flex-col justify-center py-12 md:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto w-full">
          
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              <Leaf className="w-4 h-4 mr-2" /> {t('welcome_future_farming') || 'Join the Green Revolution'}
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-primary mb-6 tracking-tighter leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {t('choose_your') || 'Choose your'} <br/> <span className="text-foreground">{t('ecosystem_role') || 'Pathway'}</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed px-4">
              {t('role_desc') || 'Select how you want to interact with our local sustainable farm network.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            
            {/* Farmer Card */}
            <div className="group animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="glass-card h-full border border-border overflow-hidden">
                <div className="p-8 lg:p-12 h-full flex flex-col relative z-10">
                  <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                    <Sprout className="w-10 h-10 text-primary" />
                  </div>
                  
                  <h3 className="text-4xl font-black text-primary mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t('farmer_role') || 'I am a Farmer'}</h3>
                  <p className="text-muted-foreground mb-8 text-lg font-medium leading-relaxed">{t('farmer_desc') || 'List your harvests, manage deliveries, and grow your business directly with local customers.'}</p>
                  
                  <div className="space-y-4 mb-12 flex-1">
                    {[
                      t('farmer_feat_1') || 'Direct Sales Control',
                      t('farmer_feat_2') || 'Inventory Management',
                      t('farmer_feat_3') || 'Secure Payments'
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center text-foreground font-bold group/feat">
                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center mr-3 border border-primary/20 group-hover/feat:bg-primary/30 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => navigate("/farmer/auth")}
                    className="w-full btn-organic py-8 text-lg rounded-2xl flex items-center justify-center group/btn shadow-xl shadow-primary/20"
                  >
                    {t('deploy_farm_node') || 'Start My Farm'}
                    <ArrowRight className="w-6 h-6 ml-3 group-hover/btn:translate-x-2 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Customer Card */}
            <div className="group animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="glass-card h-full border border-border overflow-hidden">
                <div className="p-8 lg:p-12 h-full flex flex-col relative z-10">
                  <div className="w-20 h-20 bg-accent/10 rounded-[1.5rem] flex items-center justify-center mb-8 border border-accent/20 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-lg">
                    <ShoppingCart className="w-10 h-10 text-accent" />
                  </div>
                  
                  <h3 className="text-4xl font-black text-accent mb-4 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t('customer_role') || 'I am a Customer'}</h3>
                  <p className="text-muted-foreground mb-8 text-lg font-medium leading-relaxed">{t('customer_desc') || 'Browse the freshest local produce, buy directly from farmers, and support sustainable soil.'}</p>
                  
                  <div className="space-y-4 mb-12 flex-1">
                    {[
                      t('customer_feat_1') || 'Farm-Fresh Produce',
                      t('customer_feat_2') || 'Traceable Sources',
                      t('customer_feat_3') || 'Hyper-Local Delivery'
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center text-foreground font-bold group/feat">
                        <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center mr-3 border border-accent/20 group-hover/feat:bg-accent/30 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-accent"></div>
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => navigate("/customer/auth")}
                    className="w-full btn-organic py-8 text-lg rounded-2xl flex items-center justify-center group/btn shadow-xl shadow-accent/20"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #e67e22)' }}
                  >
                    {t('access_marketplace') || 'Shop Locally'}
                    <ArrowRight className="w-6 h-6 ml-3 group-hover/btn:translate-x-2 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      
      <div className="text-center py-10 animate-fade-up">
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-3">
          <span className="w-10 h-px bg-border"></span>
          Pure Nature First
          <span className="w-10 h-px bg-border"></span>
        </p>
      </div>
    </div>
  );
}

