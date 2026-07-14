import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useVoice } from "@/hooks/use-voice";
import VoiceAssistant from "@/components/voice-assistant";
import { useLanguage } from "@/hooks/use-language";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { Globe, ArrowRight, Sprout, Mic, Languages, Leaf } from "lucide-react";

// Expanded language list (keep codes in sync with i18n keys)
const languages = [
  { code: "english", name: "English", native: "English" },
  { code: "hindi", name: "हिंदी (Hindi)", native: "हिंदी" },
  { code: "punjabi", name: "ਪੰਜਾਬੀ (Punjabi)", native: "ਪੰਜਾਬੀ" },
  { code: "tamil", name: "தமிழ் (Tamil)", native: "தமிழ்" },
  { code: "telugu", name: "తెలుగు (Telugu)", native: "తెలుగు" },
  { code: "kannada", name: "ಕನ್ನಡ (Kannada)", native: "ಕನ್ನಡ" },
  { code: "malayalam", name: "മലയാളം (Malayalam)", native: "മലയാളം" },
  { code: "marathi", name: "मराठी (Marathi)", native: "मराठी" },
  { code: "gujarati", name: "ગુજરાતી (Gujarati)", native: "ગુજરાતી" },
  { code: "bengali", name: "বাংলা (Bengali)", native: "বাংলা" },
  { code: "odia", name: "ଓଡିଆ (Odia)", native: "ଓଡିଆ" },
  { code: "urdu", name: "اردو (Urdu)", native: "اردو" },
];

export default function LanguageSelection() {
  const [, navigate] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const { speak, isSupported } = useVoice();
  const { setLanguage, t } = useLanguage();

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setLanguage(languageCode);
    
    // Speak confirmation
    if (isSupported) {
      const confirmations: Record<string, string> = {
          "english": "English selected. Welcome to FarmConnect!",
          "hindi": "हिंदी चुनी गई। फार्मकनेक्ट में आपका स्वागत है!",
          "punjabi": "ਪੰਜਾਬੀ ਚੁਣੀ ਗਈ। ਫਾਰਮਕਨੈਕਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ!",
          "tamil": "தமிழ் தேர்ந்தெடுக்கப்பட்டது. ஃபார்ம்கனெக்டுக்கு வரவேற்கிறோம்!",
          "telugu": "తెలుగు ఎంపికైంది. ఫార్మ్‌కనెక్ట్‌కి స్వాగతం!",
          "kannada": "ಕನ್ನಡ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಫಾರ್ಮ್‌ಕನೆಕ್ಟ್‌ಗೆ ಸ್ವಾಗತ!",
          "malayalam": "മലയാളം തിരഞ്ഞെടുക്കപ്പെട്ടു. ഫാർമ്കണക്റ്റിലേക്ക് സ്വാഗതം!",
          "marathi": "मराठी निवडली आहे. फार्मकनेक्टमध्ये आपले स्वागत आहे!",
          "gujarati": "ગુજરાતી પસંદ કરી. ફાર્ਮકનેક્ટમાં આપનું સ્વાગત છે!",
          "bengali": "বাংলা নির্বাচিত হয়েছে। ফার্মকনেক্টে আপনাকে স্বাগতম!",
          "odia": "ଓଡିଆ ଚୟନିତ ହୋଇଛି। ଫାର୍ମକନେକ୍ଟକୁ ସ୍ୱାଗତ!",
      };
      speak(confirmations[languageCode] || confirmations.english);
    }

    // Navigate to role selection after a brief delay
    setTimeout(() => {
      navigate("/role");
    }, 1500);
  };

  const handleVoiceSelect = (languageCode: string) => {
    const language = languages.find(lang => lang.code === languageCode);
    if (language && isSupported) {
      speak(`${language.name} selected. Tap to confirm.`);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col font-sans text-foreground">
      {/* Nature Background */}
      <div className="farm-bg">
        <div className="farm-leaf top-[-10%] left-[-10%]" />
        <div className="farm-leaf bottom-[-10%] right-[-10%] bg-accent opacity-5" />
        <div className="farm-leaf top-[40%] left-[40%] bg-secondary opacity-10" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl py-8">
          
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-up">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="w-24 h-24 md:w-28 md:h-28 glass-ultra rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10">
                <Sprout className="w-12 h-12 md:w-14 md:h-14 text-primary" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-primary mb-4 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
              FarmConnect<span className="text-accent">.</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto px-4">
              {t("connecting_farmers_customers") || "Cultivating Direct Connections from Soil to Soul"}
            </p>
          </div>

          {/* Language Selection Glass Bento */}
          <div className="glass-card animate-fade-up shadow-2xl overflow-hidden mx-auto max-w-4xl" style={{ animationDelay: '100ms' }}>
            <div className="p-6 md:p-12 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
              
              <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-primary">
                    <Languages className="w-6 h-6" />
                    <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      {t("choose_language") || "Select Your Language"}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-lg">Choose a language to start your green journey.</p>
                </div>
                
                {selectedLanguage && (
                  <div className="glass-ultra px-6 py-3 rounded-full border border-primary/30 flex items-center gap-3 bg-primary/5 text-primary shadow-lg animate-fade-up">
                    <span className="font-bold">{languages.find(l => l.code === selectedLanguage)?.native} initialized</span>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Bento Language Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                {languages.map((language) => (
                  <div
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    onMouseEnter={() => handleVoiceSelect(language.code)}
                    className={`group relative p-1 rounded-3xl cursor-pointer transition-all duration-500 transform hover:scale-105 active:scale-95 ${
                      selectedLanguage === language.code ? 'z-10' : 'z-0'
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
                        selectedLanguage === language.code 
                        ? 'bg-primary shadow-xl ring-4 ring-primary/20' 
                        : 'bg-white/50 dark:bg-black/20 border border-border group-hover:bg-primary/5 group-hover:border-primary/30'
                      }`}>
                    </div>
                    
                    <div className={`relative h-full flex flex-col items-center justify-center p-6 space-y-4 rounded-[22px] ${
                      selectedLanguage === language.code ? 'text-white' : 'text-foreground'
                    }`}>
                      {/* Language Initial Avatar */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black tracking-tighter transition-all duration-500 ${
                        selectedLanguage === language.code 
                        ? "bg-white/20" 
                        : "bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:text-white shadow-md text-primary"
                      }`}>
                        {language.native.slice(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="text-center space-y-1">
                        <div className="font-bold text-lg leading-none">{language.native}</div>
                        <div className="text-xs font-medium opacity-60 uppercase tracking-widest">{language.name}</div>
                      </div>
                      
                      {isSupported && (
                        <div className="absolute top-2 right-2">
                          <VoiceAssistant
                            isActive={selectedLanguage === language.code}
                            className={`transition-all duration-300 ${
                              selectedLanguage === language.code 
                                ? "text-white" 
                                : "text-muted-foreground group-hover:text-primary"
                            }`}
                          />
                        </div>
                      )}
                      
                      {selectedLanguage === language.code && (
                        <div className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl animate-fade-up">
                          <ArrowRight className="w-5 h-5 text-primary font-bold" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Voice Tip */}
              <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Mic className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold">
                    {t("voice_assistance_enabled") || "Voice assistance is active. Pick a language to hear it."}
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="text-center mt-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-slate-600"></span>
              Join the bio-network
              <span className="w-8 h-px bg-slate-600"></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
