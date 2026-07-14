interface Translations {
  [key: string]: {
    [language: string]: string;
  };
}

const translations: Translations = {
  // --- CORE & REDESIGN KEYS ---
  "welcome_back": { "english": "Welcome Back", "hindi": "वापसी पर स्वागत है", "punjabi": "ਵਾਪਸੀ 'ਤੇ ਸੁਆਗਤ ਹੈ", "tamil": "மீண்டும் வருக", "telugu": "మళ్ళీ స్వాగతం", "kannada": "ಮತ್ತೆ ಸ್ವಾಗತ", "malayalam": "വീണ്ടും സ്വാഗതം", "marathi": "पुन्हा आपले स्वागत आहे", "gujarati": "ફરી સ્વાગત છે", "bengali": "স্বাগতম", "odia": "ସ୍ୱାਗତ", "urdu": "خوش آمدید" },
  "back": { "english": "Back", "hindi": "वापस", "punjabi": "ਪਿੱਛੇ", "tamil": "பின்னால்", "telugu": "వెనుకకు", "kannada": "ಹಿಂದೆ", "malayalam": "പിന്നിലേക്ക്", "marathi": "मागे", "gujarati": "પાછળ", "bengali": "পিছনে", "odia": "ପଛ", "urdu": "پیچھے" },
  "cancel": { "english": "Cancel", "hindi": "रद्द करें", "punjabi": "ਰੱਦ ਕਰੋ", "tamil": "ரத்துசெய்", "telugu": "రద్దు", "kannada": "ರದ್ದುಮಾಡಿ", "malayalam": "റദ്ദാക്കുക", "marathi": "रद्द करा", "gujarati": "રદ કરો", "bengali": "বাতিল", "odia": "ବାତିଲ୍", "urdu": "منسوخ کریں" },
  "hey": { "english": "Hello", "hindi": "नमस्ते", "punjabi": "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ", "tamil": "வணக்கம்", "telugu": "నమస్కారం", "kannada": "ನಮಸ್ಕಾರ", "malayalam": "നമസ്കാരം", "marathi": "नमस्कार", "gujarati": "નમસ્તે", "bengali": "নমস্কার", "odia": "ନମସ୍କାର", "urdu": "ہیلو" },
  "qty": { "english": "Quantity", "hindi": "मात्रा", "punjabi": "ਮਾਤਰਾ", "tamil": "அளவு", "telugu": "పరిమాణం", "kannada": "ಪ್ರಮಾಣ", "malayalam": "അളവ്", "marathi": "प्रमाण", "gujarati": "જથ્થો", "bengali": "পরিমাণ", "odia": "ପରିମାଣ", "urdu": "مقدار" },
  "total": { "english": "Total Value", "hindi": "कुल मूल्य", "punjabi": "ਕੁੱਲ ਮੁੱਲ", "tamil": "மொத்த மதிப்பு", "telugu": "మొత్తం విలువ", "kannada": "ಒಟ್ಟು ಮೌಲ್ಯ", "malayalam": "ആകെ മൂല്യം", "marathi": "एकूण मूल्य", "gujarati": "કુલ મૂલ્ય", "bengali": "মোট মূল্য", "odia": "ମୋଟ ମୂଲ୍ୟ", "urdu": "کل قیمت" },
  "cart": { "english": "Basket", "hindi": "टोकरी", "punjabi": "ਟੋਕਰੀ", "tamil": "கூடை", "telugu": "బుట్ట", "kannada": "ಬುಟ್ಟಿ", "malayalam": "കൂട", "marathi": "टोपली", "gujarati": "ટોપલી", "bengali": "ঝুড়ি", "odia": "ଝୁଡି", "urdu": "ٹوکری" },
  "cart_empty": { "english": "Basket is empty", "hindi": "टोकरी खाली है", "kannada": "ಬುಟ್ಟಿ ಖಾಲಿಯಿದೆ", "tamil": "கூடை காலியாக உள்ளது", "marathi": "टोपली रिकामी आहे" },
  "secure_payout": { "english": "Safe Connection", "hindi": "सुरक्षित कनेक्शन", "punjabi": "ਸੁਰੱਖਿਅਤ ਕਨੈਕਸ਼ਨ", "kannada": "ಸುರಕ್ಷಿತ ಸಂಪರ್ಕ", "tamil": "பாதுகாப்பான இணைப்பு" },
  "checkout": { "english": "Confirm Shipment", "hindi": "शिपमेंट की पुष्टि करें", "punjabi": "ਸ਼ਿਪਮೆಂಟ್ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ", "kannada": "ಸಾಗಣೆಯನ್ನು ಖಚಿತಪಡಿಸಿ", "marathi": "शिपमेंटची पुष्टी करा" },
  "order_confirmed": { "english": "Harvest Secured!", "hindi": "फसल सुरक्षित!", "punjabi": "ਫਸਲ ਸੁਰੱਖਿਅਤ!", "kannada": "ಕೊಯ್ಲು ಖಚಿತಪಟ್ಟಿದೆ!", "marathi": "पीक सुरक्षित झाले!" },
  "order_confirmed_desc": { "english": "Farmer is preparing your batch.", "hindi": "किसान आपका बैच तैयार कर रहा है।", "kannada": "ರೈತರು ನಿಮ್ಮ ಬ್ಯಾಚ್ ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದಾರೆ.", "marathi": "शेतकरी तुमचा बॅच तयार करत आहे." },
  "seeds_earned": { "english": "Seeds Earned", "hindi": "बीज अर्जित किए", "punjabi": "ਬੀਜ ਕਮਾਏ", "kannada": "ಬೀಜಗಳನ್ನು ಗಳಿಸಿದೆ", "marathi": "बियाणे मिळवले" },
  "profile": { "english": "Profile", "hindi": "प्रोफ़ाइल", "kannada": "ಪ್ರೊಫೈಲ್", "marathi": "प्रोफाइल", "bengali": "প্রোফাইল", "urdu": "پروفائل" },
  "personal_information": { "english": "Bio Details", "hindi": "बायो विवरण", "punjabi": "ਬਾਇਓ ਵੇਰਵੇ", "kannada": "ಜೈವಿಕ ವಿವರಗಳು", "marathi": "बायो तपशील", "urdu": "بایو تفصیلات" },
  "username_label": { "english": "Name", "hindi": "नाम", "kannada": "ಹೆಸರು", "marathi": "नाव" },
  "phone_number": { "english": "Phone", "hindi": "फोन", "kannada": "ದೂರವಾಣಿ", "marathi": "फोन" },
  "language_label": { "english": "Language", "hindi": "भाषा", "kannada": "ಭಾಷೆ", "marathi": "भाषा" },
  "logout": { "english": "Sign Out", "hindi": "साइन आउट", "kannada": "ಲಾಗ್ ಔಟ್", "marathi": "साइन आउट" },
  "delete_account": { "english": "Close Account", "hindi": "खाता बंद करें", "kannada": "ಖಾತೆಯನ್ನು ಮುಚ್ಚಿ", "marathi": "खाते बंद करा" },
  "buy_now": { "english": "Order Now", "hindi": "अभी ऑर्डर करें", "kannada": "ಈಗ ಆರ್ಡರ್ ಮಾಡಿ", "marathi": "आत्ता ऑर्डर करा" },
  "added_to_cart": { "english": "Added to Basket", "hindi": "टोकरी में जोड़ा गया", "kannada": "ಬುಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ", "marathi": "टोपलीत जोडले गेल्या" },
  "hyper_local_agriculture": { "english": "Fresh Farm Produce", "hindi": "ताजा कृषि उत्पाद", "punjabi": "ਤਾਜ਼ਾ ਖੇਤੀ ਉਤਪਾਦ", "kannada": "ತಾಜಾ ಕೃಷಿ ಉತ್ಪನ್ನಗಳು" },
  "welcome_future_farming": { "english": "Direct from farms to your home", "hindi": "खेतों से सीधे आपके घर तक", "kannada": "ಫಾರ್ಮ್‌ಗಳಿಂದ ನೇರವಾಗಿ ನಿಮ್ಮ ಮನೆಗೆ" },
  "choose_your": { "english": "Choose your role", "hindi": "अपनी भूमिका चुनें", "kannada": "ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆರಿಸಿ" },
  "ecosystem_role": { "english": "How will you use FarmConnect?", "hindi": "आप फार्मकनेक्ट का उपयोग कैसे करेंगे?", "kannada": "ನೀವು ಫಾರ್ಮ್‌ಕನೆಕ್ಟ್ ಅನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ?" },
  "farmer_role": { "english": "Farmer", "hindi": "किसान", "kannada": "ರೈತ" },
  "customer_role": { "english": "Customer", "hindi": "ग्राहक", "kannada": "ಗ್ರಾಹಕ" },
  "role_desc": { "english": "Connect with local farmers or sell harvests", "hindi": "स्थानीय किसानों से जुड़ें या फसल बेचें", "kannada": "ಸ್ಥಳೀಯ ರೈತರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ ಅಥವಾ ಸುಗ್ಗಿಯನ್ನು ಮಾರಿ" },
  "explore": { "english": "Explore", "hindi": "खोजें", "kannada": "ಅನ್ವೇಷಿಸಿ" },
  "messages": { "english": "Talk", "hindi": "बातचीत", "kannada": "ಸಂದೇಶಗಳು" },

  // --- RESTORED SYSTEM KEYS ---
  "balance": { "english": "Available", "hindi": "उपलब्ध", "kannada": "ಲಭ್ಯವಿದೆ" },
  "payment_method": { "english": "Choose Payment", "hindi": "भुगतान चुनें", "kannada": "ಪಾವತಿಯನ್ನು ಆರಿಸಿ" },
  "upi_cards": { "english": "Card or Digital Pay", "hindi": "कार्ड या डिजिटल भुगतान", "kannada": "ಕಾರ್ಡ್ ಅಥವಾ ಡಿಜಿಟಲ್ ಪಾವತಿ" },
  "razorpay_desc": { "english": "Secure online transfer", "hindi": "सुरक्षित ऑनलाइन स्थानांतरण", "kannada": "ಸುರಕ್ಷಿತ ಆನ್‌ಲೈನ್ ವರ್ಗಾವಣೆ" },
  "cod_desc": { "english": "Pay at your doorstep", "hindi": "अपने दरवाजे पर भुगतान करें", "kannada": "ನಿಮ್ಮ ಮನೆಯ ಬಾಗಿಲಲ್ಲಿ ಪಾವತಿ ಮಾಡಿ" },
  "pay_securely": { "english": "Pay ₹{amount}", "hindi": "₹{amount} का भुगतान करें", "kannada": "₹{amount} ಪಾವತಿಸಿ" },
  "ssl_encryption_msg": { "english": "Trust-verified connection", "hindi": "विश्वास-सत्यापित कनेक्शन", "kannada": "ನಂಬಿಕೆ-ಪರಿಶೀಲಿಸಿದ ಸಂಪರ್ಕ" },
  "how_was_experience": { "english": "How was the harvest?", "hindi": "फसल कैसी थी?", "kannada": "ಕೊಯ್ಲು ಹೇಗಿತ್ತು?" },
  "feedback_helps_others": { "english": "Help neighbors find the best crops", "hindi": "पड़ोसियों को बेहतरीन फसलें खोजने में मदद करें", "kannada": "ನೆರೆಯವರು ಅತ್ಯುತ್ತಮ ಬೆಳೆಗಳನ್ನು ಹುಡುಕಲು ಸಹಾಯ ಮಾಡಿ" },
  "write_review": { "english": "Share your thoughts...", "hindi": "अपने विचार साझा करें...", "kannada": "ನಿಮ್ಮ ಅನಿಸಿಕೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ..." },
  "hyper_local_feed": { "english": "Neighborly Harvests", "hindi": "पड़ोसी फसलें", "kannada": "ನೆರೆಯ ಕೊಯ್ಲುಗಳು" },
  "search_local_produce": { "english": "Search fresh harvests...", "hindi": "ताजी फसलें खोजें...", "kannada": "ತಾಜಾ ಕೊಯ್ಲುಗಳನ್ನು ಹುಡುಕಿ..." },
  "radar_view": { "english": "Harvest Map", "hindi": "फसल मानचित्र", "kannada": "ಕೊಯ್ಲು ಭೂಪಟ" },
  "active_yields": { "english": "Ongoing Harvests", "hindi": "जारी फसलें", "kannada": "ನಡೆಯುತ್ತಿರುವ ಕೊಯ್ಲುಗಳು" },
  "contract_hash": { "english": "Order #", "hindi": "ऑर्डर #", "kannada": "ಆರ್ಡರ್ #" },
  "awaiting_bid": { "english": "Finding Transport...", "hindi": "परिवहन खोज रहे हैं...", "kannada": "ಸಾರಿಗೆ ಹುಡುಕಲಾಗುತ್ತಿದೆ..." },
  "authorize_payment": { "english": "Claim Harvest", "hindi": "फसल का दावा करें", "kannada": "ಕೊಯ್ಲನ್ನು ಪಡೆದುಕೊಳ್ಳಿ" },
  "comms": { "english": "Talk to Farmer", "hindi": "किसान से बात करें", "kannada": "ರೈತರೊಂದಿಗೆ ಮಾತನಾಡಿ" },
  "live_feed_market": { "english": "Nearby Barns", "hindi": "निकटवर्ती खलिहान", "kannada": "ಹತ್ತಿರದ ಕಣಜಗಳು" },
  "no_nodes_found": { "english": "No harvests found nearby", "hindi": "आसपास कोई फसल नहीं मिली", "kannada": "ಹತ್ತಿರದಲ್ಲಿ ಯಾವುದೇ ಕೊಯ್ಲು ಕಂಡುಬಂದಿಲ್ಲ" },
  "adjust_radar": { "english": "Try searching a bit further or for a different crop", "hindi": "थोड़ा आगे या किसी अलग फसल के लिए खोजें", "kannada": "ಸ್ವಲ್ಪ ದೂರ ಅಥವಾ ಬೇರೆ ಬೆಳೆಗೆ ಹುಡುಕಿ" },
  "farm_diagnostics": { "english": "Barn Stats", "hindi": "खलिहान के आँकड़े", "kannada": "ಕಣಜದ ಅಂಕಿಅಂಶಗಳು" },
  "est_value": { "english": "Harvest Value", "hindi": "फसल का मूल्य", "kannada": "ಕೊಯ್ಲು ಮೌಲ್ಯ" },
  "broadcasted_hyper_local": { "english": "Announced to all neighbors", "hindi": "सभी पड़ोसियों को सूचित किया गया", "kannada": "ಎಲ್ಲಾ ನೆರೆಯವರಿಗೆ ಘೋಷಿಸಲಾಗಿದೆ" },
  "upcoming_yield_secured": { "english": "Future harvest listed", "hindi": "भविष्य की फसल सूचीबद्ध", "kannada": "ಭವಿಷ್ಯದ ಕೊಯ್ಲು ಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ" },
  "transmit_otp": { "english": "Send OTP", "hindi": "ओटीपी भेजें", "kannada": "ಒಟಿಪಿ ಕಳುಹಿಸಿ" },
  "decrypting_btn": { "english": "Verifying...", "hindi": "सत्यापित कर रहे हैं...", "kannada": "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." },
  "initialize_session": { "english": "Sign In", "hindi": "साइन इन करें", "kannada": "ಸೈನ್ ಇನ್ ಮಾಡಿ" },
  "resend_transmission": { "english": "Send Again", "hindi": "पुनः भेजें", "kannada": "ಮತ್ತೆ ಕಳುಹಿಸಿ" },
  "no_active_node": { "english": "New here?", "hindi": "यहाँ नए हैं?", "kannada": "ಇಲ್ಲಿ ಹೊಸಬರೇ?" },
  "register_node": { "english": "Join the Market", "hindi": "बाजार से जुड़ें", "kannada": "ಮಾರುಕಟ್ಟೆಗೆ ಸೇರಿ" },
  "your_identity": { "english": "Your Name", "hindi": "आपका नाम", "kannada": "ನಿಮ್ಮ ಹೆಸರು" },
  "comm_channel_phone": { "english": "Phone Number", "hindi": "फ़ोन नंबर", "kannada": "ಫೋನ್ ಸಂಖ್ಯೆ" },
  "finalize_protocol": { "english": "Create Account", "hindi": "खाता बनाएँ", "kannada": "ಖಾತೆಯನ್ನು ರಚಿಸಿ" },
  "node_already_exists": { "english": "Already a member?", "hindi": "पहले से सदस्य हैं?", "kannada": "ಈಗಾಗಲೇ ಸದಸ್ಯರೇ?" },
  "access_node": { "english": "Sign In", "hindi": "साइन इन करें", "kannada": "ಸೈನ್ ಇನ್ ಮಾಡಿ" },
  "ask_delivery_price": { "english": "Request delivery help", "hindi": "वितरण सहायता मांगें", "kannada": "ವಿತರಣಾ ಸಹಾಯ ವಿನಂತಿಸಿ" },
  "delivery_requested": { "english": "Help Requested", "hindi": "सहायता मांगी गई", "kannada": "ಸಹಾಯ ವಿನಂತಿಸಲಾಗಿದೆ" },
  "online": { "english": "Online", "hindi": "ऑनलाइन", "kannada": "ಆನ್‌ಲೈನ್" },
  "customer_gateway": { "english": "Sign In", "hindi": "साइन इन", "kannada": "ಸೈನ್ ಇನ್" },
  "initialize_gateway": { "english": "Join FarmConnect", "hindi": "FarmConnect से जुड़ें", "kannada": "FarmConnect ಗೆ ಸೇರಿ" },
  "gateway_login": { "english": "Login", "hindi": "लॉगिन", "kannada": "ಲಾಗಿನ್" },
  "gateway_setup": { "english": "Sign Up", "hindi": "साइन अप", "kannada": "ಸೈನ್ ಅಪ್" },
  "sign_into_consumer_protocol": { "english": "Sign in to buy fresh local produce", "hindi": "ताजा स्थानीय उत्पाद खरीदने के लिए साइन इन करें", "kannada": "ತಾಜಾ ಸ್ಥಳೀಯ ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ" },
  "join_collective_buy_direct": { "english": "Get fresh harvests directly from the soil", "hindi": "सीधे मिट्टी से ताजी फसल प्राप्त करें", "kannada": "ನೇರವಾಗಿ ಮಣ್ಣಿನಿಂದ ತಾಜಾ ಸುಗ್ಗಿಯನ್ನು ಪಡೆಯಿರಿ" },
  "authenticate_mobile_channel": { "english": "Verify your phone", "hindi": "अपना फोन सत्यापित करें", "kannada": "ನಿಮ್ಮ ಫೋನ್ ಪರಿಶೀಲಿಸಿ" },
  "initialize_customer_profile": { "english": "Complete your profile", "hindi": "अपनी प्रोफ़ाइल पूरी करें", "kannada": "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಅನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ" },
  "enter_phone_number": { "english": "Your phone number", "hindi": "आपका फोन नंबर", "kannada": "ನಿಮ್ಮ ದೂರವಾಣಿ ಸಂಖ್ಯೆ" },
  "otp_code": { "english": "OTP Code", "hindi": "ओटीपी कोड", "kannada": "OTP ಕೋಡ್" },
  "resend_otp_in": { "english": "Resend in", "hindi": "पुनः भेजें", "kannada": "ಮರುಕಳುಹಿಸಿ" },
  "full_name": { "english": "Full Name", "hindi": "पूरा नाम", "kannada": "ಪೂರ್ಣ ಹೆಸರು" },
  "deploying_btn": { "english": "Saving...", "hindi": "सहेज रहे हैं...", "kannada": "ಉಳಿಸಲಾಗುತ್ತಿದೆ..." },
  "connecting_btn": { "english": "Connecting...", "hindi": "जुड़ रहे हैं...", "kannada": "ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ..." },
  "sending_btn": { "english": "Sending...", "hindi": "भेज रहे हैं...", "kannada": "ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ..." },
  "farmer_node": { "english": "Farmer Portal", "hindi": "किसान पोर्टल", "kannada": "ರೈತ ಪೋರ್ಟಲ್" },
  "node_login": { "english": "Farmer Login", "hindi": "किसान लॉगिन", "kannada": "ರೈತ ಲಾಗಿನ್" },
  "initialize_node": { "english": "Access Dashboard", "hindi": "डैशबोर्ड तक पहुंचें", "kannada": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಪ್ರವೇಶಿಸಿ" },
  "access_farmer_dashboard": { "english": "Manage your crops and orders", "hindi": "अपनी फसलों और ऑर्डर का प्रबंधन करें", "kannada": "ನಿಮ್ಮ ಬೆಳೆಗಳು ಮತ್ತು ಆರ್ಡರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ" },
  "join_collective_sell_direct": { "english": "Sell your produce directly to local customers", "hindi": "अपनी उपज सीधे स्थानीय ग्राहकों को बेचें", "kannada": "ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳನ್ನು ನೇರವಾಗಿ ಸ್ಥಳೀಯ ಗ್ರಾಹಕರಿಗೆ ಮಾರಿ" },
  "node_setup": { "english": "Farmer Registration", "hindi": "किसान पंजीकरण", "kannada": "ರೈತ ನೋಂದಣಿ" },
  "initialize_farmer_profile": { "english": "Setup your farm profile", "hindi": "अपनी कृषि प्रोफ़ाइल सेट करें", "kannada": "ನಿಮ್ಮ ಫಾರ್ಮ್ ಪ್ರೊಫೈಲ್ ಸೆಟಪ್ ಮಾಡಿ" },
  "dont_have_node": { "english": "New farmer?", "hindi": "नए किसान?", "kannada": "ಹೊಸ ರೈತರೇ?" },
  "type_message": { "english": "Type a message...", "hindi": "संदेश टाइप करें...", "kannada": "ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ..." },
  "loading_conversation": { "english": "Loading chat...", "hindi": "चैट लोड हो रहा है...", "kannada": "ಚಾಟ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },
  "start_conversation_desc": { "english": "Start a conversation now", "hindi": "अभी बातचीत शुरू करें", "kannada": "ಈಗ ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭಿಸಿ" },
  
  // Role Selection Page Keys
  "connecting_farmers_customers": { "english": "Soil to Soul", "hindi": "मिट्टी से आत्मा तक", "punjabi": "ਮਿੱਟੀ ਤੋਂ ਆਤਮਾ ਤੱਕ", "tamil": "மண்ணிலிருந்து ஆன்மா வரை", "telugu": "నేల నుండి ఆత్మ వరకు", "kannada": "ಮಣ್ಣಿನಿಂದ ಆತ್ಮದ ವರೆಗೆ", "malayalam": "മണ്ണിൽ നിന്ന് ആത്മാവ് വരെ", "marathi": "जमिनीपासून आत्म्यापर्यंत", "gujarati": "માટીથી આત્મા સુધી", "bengali": "মাটি থেকে আত্মা পর্যন্ত", "odia": "ମାଟିରୁ ଆତ୍ମା ପର୍ଯ୍ୟନ୍ତ", "urdu": "مٹی سے روح تک" },
  "farmfarmer": { "english": "Farmer", "hindi": "किसान", "punjabi": "ਕਿਸਾਨ", "tamil": "உழவர்", "telugu": "రైతు", "kannada": "ರೈತ", "malayalam": "കർഷകൻ", "marathi": "शेतकरी", "gujarati": "ખેડૂત", "bengali": "কৃষক", "odia": "ଚାଷା", "urdu": "کسان" },
  "farmcustomer": { "english": "Customer", "hindi": "ग्राहक", "punjabi": "ਗਾਹਕ", "tamil": "வாடிக்கையாளர்", "telugu": "వినియోగదారు", "kannada": "ಗ್ರಾಹಕ", "malayalam": "ഉപഭോക്താവ്", "marathi": "ग्राहक", "gujarati": "ગ્રાહક", "bengali": "গ্রাহক", "odia": "ଗ୍ରାହକ", "urdu": "گاہک" },
  "farmer_feat_1": { "english": "Sell fresh produce directly", "hindi": "ताजा उत्पाद सीधे बेचें", "punjabi": "ਤਾਜ਼ੀ ਪੈਦਾਵਾਰ ਸਿੱਧਾ ਵੇਚੋ", "tamil": "புதிய பொருட்களை நேரடியாக விற்கவும்", "telugu": "తాజా ఉత్పత్తులను నేరుగా అమ్మిండి", "kannada": "ತಾಜಾ ಉತ್ಪನ್ನಗಳನ್ನು ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಿ", "malayalam": "പുതിയ ഉൽപ്പന്നങ്ങൾ നേരിട്ട് വിറ്കുക", "marathi": "ताजी उत्पादने थेट विका", "gujarati": "તાજી ઉત્પાદનો સીધા વેચો", "bengali": "সদ্য উৎপাদন সরাসরি বিক্রি করুন", "odia": "ସତେଜ ଉତ୍ପାଦନ ସିଧାସଳେ ବିକ୍ରି କରନ୍ତୁ", "urdu": "تازہ پیداوار براہ راست بیچیں" },
  "farmer_feat_2": { "english": "Connect with local customers", "hindi": "स्थानीय ग्राहकों से जुड़ें", "punjabi": "ਸਥਾਨਕ ਗਾਹਕਾਂ ਨਾਲ ਜੁੜੋ", "tamil": "உள்ளூர் வாடிக்கையாளர்களுடன் இணைக்கவும்", "telugu": "స్థానిక వినియోగదారులతో కనెక్ట్ అవ్వండి", "kannada": "ಸ್ಥಳೀಯ ಗ್ರಾಹಕರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ", "malayalam": "പ്രാദേശിക ഉപഭോക്താക്കളുമായി ബന്ധപ്പെടുക", "marathi": "स्थानिक ग्राहकांशी जोडा", "gujarati": "સ્થાનિક ગ્રાહકો સાથે જોડાઓ", "bengali": "স্থানীয ক্রেতাদের সাথে যোগাযোগ করুন", "odia": "ସ୍ଥାନୀୟ ଗ୍ରାହକମାନଙ୍କ ସହିତ ସଂଯୋଗ କରନ୍ତୁ", "urdu": "مقامی گاہکوں سے رابطہ کریں" },
  "farmer_feat_3": { "english": "Fair prices, no middlemen", "hindi": "निष्पक्ष मूल्य, कोई बिचौलिया नहीं", "punjabi": "ਇਨਸਾਫ਼ ਕੀਮਤਾਂ, ਕੋਈ ਦਲਾਲ ਨਹੀਂ", "tamil": "நியாயமான விலைகள், இடைத்தரகர்கள் இல்லை", "telugu": "సరైన ధరలు, మధ్యవర్తులు లేరు", "kannada": "ನ್ಯಾಯಯುತ ಬೆಲೆಗಳು, ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ", "malayalam": "ന്യായമായ വില, ഇടന്നില്ല", "marathi": "फायरी किंमत, मध्यस्थी नाही", "gujarati": "ન્યાયપૂર્ણ કિંમતો, કોઈ મધ્યસ્થ નહીં", "bengali": "ন্যায্য মূল্য, কোনো মধ্যস্থতা নয়", "odia": "ନ୍ୟାୟ ମୂଲ୍ୟ, କୌଣସି ମଧ୍ୟସ୍ଥ ନାହିଁ", "urdu": "مناسب قیمت، کوئی دلال نہیں" },
  "deploy_farm_node": { "english": "Start Farming", "hindi": "खेती शुरू करें", "punjabi": "ਖੇਤੀ ਸ਼ੁਰੂ ਕਰੋ", "tamil": "உழவைத் தொடங்குங்கள்", "telugu": "వ్యవసాయం ప్రారంభించండి", "kannada": "ಕೃಷಿಯನ್ನು ಪ್ರಾರಂಭಿಸಿ", "malayalam": "കൃഷി ആരംഭിക്കുക", "marathi": "शेती सुरू करा", "gujarati": "ખેતી શરૂ કરો", "bengali": "চাষাবাদ শুরু করুন", "odia": "ଚାଷ ଆରମ୍ଭ କରନ୍ତୁ", "urdu": "کھیتی باڑی شروع کریں" },
  "customer_feat_1": { "english": "Buy fresh from local farms", "hindi": "स्थानीय खेतों से ताजा खरीदें", "punjabi": "ਸਥਾਨਕ ਖੇਤਾਂ ਤੋਂ ਤਾਜ਼ਾ ਖਰੀਦੋ", "tamil": "உள்ளூர் பண்ணைகளிலிருந்து புதியதை வாங்குங்கள்", "telugu": "స్థానిక పొలాల నుండి తాజాగా కొనండి", "kannada": "ಸ್ಥಳೀಯ ಜಮೀನುಗಳಿಂದ ತಾಜಾ ಖರೀದಿಸಿ", "malayalam": "പ്രാദേശിക ഫാമുകളിൽ നിന്ന് പുതിയത് വാങ്ങുക", "marathi": "स्थानिक शेतांमधून ताजे खरेदी करा", "gujarati": "સ્થાનિક ખેતોમાંથી તાજું ખરીદો", "bengali": "স্থানীয খামার থেকে তাজা কিনুন", "odia": "ସ୍ଥାନୀୟ ଖେତମାନଙ୍କଠାରୁ ସତେଜ କିଣି ନିଅନ୍ତୁ", "urdu": "مقامی کھیتوں سے تازہ خریدیں" },
  "customer_feat_2": { "english": "Support local farmers", "hindi": "स्थानीय किसानों का समर्थन करें", "punjabi": "ਸਥਾਨਕ ਕਿਸਾਨਾਂ ਦਾ ਸਮਰਥਨ ਕਰੋ", "tamil": "உள்ளூர் உழவர்களை ஆதரிக்கவும்", "telugu": "స్థానిక రైతులకు మద్దతు ఇవ్వండి", "kannada": "ಸ್ಥಳೀಯ ರೈತರನ್ನು ಬೆಂಬಲಿಸಿ", "malayalam": "പ്രാദേശിക കർഷകരെ പിന്തുണയ്ക്കുക", "marathi": "स्थानिक शेतकऱ्यांना समर्थन द्या", "gujarati": "સ્થાનિક ખેડૂતોને ટેકો આપો", "bengali": "স্থানীয কৃষকদের সমর্থন করুন", "odia": "ସ୍ଥାନୀୟ ଚାଷାମାନଙ୍କୁ ସମର୍ଥନ କରନ୍ତୁ", "urdu": "مقامی کسان کو سپورٹ کریں" },
  "customer_feat_3": { "english": "Get farm-fresh quality", "hindi": "खेत-ताज़ा गुणवत्ता पाएं", "punjabi": "ਖੇਤ-ਤਾਜ਼ਾ ਕੁਆਲਿਟੀ ਪਾਓ", "tamil": "பண்ணை-புதிய தரம் பெறுங்கள்", "telugu": "పొలం-తాజా నాణ్యత పొందండి", "kannada": "ಜಮೀನು-ತಾಜಾ ಗುಣಮಟ್ಟವನ್ನು ಪಡೆಯಿರಿ", "malayalam": "ഫാം-ഫ്രഷ് നിലവാരം നേടുക", "marathi": "शेत-ताजे गुणवत्ता मिळवा", "gujarati": "ખેત-તાજી ગુણવત્તા મેળવો", "bengali": "খামার-সদ্য মানের পান", "odia": "ଚାଷ-ସତେଜ ଗୁଣବତ୍ତା ପ୍ରାପ୍ତ କରନ୍ତୁ", "urdu": "کھیت تازہ معیار حاصل کریں" },
  "access_marketplace": { "english": "Browse Market", "hindi": "बाज़ार देखें", "punjabi": "ਬਾਜ਼ਾਰ ਵੇਖੋ", "tamil": "சந்தையை உலாவுங்கள்", "telugu": "మార్కెట్‌ను బ్రౌజ్ చేయండి", "kannada": "ಮಾರುಕಟ್ಟೆಯನ್ನು ವೀಕ್ಷಿಸಿ", "malayalam": "മാർക്കറ്റ് ബ്രൗസ് ചെയ്യുക", "marathi": "बाजार बघा", "gujarati": "બજાર જુઓ", "bengali": "বাজার ব্রাউজ করুন", "odia": "ବଜାର ବ୍ରାଉଜ୍ କରନ୍ତୁ", "urdu": "مارکیٹ براؤز کریں" }
};

export function getCurrentLanguage(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'english';
  }
  return 'english';
}

export function setLanguage(lang: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

export function translate(key: string, vars?: Record<string, any>, language?: string): string {
  const currentLang = language || getCurrentLanguage();
  let text = translations[key]?.[currentLang] || translations[key]?.['english'] || key;

  if (vars) {
    Object.entries(vars).forEach(([k, v]) => {
      // Support both {key} and {{key}} placeholders
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    });
  }

  return text;
}

export function t(key: string, vars?: Record<string, any>): string {
  return translate(key, vars);
}

export { translations };
