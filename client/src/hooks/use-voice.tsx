import { useState, useCallback } from "react";

export function useVoice() {
  const [isSupported, setIsSupported] = useState(() => {
    return 'speechSynthesis' in window;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, options?: { lang?: string; rate?: number; pitch?: number }) => {
    if (!isSupported) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice options
    utterance.lang = options?.lang || 'en-US';
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Speak the text
    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const getVoices = useCallback(() => {
    if (!isSupported) return [];
    return window.speechSynthesis.getVoices();
  }, [isSupported]);

  return {
    speak,
    stop,
    getVoices,
    isSupported,
    isSpeaking,
  };
}
