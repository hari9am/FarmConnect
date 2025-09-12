import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVoice } from "@/hooks/use-voice";
import VoiceAssistant from "@/components/voice-assistant";

const languages = [
  { code: "english", name: "English", flag: "🇺🇸" },
  { code: "hindi", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "punjabi", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🌾" },
];

export default function LanguageSelection() {
  const [, navigate] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const { speak, isSupported } = useVoice();

  // Check if language was already selected
  useState(() => {
    const savedLanguage = localStorage.getItem("farmconnect-language");
    if (savedLanguage) {
      navigate("/role");
    }
  });

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    
    // Save language preference
    localStorage.setItem("farmconnect-language", languageCode);
    
    // Speak confirmation
    if (isSupported) {
      const confirmations = {
        english: "English selected. Welcome to FarmConnect!",
        hindi: "हिंदी चुनी गई। फार्मकनेक्ट में आपका स्वागत है!",
        punjabi: "ਪੰਜਾਬੀ ਚੁਣੀ ਗਈ। ਫਾਰਮਕਨੈਕਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ!"
      };
      speak(confirmations[languageCode as keyof typeof confirmations] || confirmations.english);
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
    <div className="mobile-container">
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gradient-to-b from-primary/10 to-background">
        <div className="text-center mb-12">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Agricultural landscape with diverse crops" 
            className="w-32 h-32 mx-auto rounded-full mb-6 shadow-lg object-cover border-4 border-primary/20"
          />
          <h1 className="text-3xl font-bold text-primary mb-2" data-testid="app-title">FarmConnect</h1>
          <p className="text-muted-foreground text-lg" data-testid="app-subtitle">Connecting Farmers & Customers</p>
        </div>

        <div className="w-full max-w-sm space-y-4">
          <h2 className="text-xl font-semibold text-center mb-6" data-testid="language-prompt">Choose Your Language</h2>
          
          {languages.map((language) => (
            <Button
              key={language.code}
              onClick={() => handleLanguageSelect(language.code)}
              onMouseEnter={() => handleVoiceSelect(language.code)}
              variant="outline"
              className="w-full h-auto p-4 flex items-center justify-between hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid={`language-${language.code}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              <VoiceAssistant 
                isActive={selectedLanguage === language.code}
                className="text-muted-foreground voice-indicator"
              />
            </Button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
            <i className="fas fa-microphone"></i>
            <span data-testid="voice-assistance-text">Voice assistance enabled</span>
          </p>
        </div>
      </div>
    </div>
  );
}
