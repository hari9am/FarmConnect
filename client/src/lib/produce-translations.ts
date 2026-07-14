export const produceTranslations: Record<string, Record<string, string>> = {
  // store keys in lowercase for case-insensitive lookup
  "tomato": { kannada: "ಟೊಮೇಟೋ", hindi: "टमाटर", punjabi: "ਟਮਾਟਰ" },
  "onion": { kannada: "ಈರುಳ್ಳಿ", hindi: "प्याज़", punjabi: "ਪਿਆਜ਼" },
  "onion big": { kannada: "ದೊಡ್ಡ ಈರುಳ್ಳಿ", hindi: "बड़ा प्याज़", punjabi: "ਵੱਡਾ ਪਿਆਜ਼" },
  "onions": { kannada: "ಈರುಳ್ಳಿಗಳು", hindi: "प्याज़", punjabi: "ਪਿਆਜ਼" },
  "snake gourd": { kannada: "ಪಡವಲಕಾಯಿ", hindi: "चिचिण्डा", punjabi: "ਚਿਚਿੰਦਾ" },
  "potato": { kannada: "ಆಲೂಗಡ್ಡೆ", hindi: "आलू", punjabi: "ਆਲੂ" },
  "carrot": { kannada: "ಗಜ್ಜರಿ", hindi: "गाजर", punjabi: "ਗਾਜਰ" },
  "spinach": { kannada: "ಪಾಲಕ್ ಸೊಪ್ಪು", hindi: "पालक", punjabi: "ਪਾਲਕ" },
  "wheat": { kannada: "ಗೋಧಿ", hindi: "गेहूं", punjabi: "ਗੇਂਹੂਂ" },
  "rice": { kannada: "ಅಕ್ಕಿ", hindi: "चावल", punjabi: "ਚਾਵਲ" },
};

export function getLocalizedProduceName(name: string | undefined, language: string): string | null {
  if (!name || !language || language === "english") return null;
  const key = name.trim().toLowerCase();
  const entry = produceTranslations[key];
  const localized = entry?.[language];
  return localized || null;
}
