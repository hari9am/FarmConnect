interface Translations {
  [key: string]: {
    [language: string]: string;
  };
}

const translations: Translations = {
  "welcome": {
    "english": "Welcome to FarmConnect",
    "hindi": "फार्मकनेक्ट में आपका स्वागत है",
    "punjabi": "ਫਾਰਮਕਨੈਕਟ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ"
  },
  "connecting_farmers_customers": {
    "english": "Connecting Farmers & Customers",
    "hindi": "किसानों और ग्राहकों को जोड़ना",
    "punjabi": "ਕਿਸਾਨਾਂ ਅਤੇ ਗਾਹਕਾਂ ਨੂੰ ਜੋੜਨਾ"
  },
  "choose_language": {
    "english": "Choose Your Language",
    "hindi": "अपनी भाषा चुनें",
    "punjabi": "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ"
  },
  "voice_assistance_enabled": {
    "english": "Voice assistance enabled",
    "hindi": "आवाज सहायता सक्षम",
    "punjabi": "ਆਵਾਜ਼ ਸਹਾਇਤਾ ਸਮਰੱਥ"
  },
  "choose_role": {
    "english": "Choose your role to continue",
    "hindi": "जारी रखने के लिए अपनी भूमिका चुनें",
    "punjabi": "ਜਾਰੀ ਰੱਖਣ ਲਈ ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ"
  },
  "farmer": {
    "english": "I'm a Farmer",
    "hindi": "मैं एक किसान हूँ",
    "punjabi": "ਮੈਂ ਇੱਕ ਕਿਸਾਨ ਹਾਂ"
  },
  "customer": {
    "english": "I'm a Customer",
    "hindi": "मैं एक ग्राहक हूँ",
    "punjabi": "ਮੈਂ ਇੱਕ ਗਾਹਕ ਹਾਂ"
  },
  "sell_crops_directly": {
    "english": "Sell your crops directly to customers",
    "hindi": "अपनी फसल सीधे ग्राहकों को बेचें",
    "punjabi": "ਆਪਣੀ ਫਸਲ ਸਿੱਧੇ ਗਾਹਕਾਂ ਨੂੰ ਵੇਚੋ"
  },
  "buy_fresh_produce": {
    "english": "Buy fresh produce from local farmers",
    "hindi": "स्थानीय किसानों से ताजा उत्पाद खरीदें",
    "punjabi": "ਸਥਾਨਕ ਕਿਸਾਨਾਂ ਤੋਂ ਤਾਜ਼ਾ ਉਤਪਾਦ ਖਰੀਦੋ"
  }
};

export function getCurrentLanguage(): string {
  return localStorage.getItem("farmconnect-language") || "english";
}

export function setLanguage(language: string): void {
  localStorage.setItem("farmconnect-language", language);
}

export function translate(key: string, language?: string): string {
  const currentLanguage = language || getCurrentLanguage();
  return translations[key]?.[currentLanguage] || translations[key]?.["english"] || key;
}

export function t(key: string): string {
  return translate(key);
}

// Language-specific voice options
export const voiceOptions: { [key: string]: { lang: string; rate: number } } = {
  "english": { lang: "en-US", rate: 1.0 },
  "hindi": { lang: "hi-IN", rate: 0.9 },
  "punjabi": { lang: "pa-IN", rate: 0.9 }
};

export function getVoiceOptions(language?: string) {
  const currentLanguage = language || getCurrentLanguage();
  return voiceOptions[currentLanguage] || voiceOptions["english"];
}
