import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles, TrendingUp, Droplets, Sun, Cloud, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  category?: 'general' | 'climate' | 'harvesting' | 'rotation' | 'recommendation';
}

interface FarmingTip {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'climate' | 'harvesting' | 'rotation' | 'recommendation';
}

export default function FarmingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const farmingTips: FarmingTip[] = [
    {
      id: '1',
      title: t('climate_smart_farming'),
      description: t('climate_smart_farming_desc'),
      icon: <Cloud className="w-5 h-5 text-blue-500" />,
      category: 'climate'
    },
    {
      id: '2',
      title: t('optimal_harvest_time'),
      description: t('optimal_harvest_time_desc'),
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      category: 'harvesting'
    },
    {
      id: '3',
      title: t('crop_rotation_strategy'),
      description: t('crop_rotation_strategy_desc'),
      icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
      category: 'rotation'
    },
    {
      id: '4',
      title: t('water_management'),
      description: t('water_management_desc'),
      icon: <Droplets className="w-5 h-5 text-cyan-500" />,
      category: 'climate'
    },
    {
      id: '5',
      title: t('pest_prevention'),
      description: t('pest_prevention_desc'),
      icon: <Sun className="w-5 h-5 text-orange-500" />,
      category: 'recommendation'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Climate-related queries
    if (lowerMessage.includes('climate') || lowerMessage.includes('weather') || lowerMessage.includes('rain') || 
        lowerMessage.includes(t('climate_smart_farming').toLowerCase()) || 
        lowerMessage.includes(t('water_management').toLowerCase())) {
      if (language === 'hindi') {
        return 'वर्तमान मौसम पैटर्न के आधार पर, इस सीजन में सूखा-प्रतिरोधी फसलें लगाने पर विचार करें।';
      } else if (language === 'punjabi') {
        return 'ਮੌਜੂਦਾ ਮੌਸਮ ਪੈਟਰਨ ਦੇ ਆਧਾਰ \'ਤੇ, ਇਸ ਸੀਜ਼ਨ ਵਿੱਚ ਸੁੱਕੇ-ਰੋਧੀ ਫਸਲਾਂ ਲਗਾਉਣ ਬਾਰੇ ਵਿਚਾਰ ਕਰੋ।';
      } else if (language === 'tamil') {
        return 'தற்போதைய வானிலை முறைகளின் அடிப்படையில், இந்த பருவத்தில் வறட்சி-எதிர்ப்பு பயிர்களை நடவு செய்ய கருதுங்கள்.';
      } else if (language === 'telugu') {
        return 'ప్రస్తుత వాతావరణ నమూనాల ఆధారంగా, ఈ సీజన్‌లో కరువు-నిరోధక పంటలు నాటడానికి పరిగణించండి.';
      } else if (language === 'kannada') {
        return 'ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಪ್ಯಾಟರ್ನ್‌ಗಳ ಆಧಾರದ ಮೇಲೆ, ಈ ಋತುವಿನಲ್ಲಿ ಬರ ಪ್ರತಿರೋಧಿ ಬೆಳೆಗಳನ್ನು ನೆಡುವುದನ್ನು ಪರಿಗಣಿಸಿ.';
      } else if (language === 'malayalam') {
        return 'നിലവിലെ കാലാവസ്ഥാ പാറ്റേണുകളുടെ അടിസ്ഥാനത്തിൽ, ഈ സീസണിൽ വരൾച്ച പ്രതിരോധി വിളകൾ നടുന്നത് പരിഗണിക്കുക.';
      } else if (language === 'marathi') {
        return 'वर्तमान हवामानाच्या नमुन्यांच्या आधारावर, या हंगामात दुष्काळ-प्रतिरोधक पिके लावाण्याचा विचार करा.';
      } else if (language === 'gujarati') {
        return 'હાલના હવામાન પેટર્નના આધારે, આ સીઝનમાં સૂકા-પ્રતિરોધી પાકો વવડવા પર વિચાર કરો.';
      } else if (language === 'bengali') {
        return 'বর্তমান আবহাওয়া প্যাটার্নের উপর ভিত্তি করে, এই মৌসুমে খরাপ্রতিরোধী ফসল রোপণ করার কথা বিবেচনা করুন।';
      } else if (language === 'odia') {
        return 'ବର୍ତ୍ତମାନ ପାଣିପାଗ ପ୍ରକ୍ରିୟା ଉପରେ ଆଧାର କରି, ଏହି ଋତୁରେ ଖରା-ପ୍ରତିରୋଧୀ ଫସଲ ଲଗାଇବାକୁ ବିଚାର କରନ୍ତୁ। ମାଟି ଆର୍ଦ୍ରତା ସ୍ତର ନିକଟରେ ନଜର ରଖନ୍ତୁ।'
      } else if (language === 'urdu') {
        return 'موجودہ موسمی پیٹرن کی بنیاد پر، اس سیزن میں خشکی-مخالف فصلیں لگانے پر غور کریں۔';
      } else {
        return 'Based on current weather patterns, consider planting drought-resistant crops this season. Monitor soil moisture levels closely.';
      }
    }
    
    // Harvesting-related queries
    if (lowerMessage.includes('harvest') || lowerMessage.includes('ready') || lowerMessage.includes('mature') ||
        lowerMessage.includes(t('optimal_harvest_time').toLowerCase())) {
      if (language === 'hindi') {
        return 'आपकी फसलें परिपक्वता के लक्षण दिखा रही हैं। सर्वोत्तम गुणवत्ता के लिए अगले 7-10 दिनों में कटाई करें।';
      } else if (language === 'punjabi') {
        return 'ਤੁਹਾਡੀਆਂ ਫਸਲਾਂ ਪਰਿਪੱਕਤਾ ਦੇ ਸੰੰਕੇਤ ਦਿਖਾ ਰਹੀਆਂ ਹਨ। ਵਧੀਆ ਗੁਣਵੱਤਾ ਲਈ ਅਗਲੇ 7-10 ਦਿਨਾਂ ਵਿੱਚ ਵਾਢੀ ਕਰੋ।';
      } else if (language === 'tamil') {
        return 'உங்கள் பயிர்கள் மென்மையான அறிகுறிகளைக் காட்டுகின்றன. சிறந்த தரம் மற்றும் சந்தை விலைக்கு அடுத்த 7-10 நாட்களுக்குள் அறுவடை செய்யுங்கள்.';
      } else if (language === 'telugu') {
        return 'మీ పంటలు పరిపక్వత సంకేతాలను చూపిస్తున్నాయి. ఉత్తమ నాణ్యత మరియు మార్కెట్ ధరల కోసం వచ్చే 7-10 రోజుల్లో దుగ్గర చేయండి.';
      } else if (language === 'kannada') {
        return 'ನಿಮ್ಮ ಬೆಳೆಗಳು ಪಕ್ವತೆಯ ಚಿಹ್ನೆಗಳನ್ನು ತೋರಿಸುತ್ತಿವೆ. ಉತ್ತಮ ಗುಣಮಟ್ಟ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳಿಗಾಗಿ ಮುಂದಿನ್ 7-10 ದಿನಗಳಲ್ಲಿ ಕಟಾವು ಮಾಡಿ.';
      } else if (language === 'malayalam') {
        return 'നിങ്ങളുടെ വിളകൾൾ പക്വതയുടെ അടയാളങ്ങൾൾ കാണിക്കുന്നു. മികച്ച ഗുണനിലവാരവും വിലയും അടുത്ത 7-10 ദിവസങ്ങൾൾക്കുളിൽ വിളവെടുക്കുക.';
      } else if (language === 'marathi') {
        return 'तुमच्या पिकांमध्ये परिपक्वतेचे लक्षणे दिसत आहेत. सर्वोत्तम गुणवत्ता आणि बाजारभावांसाठी पुढील 7-10 दिवसांमध्ये कापणी करा.';
      } else if (language === 'gujarati') {
        return 'તમારા પાકો પરિપકવતાના સંકેતો દર્શાવી રહ્યા છે. શ્રેષ્ઠ ગુણવત્તા અને બાજાર કિંમતો માટે આવનારા 7-10 દિવસોમાં કાપણી કરો.';
      } else if (language === 'bengali') {
        return 'আপনার ফসলগুলি পরিপক্কতার লক্ষণ দেখাচ্ছে। সেরা গুণমান এবং বাজার মূল্যের জন্য আগামী 7-10 দিনের মধ্যে ফসল সংগ্রহ করুন।';
      } else if (language === 'odia') {
        return 'ଆପଣଙ୍କର ଫସଲଗୁଡ଼ିକ ପରିପକ୍କତାର ଲକ୍ଷଣ ଦେଖାଉଛନ୍ତି। ସର୍ବୋତ୍ତମ ଗୁଣବତ୍ତା ଏବଂ ବଜାର ମୂଲ୍ୟ ପାଇଁ ଆସନ୍ତା 7-10 ଦିନ ମଧ୍ୟରେ କଟାନ୍ତୁ।'
      } else if (language === 'urdu') {
        return 'آپ کی فصلیں بلوغت کے اشارے دکھا رہی ہیں۔ بہترین معیار اور مارکیٹ قیمت کے لیے اگلے 7-10 دنوں میں کٹائی کریں۔';
      } else {
        return 'Your crops are showing signs of maturity. Harvest within the next 7-10 days for best quality and market prices.';
      }
    }
    
    // Crop rotation queries
    if (lowerMessage.includes('rotation') || lowerMessage.includes('next crop') || lowerMessage.includes('soil') ||
        lowerMessage.includes(t('crop_rotation_strategy').toLowerCase())) {
      if (language === 'hindi') {
        return 'कटाई के बाद, मिट्टी में नाइट्रोजन भरपूर करने के लिए दलहन के साथ चक्र करें। अगले सीजन के लिए मटर या दालें पर विचार करें।';
      } else if (language === 'punjabi') {
        return 'ਵਾਢੀ ਤੋਂ ਬਾਅਦ, ਮਿੱਟੀ ਵਿੱਚ ਨਾਈਟ੍ਰੋਜਨ ਭਰਪੂਰ ਕਰਨ ਲਈ ਦਾਲਾਂ ਨਾਲ ਰੋਟੇਟ ਕਰੋ। ਅਗਲੇ ਸੀਜ਼ਨ ਲਈ ਮਟਰ ਜਾਂ ਦਾਲਾਂ ਬਾਰੇ ਵਿਚਾਰ ਕਰੋ।'
      } else if (language === 'odia') {
        return 'କଟାଇବା ପରେ, ମାଟିରେ ନାଇଟ୍ରୋଜେନ୍ ପୁରଣ କରିବା ପାଇଁ ଦଲହନ ସହିତ ଚକ୍ର କରନ୍ତୁ। ଆସନ୍ତା ଋତୁ ପାଇଁ ମଟର କିମ୍ବା ଡାଲି ଉପରେ ବିଚାର କରନ୍ତୁ।'
      } else if (language === 'urdu') {
        return 'کاٹائی کے بعد، مٹی میں نائٹروجن بھرنے کے لیے دالوں کے ساتھ روٹیٹ کریں۔ اگلے سیزن کے لیے مٹر یا دالیں پر غور کریں۔'
      } else {
        return 'After harvesting, rotate with legumes to replenish soil nitrogen. Consider peas or lentils for the next season.';
      }
    }
    
    // Fertilizer and soil nutrients
    if (lowerMessage.includes('fertilizer') || lowerMessage.includes('nutrient') || lowerMessage.includes('soil health') ||
        lowerMessage.includes('organic') || lowerMessage.includes('compost') || lowerMessage.includes('manure')) {
      if (language === 'hindi') {
        return 'अपनी मिट्टी की जांच करवाएं और आवश्यक पोषक तत्वों के आधार पर उर्वरक का उपयोग करें। जैविक खाद से मिट्टी की संरचना में सुधार होता है।';
      } else if (language === 'punjabi') {
        return 'ਆਪਣੀ ਮਿੱਟੀ ਦੀ ਜਾਂਚ ਕਰਵਾਓ ਅਤੇ ਲੋੜੀਂਦੇ ਪੋਸ਼ਕ ਤੱਤਾਂ ਦੇ ਆਧਾਰ ਤੇ ਖਾਦ ਦੀ ਵਰਤੋਂ ਕਰੋ। ਜੈਵਿਕ ਖਾਦ ਨਾਲ ਮਿੱਟੀ ਦੀ ਬਣਤਰ ਵਧੀਆ ਹੁੰਦੀ ਹੈ।';
      } else if (language === 'odia') {
        return 'ଆପଣଙ୍କର ମାଟି ପରୀକ୍ଷା କରନ୍ତୁ ଏବଂ ଆବଶ୍ୟକ ପୁଷ୍ଟିସାରର ଆଧାରରେ ସାର ବ୍ୟବହାର କରନ୍ତୁ। ଜୈବିକ ସାର ମାଟି ସଂରଚନାକୁ ଉନ୍ନତ କରେ।';
      } else if (language === 'urdu') {
        return 'اپنی مٹی کی جانچ کروائیں اور ضروری غذائی عناصر کی بنیاد پر کھاد کا استعمال کریں۔ نامیادی کھاد سے مٹی کی ساخت میں بہتری آتی ہے۔';
      } else {
        return 'Test your soil and use fertilizers based on required nutrients. Organic fertilizers improve soil structure and long-term fertility.';
      }
    }
    
    // Pest and disease management
    if (lowerMessage.includes('pest') || lowerMessage.includes('disease') || lowerMessage.includes('insect') ||
        lowerMessage.includes('fungus') || lowerMessage.includes('virus') || lowerMessage.includes('treatment')) {
      if (language === 'hindi') {
        return 'रोग प्रतिरोधी किस्में चुनें और एकीकृत कीट प्रबंधन अपनाएं। समय पर निदान और उपचार से फसल हानि कम होती है।';
      } else if (language === 'punjabi') {
        return 'ਰੋਗ-ਰੋਧਕ ਕਿਸਮਾਂ ਚੁਣੋ ਅਤੇ ਇੰਟੀਗ੍ਰੇਟਿਡ ਪੈਸਟ ਮੈਨੇਜਮੈਂਟ ਅਪਣਾਓ। ਸਮੇਂ ਸਿਰ ਨਿਦਾਨ ਅਤੇ ਇਲਾਜ ਨਾਲ ਫਸਲ ਨੁਕਸਾਨ ਘੱਟ ਹੁੰਦਾ ਹੈ।';
      } else if (language === 'odia') {
        return 'ରୋଗ ପ୍ରତିରୋଧୀ ପ୍ରକାର ବାଛନ୍ତୁ ଏବଂ ସମନ୍ଵିତ କୀଟ ପରିଚାଳନା ଅପନାନ୍ତୁ। ସମୟରେ ନିର୍ଣ୍ଣୟ ଏବଂ ଚିକିତ୍ସାରେ ଫସଲ କ୍ଷୟ କମ୍ ହୁଏ।';
      } else if (language === 'urdu') {
        return 'بیماریوں کے خلاف مزور قسمیں چنیں اور انٹیگریٹڈ پیسٹ مینجمنٹ اپنائیں۔ وقت پر تشخیص اور علاج سے فصل کا نقصان کم ہوتا ہے۔';
      } else {
        return 'Choose disease-resistant varieties and adopt integrated pest management. Early diagnosis and treatment reduce crop losses.';
      }
    }
    
    // Irrigation and water management
    if (lowerMessage.includes('irrigation') || lowerMessage.includes('water') || lowerMessage.includes('drip') ||
        lowerMessage.includes('sprinkler') || lowerMessage.includes('flood') || lowerMessage.includes('drought')) {
      if (language === 'hindi') {
        return 'ड्रिप इरिगेशन पानी बचाने का सबसे अच्छा तरीका है। सुबह या शाम को सिंचाई करें और मिट्टी की नमी की निगरानी करें।';
      } else if (language === 'punjabi') {
        return 'ਡ੍ਰਿਪ ਇਰੀਗੇਸ਼ਨ ਪਾਣੀ ਬਚਾਉਣ ਦਾ ਸਭ ਤੋਂ ਵਧੀਆ ਤਰੀਕਾ ਹੈ। ਸਵੇਰ ਜਾਂ ਸ਼ਾਮ ਨੂੰ ਸਿੰਚਾਈ ਕਰੋ ਅਤੇ ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।';
      } else if (language === 'odia') {
        return 'ଡ୍ରିପ୍ ଇରିଗେସନ୍ ପାଣି ବଞ୍ଚାଇବାର ସର୍ବୋତ୍ତମ ଉପାୟ ଅଟେ। ସକାଳ କିମ୍ବା ସନ୍ଧ୍ୟାରେ ସିଞ୍ଚାଇ କରନ୍ତୁ ଏବଂ ମାଟି ଆର୍ଦ୍ରତା ଉପରେ ନଜର ରଖନ୍ତୁ।';
      } else if (language === 'urdu') {
        return 'ڈرپ ایریگیشن پانی بچانے کا بہترین طریقہ ہے۔ صبح یا شام کو سیراب کریں اور مٹی کی نمی کی نگرانی کریں۔';
      } else {
        return 'Drip irrigation is the most water-efficient method. Irrigate in morning or evening and monitor soil moisture levels.';
      }
    }
    
    // Crop selection and planting
    if (lowerMessage.includes('which crop') || lowerMessage.includes('what to plant') || lowerMessage.includes('seed') ||
        lowerMessage.includes('planting') || lowerMessage.includes('sowing') || lowerMessage.includes('variety')) {
      if (language === 'hindi') {
        return 'मौसम, मिट्टी और बाजार की मांग के अनुसार फसल चुनें। गुणवत्तावाले बीज प्रमाणित विक्रेताओं से खरीदें।';
      } else if (language === 'punjabi') {
        return 'ਮੌਸਮ, ਮਿੱਟੀ ਅਤੇ ਮਾਰਕੀਟ ਦੀ ਮੰਗ ਦੇ ਅਨੁਸਾਰ ਫਸਲ ਚੁਣੋ। ਗੁਣਵੱਤਾ ਵਾਲੇ ਬੀਜ ਪ੍ਰਮਾਣਿਤ ਵੇਂਡਰਾਂ ਤੋਂ ਖਰੀਦੋ।';
      } else if (language === 'odia') {
        return 'ପାଣିପାଗ, ମାଟି ଏବଂ ବଜାର ମାଗ ଅନୁଯାୟୀ ଫସଲ ବାଛନ୍ତୁ। ଗୁଣବତ୍ତାପୂର୍ଣ୍ଣ ବିହନ ପ୍ରମାଣିତ ବିକ୍ରେତାଙ୍କଠାରୁ କିଣନ୍ତୁ।';
      } else if (language === 'urdu') {
        return 'موسم، مٹی اور مارکیٹ کی مطابق فصل چنیں۔ معیاری بیج تصدیق شدہ فروختندگان سے خریدیں۔';
      } else {
        return 'Choose crops based on season, soil type, and market demand. Buy quality seeds from certified dealers.';
      }
    }
    
    // Farm equipment and machinery
    if (lowerMessage.includes('tractor') || lowerMessage.includes('equipment') || lowerMessage.includes('machine') ||
        lowerMessage.includes('tool') || lowerMessage.includes('mechanization') || lowerMessage.includes('technology')) {
      if (language === 'hindi') {
        return 'छोटी जोत वाले किसानों के लिए साझा उपकरण लाभदायक है। नियमित रखरखाव से मशीनों का जीवन बढ़ता है।';
      } else if (language === 'punjabi') {
        return 'ਛੋਟੀ ਜ਼ਮੀਨ ਵਾਲੇ ਕਿਸਾਨਾਂ ਲਈ ਸਾਂਝੇ ਔਜ਼ਾਰ ਫਾਇਦੇਮੰਦ ਹਨ। ਨਿਯਮਿਤ ਰਖ-ਰਖਾਅ ਨਾਲ ਮਸ਼ੀਨਾਂ ਦੀ ਉਮਰ ਵਧਦੀ ਹੈ।';
      } else if (language === 'odia') {
        return 'ଛୋଟ ଜମି ଥିବା ଚାଷୀମାନଙ୍କ ପାଇଁ ସାଧାରଣ ଉପକରଣ ଲାଭଦାୟକ। ନିୟମିତ ରକ୍ଷଣାବେକ୍ଷଣରେ ଯନ୍ତ୍ରର ଆୟୁ ବଢ଼ିଥାଏ।';
      } else if (language === 'urdu') {
        return 'چھوٹی زمین والے کسانوں کے لیے مشترکہ آلات مفید ہیں۔ باقاعدہ دیکھ بھال سے مشینوں کی عمر بڑھ جاتی ہے۔';
      } else {
        return 'Shared equipment is beneficial for small farmers. Regular maintenance increases machinery life and efficiency.';
      }
    }
    
    // Market prices and selling
    if (lowerMessage.includes('price') || lowerMessage.includes('market') || lowerMessage.includes('sell') ||
        lowerMessage.includes('profit') || lowerMessage.includes('income') || lowerMessage.includes('mandi')) {
      if (language === 'hindi') {
        return 'बाजार की कीमतों की निगरानी करें और उचित समय पर फसल बेचें। सहकारी समितियों से बेहतर दाम मिल सकते हैं।';
      } else if (language === 'punjabi') {
        return 'ਮਾਰਕੀਟ ਦੀਆਂ ਕੀਮਤਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ ਅਤੇ ਸਹੀ ਸਮੇਂ ਤੇ ਫਸਲ ਵੇਚੋ। ਸਹਿਕਾਰੀ ਸਭਾਵਾਂ ਤੋਂ ਵਧੀਆ ਭਾਅ ਮਿਲ ਸਕਦਾ ਹੈ।';
      } else if (language === 'odia') {
        return 'ବଜାର ମୂଲ୍ୟ ଉପରେ ନଜର ରଖନ୍ତୁ ଏବଂ ଉପଯୁକ୍ତ ସମୟରେ ଫସଲ ବିକ୍ରି କରନ୍ତୁ। ସହକାରୀ ସମିତିରୁ ଉତ୍ତମ ମୂଲ୍ୟ ମିଳିପାରେ।';
      } else if (language === 'urdu') {
        return 'مارکیٹ کی قیمتوں کی نگرانی کریں اور مناسب وقت پر فصل بیچیں۔ تعاونی سوسائٹی سے بہترین قیمت مل سکتی ہے۔';
      } else {
        return 'Monitor market prices and sell at the right time. Cooperative societies can help get better prices for your produce.';
      }
    }
    
    // Government schemes and subsidies
    if (lowerMessage.includes('scheme') || lowerMessage.includes('subsidy') || lowerMessage.includes('government') ||
        lowerMessage.includes('loan') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
      if (language === 'hindi') {
        return 'कृषि सरकारी योजनाओं के लिए आधिकारिक पोर्टल पर रजिस्टर करें। PM-KISAN, क्रेडिट कार्ड और बीमा योजनाएं उपलब्ध हैं।';
      } else if (language === 'punjabi') {
        return 'ਖੇਤੀ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲਈ ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਤੇ ਰਜਿਸਟਰ ਕਰੋ। PM-KISAN, ਕ੍ਰੈਡਿਟ ਕਾਰਡ ਅਤੇ ਬੀਮਾ ਸਕੀਮਾਂ ਉਪਲਬਧ ਹਨ।';
      } else if (language === 'odia') {
        return 'କୃଷି ସରକାରୀ ଯୋଜନା ପାଇଁ ଅଫିସିଆଲ୍ ପୋର୍ଟାଲରେ ପଞ୍ଜୀକରଣ କରନ୍ତୁ। PM-KISAN, କ୍ରେଡିଟ୍ କାର୍ଡ ଏବଂ ବୀମା ଯୋଜନା ଉପଲବ୍ଧ।';
      } else if (language === 'urdu') {
        return 'کھیتی سرکاری اسکیموں کے لیے آفیشل پورٹل پر رجسٹر کریں۔ PM-KISAN، کریڈٹ کارڈ اور انشورنس اسکیمیں دستیاب ہیں۔';
      } else {
        return 'Register on official portals for agricultural government schemes. PM-KISAN, credit card, and insurance schemes are available.';
      }
    }

    // Default response
    if (language === 'hindi') {
      return 'मैं आपकी खेती मदद कर सकता हूं! मैं जलवायु, कटाई, फसल रोटेशन और मिट्टी स्वास्थ्य में सहायता कर सकता हूं। आप किस विषय पर मदद चाहते हैं?';
    } else if (language === 'punjabi') {
      return 'ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ! ਮੈਂ ਮੌਸਮ, ਵਾਢੀ, ਫਸਲ ਰੋਟੇਸ਼ਨ ਅਤੇ ਮਿੱਟੀ ਸਿਹਾਇਆ ਵਿੱਚ ਸਹਾਇਕ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਕਿਸ ਵਿਸ਼ੇ ਤੇ ਮਦਦ ਚਾਹੁੰਦੇ ਹੋ?'
    } else if (language === 'odia') {
      return 'ମୁଁ ଆପଣଙ୍କର ଚାଷ ସହାୟତା କରିପାରେ! ମୁଁ ଜଳବାୟୁ, କଟାଇବା ସମୟ, ଫସଲ ଚକ୍ର ଏବଂ ମାଟି ପରିଚାଳନାରେ ସାହାଯ୍ୟ କରିପାରେ। ଆପଣ କେଉଁ ନିର୍ଦ୍ଦିଷ୍ଟ ଦିଗରେ ସାହାଯ୍ୟ ଚାହୁଁଛନ୍ତି?'
    } else if (language === 'urdu') {
      return 'میں آپ کی کھیتی میں مدد کر سکتا ہوں! میں موسمی بصیرت، کٹائی کا وقت، فصل کی روٹیشن اور مٹی کے انتظام میں مدد کر سکتا ہوں۔ آپ کس خاص پہلو میں مدد چاہتے ہیں؟'
    } else {
      return "I'm here to help with farming guidance! I can assist with climate insights, harvesting timing, crop rotation, and soil management. What specific aspect would you like help with?";
    }
  };

  // Text-to-speech function with language support
  const speakText = (text: string, lang: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language codes to speech synthesis language codes
    const languageMap: { [key: string]: string } = {
      'english': 'en-US',
      'hindi': 'hi-IN',
      'punjabi': 'pa-IN',
      'tamil': 'ta-IN',
      'telugu': 'te-IN',
      'kannada': 'kn-IN',
      'malayalam': 'ml-IN',
      'marathi': 'mr-IN',
      'gujarati': 'gu-IN',
      'bengali': 'bn-IN',
      'odia': 'or-IN',
      'urdu': 'ur-IN'
    };

    utterance.lang = languageMap[lang] || 'en-US';
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get available voices and try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(languageMap[lang]?.split('-')[0] || 'en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Load voices when they become available
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Speech recognition function
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Map language codes to speech recognition language codes
    const languageMap: { [key: string]: string } = {
      'english': 'en-US',
      'hindi': 'hi-IN',
      'punjabi': 'pa-IN',
      'tamil': 'ta-IN',
      'telugu': 'te-IN',
      'kannada': 'kn-IN',
      'malayalam': 'ml-IN',
      'marathi': 'mr-IN',
      'gujarati': 'gu-IN',
      'bengali': 'bn-IN',
      'odia': 'or-IN',
      'urdu': 'ur-IN'
    };

    recognition.lang = languageMap[language] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInputValue(finalTranscript);
        setIsListening(false);
        // Auto-send the message when speech is done
        setTimeout(() => {
          if (finalTranscript.trim()) {
            setInputValue(finalTranscript);
            sendMessageWithText(finalTranscript);
          }
        }, 500);
      } else if (interimTranscript) {
        setInputValue(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        setInputValue('');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const sendMessageWithText = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponseText = generateBotResponse(text);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Speak the bot response
      speakText(botResponseText, language);
    }, 1500);
  };

  const sendMessage = () => {
    sendMessageWithText(inputValue);
  };

  const handleTipClick = (tip: FarmingTip) => {
    const tipMessage: Message = {
      id: Date.now().toString(),
      text: `Tell me more about ${tip.title.toLowerCase()}`,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, tipMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: tip.description,
        sender: 'bot',
        timestamp: new Date(),
        category: tip.category
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Speak the tip response
      speakText(tip.description, language);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center group"
      >
        <Bot className="w-6 h-6 group-hover:animate-pulse" />
        <span className="absolute -top-8 -right-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          {t('chatbot_helper')}
        </span>
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'} bg-background/95 dark:bg-card/95 rounded-3xl shadow-2xl border border-border backdrop-blur-md transition-all duration-300`}>
      {/* Header */}
      <div className="bg-primary text-white p-4 rounded-t-[1.5rem] flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-white" />
          <span className="font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t('chatbot_title')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`text-white hover:bg-white/10 p-1.5 rounded-xl ${!isVoiceEnabled ? 'opacity-50' : ''}`}
            title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-white/10 p-1.5 rounded-xl"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/10 p-1.5 rounded-xl"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Quick Tips */}
          <div className="p-4 border-b border-border bg-primary/5">
            <h4 className="font-bold text-foreground text-xs uppercase tracking-widest mb-3">{t('quick_farming_tips')}</h4>
            <div className="flex flex-wrap gap-2">
              {farmingTips.map((tip) => (
                <Button
                  key={tip.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTipClick(tip)}
                  className="rounded-xl border-primary/20 bg-background/50 hover:bg-primary/5 hover:border-primary/40 text-xs py-1 h-auto transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <span className="opacity-80 scale-75">{tip.icon}</span>
                    <span className="font-semibold text-muted-foreground">{tip.title}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.9] dark:opacity-[0.8] mix-blend-overlay">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-white dark:bg-card border border-border text-foreground rounded-tl-none'
                  }`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex items-center space-x-2 mb-2 opacity-80">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">{t('chatbot_title')}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed font-medium">{message.text}</p>
                  <p className={`text-[9px] mt-2 font-bold uppercase tracking-wider ${message.sender === 'user' ? 'text-white/60' : 'text-muted-foreground/60'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{t('farm_assistant_typing')}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('ask_about_farming')}
                  className="rounded-2xl border-border bg-primary/5 focus-visible:ring-primary h-12 pr-12 text-sm font-medium"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant="ghost"
                  size="icon"
                  className={`absolute right-1 top-1 w-10 h-10 rounded-xl transition-all ${isListening ? 'bg-accent/10 text-accent animate-pulse' : 'text-muted-foreground hover:bg-primary/10'}`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim()}
                className="w-12 h-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            {isListening && (
              <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-accent flex items-center justify-center space-x-2 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                <span>Listening... Speak your crop query</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
