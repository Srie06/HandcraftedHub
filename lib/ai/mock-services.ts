/**
 * Mock AI Services for WhatsApp Seller Integration
 * 
 * These services simulate AI processing for:
 * - Audio transcription with language detection
 * - Translation to multiple Indian languages
 * - Product generation from transcriptions and images
 */

// Supported languages configuration
export const SUPPORTED_LANGUAGES = {
  en: { name: "English", nativeName: "English", rtl: false },
  hi: { name: "Hindi", nativeName: "हिंदी", rtl: false },
  ta: { name: "Tamil", nativeName: "தமிழ்", rtl: false },
  te: { name: "Telugu", nativeName: "తెలుగు", rtl: false },
  bn: { name: "Bengali", nativeName: "বাংলা", rtl: false },
  mr: { name: "Marathi", nativeName: "मराठी", rtl: false },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી", rtl: false },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", rtl: false },
  ml: { name: "Malayalam", nativeName: "മലയാളം", rtl: false },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", rtl: false },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Type definitions
export interface TranscriptionResult {
  text: string;
  language: LanguageCode;
  confidence: number;
}

export interface TranslationResult {
  [languageCode: string]: string;
}

export interface ProductGeneration {
  title: { [lang: string]: string };
  description: { [lang: string]: string };
  category: string;
  subcategory?: string;
  tags: string[];
  suggestedPrice?: number;
  materials: string[];
  techniques: string[];
  region?: string;
  confidence: number;
}

// Sample transcriptions in different languages
const SAMPLE_TRANSCRIPTIONS: Record<LanguageCode, string[]> = {
  en: [
    "This is a beautiful handcrafted pottery vase made with traditional techniques",
    "Handwoven cotton saree with intricate border designs from our village",
    "Traditional bamboo basket crafted using age-old weaving methods",
  ],
  hi: [
    "यह पारंपरिक तकनीक से बनाया गया सुंदर मिट्टी का बर्तन है",
    "हमारे गांव की हाथ से बुनी हुई कपास की साड़ी जटिल बॉर्डर डिजाइन के साथ",
    "पुरानी बुनाई विधियों का उपयोग करके बनाई गई पारंपरिक बांस की टोकरी",
  ],
  ta: [
    "இது பாரம்பரிய நுட்பங்களைப் பயன்படுத்தி செய்யப்பட்ட அழகான கைவினை மண்பாண்ட குவளை",
    "எங்கள் கிராமத்தில் இருந்து சிக்கலான எல்லை வடிவமைப்புகளுடன் கைத்தறி பருத்தி புடவை",
    "பழமையான நெசவு முறைகளைப் பயன்படுத்தி வடிவமைக்கப்பட்ட பாரம்பரிய மூங்கில் கூடை",
  ],
  te: [
    "ఇది సాంప్రదాయ పద్ధతులతో తయారు చేయబడిన అందమైన చేతితో తయారు చేసిన కుండల వాసే",
    "మా గ్రామం నుండి సంక్లిష్టమైన సరిహద్దు డిజైన్లతో చేతితో నేసిన పత్తి చీర",
    "పురాతన నేత పద్ధతులను ఉపయోగించి రూపొందించబడిన సాంప్రదాయ వెదురు బుట్ట",
  ],
  bn: [
    "এটি ঐতিহ্যবাহী কৌশল ব্যবহার করে তৈরি একটি সুন্দর হস্তনির্মিত মৃৎশিল্প ফুলদানি",
    "আমাদের গ্রাম থেকে জটিল সীমানা ডিজাইন সহ হাতে বোনা সুতির শাড়ি",
    "প্রাচীন বুনন পদ্ধতি ব্যবহার করে তৈরি ঐতিহ্যবাহী বাঁশের ঝুড়ি",
  ],
  mr: [
    "पारंपारिक तंत्राचा वापर करून बनवलेली ही एक सुंदर हस्तकला मातीची फुलदाणी आहे",
    "आमच्या गावातून गुंतागुंतीच्या बॉर्डर डिझाइनसह हाताने विणलेली कापसाची साडी",
    "जुन्या विणकाम पद्धती वापरून तयार केलेली पारंपारिक बांबूची टोपली",
  ],
  gu: [
    "આ પરંપરાગત તકનીકોનો ઉપયોગ કરીને બનાવેલ સુંદર હસ્તકલા માટીનો ફૂલદાની છે",
    "અમારા ગામમાંથી જટિલ બોર્ડર ડિઝાઇન સાથે હાથથી વણેલી કપાસની સાડી",
    "જૂની વણાટ પદ્ધતિઓનો ઉપયોગ કરીને બનાવેલી પરંપરાગત વાંસની ટોપલી",
  ],
  kn: [
    "ಇದು ಸಾಂಪ್ರದಾಯಿಕ ತಂತ್ರಗಳನ್ನು ಬಳಸಿ ತಯಾರಿಸಿದ ಸುಂದರವಾದ ಕೈಯಿಂದ ತಯಾರಿಸಿದ ಕುಂಬಾರಿಕೆ ಹೂದಾನಿ",
    "ನಮ್ಮ ಹಳ್ಳಿಯಿಂದ ಸಂಕೀರ್ಣ ಗಡಿ ವಿನ್ಯಾಸಗಳೊಂದಿಗೆ ಕೈಯಿಂದ ನೇಯ್ದ ಹತ್ತಿ ಸೀರೆ",
    "ಪುರಾತನ ನೇಯ್ಗೆ ವಿಧಾನಗಳನ್ನು ಬಳಸಿ ರಚಿಸಲಾದ ಸಾಂಪ್ರದಾಯಿಕ ಬಿದಿರು ಬುಟ್ಟಿ",
  ],
  ml: [
    "പരമ്പരാഗത സാങ്കേതികവിദ്യകൾ ഉപയോഗിച്ച് നിർമ്മിച്ച മനോഹരമായ കൈകൊണ്ട് നിർമ്മിച്ച മൺപാത്ര പാത്രം",
    "ഞങ്ങളുടെ ഗ്രാമത്തിൽ നിന്ന് സങ്കീർണ്ണമായ അതിർത്തി രൂപകൽപ്പനകളോടുകൂടിയ കൈയിൽ നെയ്ത പരുത്തി സാരി",
    "പഴയ നെയ്ത്ത് രീതികൾ ഉപയോഗിച്ച് നിർമ്മിച്ച പരമ്പരാഗത മുള കൊട്ട",
  ],
  pa: [
    "ਇਹ ਰਵਾਇਤੀ ਤਕਨੀਕਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਬਣਾਇਆ ਗਿਆ ਇੱਕ ਸੁੰਦਰ ਹੱਥ ਨਾਲ ਬਣਿਆ ਮਿੱਟੀ ਦਾ ਫੁੱਲਦਾਨ ਹੈ",
    "ਸਾਡੇ ਪਿੰਡ ਤੋਂ ਗੁੰਝਲਦਾਰ ਬਾਰਡਰ ਡਿਜ਼ਾਈਨਾਂ ਨਾਲ ਹੱਥ ਨਾਲ ਬੁਣੀ ਹੋਈ ਕਪਾਹ ਦੀ ਸਾੜੀ",
    "ਪੁਰਾਣੀਆਂ ਬੁਣਾਈ ਵਿਧੀਆਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਤਿਆਰ ਕੀਤੀ ਗਈ ਰਵਾਇਤੀ ਬਾਂਸ ਦੀ ਟੋਕਰੀ",
  ],
};

// Craft-related keywords for category detection
const CRAFT_KEYWORDS = {
  pottery: ["pottery", "clay", "ceramic", "vase", "pot", "मिट्टी", "मृत्", "மண்", "కుండ", "মৃৎ"],
  textiles: ["saree", "fabric", "weave", "cotton", "silk", "साड़ी", "कपड़ा", "புடவை", "చీర", "শাড়ি"],
  bamboo: ["bamboo", "basket", "cane", "बांस", "टोकरी", "மூங்கில்", "వెదురు", "বাঁশ"],
  jewelry: ["jewelry", "necklace", "earring", "ornament", "आभूषण", "நகை", "ఆభరణ", "গহনা"],
  woodwork: ["wood", "carving", "furniture", "लकड़ी", "மர", "చెక్క", "কাঠ"],
  metalwork: ["metal", "brass", "copper", "bronze", "धातु", "உலோக", "లోహ", "ধাতু"],
};

// Indian regions
const REGIONS = [
  "Rajasthan", "Gujarat", "Tamil Nadu", "Kerala", "West Bengal",
  "Maharashtra", "Karnataka", "Andhra Pradesh", "Punjab", "Uttar Pradesh"
];

/**
 * Mock Audio Transcription Service
 * Simulates speech-to-text with language detection
 * Requirements: 2.1
 */
export async function mockTranscribeAudio(
  audioUrl: string
): Promise<TranscriptionResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Randomly select a language (weighted towards Hindi and English)
  const languages: LanguageCode[] = ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn", "ml", "pa"];
  const weights = [0.25, 0.25, 0.1, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05];
  
  let random = Math.random();
  let selectedLanguage: LanguageCode = "hi";
  
  for (let i = 0; i < languages.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedLanguage = languages[i];
      break;
    }
  }

  // Get a random transcription for the selected language
  const transcriptions = SAMPLE_TRANSCRIPTIONS[selectedLanguage];
  const text = transcriptions[Math.floor(Math.random() * transcriptions.length)];

  // Generate confidence score (higher for common languages)
  const baseConfidence = selectedLanguage === "en" || selectedLanguage === "hi" ? 0.92 : 0.85;
  const confidence = baseConfidence + Math.random() * 0.08;

  return {
    text,
    language: selectedLanguage,
    confidence: Math.min(confidence, 0.99),
  };
}

/**
 * Mock Translation Service
 * Generates translations for all supported languages
 * Requirements: 2.2, 2.3
 */
export async function mockTranslate(
  text: string,
  sourceLanguage: LanguageCode,
  targetLanguages: LanguageCode[]
): Promise<TranslationResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

  const translations: TranslationResult = {};

  // Common craft terms translations
  const craftTerms: Record<string, Record<LanguageCode, string>> = {
    "handcrafted": {
      en: "handcrafted", hi: "हस्तनिर्मित", ta: "கைவினை", te: "చేతితో తయారు",
      bn: "হস্তনির্মিত", mr: "हस्तकला", gu: "હસ્તકલા", kn: "ಕೈಯಿಂದ ತಯಾರಿಸಿದ",
      ml: "കൈകൊണ്ട് നിർമ്മിച്ച", pa: "ਹੱਥ ਨਾਲ ਬਣਿਆ"
    },
    "traditional": {
      en: "traditional", hi: "पारंपरिक", ta: "பாரம்பரிய", te: "సాంప్రదాయ",
      bn: "ঐতিহ্যবাহী", mr: "पारंपारिक", gu: "પરંપરાગત", kn: "ಸಾಂಪ್ರದಾಯಿಕ",
      ml: "പരമ്പരാഗത", pa: "ਰਵਾਇਤੀ"
    },
    "beautiful": {
      en: "beautiful", hi: "सुंदर", ta: "அழகான", te: "అందమైన",
      bn: "সুন্দর", mr: "सुंदर", gu: "સુંદર", kn: "ಸುಂದರವಾದ",
      ml: "മനോഹരമായ", pa: "ਸੁੰਦਰ"
    },
  };

  for (const targetLang of targetLanguages) {
    if (targetLang === sourceLanguage) {
      translations[targetLang] = text;
      continue;
    }

    // Use sample translations if available
    const samples = SAMPLE_TRANSCRIPTIONS[targetLang];
    if (samples && samples.length > 0) {
      translations[targetLang] = samples[Math.floor(Math.random() * samples.length)];
    } else {
      // Fallback to English
      translations[targetLang] = SAMPLE_TRANSCRIPTIONS.en[0];
    }
  }

  return translations;
}

/**
 * Mock Product Generation Service
 * Generates product details from transcription and images
 * Requirements: 2.4, 2.5, 2.6
 */
export async function mockGenerateProduct(
  transcription: string,
  transcriptionLanguage: LanguageCode,
  imageUrls: string[]
): Promise<ProductGeneration> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Detect category from transcription
  let detectedCategory = "Other Crafts";
  let detectedSubcategory: string | undefined;
  const lowerText = transcription.toLowerCase();

  for (const [category, keywords] of Object.entries(CRAFT_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      detectedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      break;
    }
  }

  // Map to proper category names
  const categoryMap: Record<string, { main: string; sub?: string }> = {
    "Pottery": { main: "Home Decor", sub: "Pottery & Ceramics" },
    "Textiles": { main: "Textiles", sub: "Sarees & Fabrics" },
    "Bamboo": { main: "Home Decor", sub: "Bamboo Crafts" },
    "Jewelry": { main: "Jewelry", sub: "Traditional Jewelry" },
    "Woodwork": { main: "Home Decor", sub: "Wood Crafts" },
    "Metalwork": { main: "Home Decor", sub: "Metal Crafts" },
  };

  const categoryInfo = categoryMap[detectedCategory] || { main: "Other Crafts" };

  // Generate titles in all languages
  const titleTemplates: Record<LanguageCode, string[]> = {
    en: ["Handcrafted {item}", "Traditional {item}", "Artisan {item}", "Beautiful {item}"],
    hi: ["हस्तनिर्मित {item}", "पारंपरिक {item}", "कारीगर {item}", "सुंदर {item}"],
    ta: ["கைவினை {item}", "பாரம்பரிய {item}", "கலைஞர் {item}", "அழகான {item}"],
    te: ["చేతితో తయారు {item}", "సాంప్రదాయ {item}", "కళాకారుడు {item}", "అందమైన {item}"],
    bn: ["হস্তনির্মিত {item}", "ঐতিহ্যবাহী {item}", "কারিগর {item}", "সুন্দর {item}"],
    mr: ["हस्तकला {item}", "पारंपारिक {item}", "कारागीर {item}", "सुंदर {item}"],
    gu: ["હસ્તકલા {item}", "પરંપરાગત {item}", "કારીગર {item}", "સુંદર {item}"],
    kn: ["ಕೈಯಿಂದ ತಯಾರಿಸಿದ {item}", "ಸಾಂಪ್ರದಾಯಿಕ {item}", "ಕುಶಲಕರ್ಮಿ {item}", "ಸುಂದರವಾದ {item}"],
    ml: ["കൈകൊണ്ട് നിർമ്മിച്ച {item}", "പരമ്പരാഗത {item}", "കരകൗശല {item}", "മനോഹരമായ {item}"],
    pa: ["ਹੱਥ ਨਾਲ ਬਣਿਆ {item}", "ਰਵਾਇਤੀ {item}", "ਕਾਰੀਗਰ {item}", "ਸੁੰਦਰ {item}"],
  };

  const itemNames: Record<LanguageCode, Record<string, string>> = {
    en: { "Pottery": "Pottery Vase", "Textiles": "Cotton Saree", "Bamboo": "Bamboo Basket" },
    hi: { "Pottery": "मिट्टी का फूलदान", "Textiles": "कपास की साड़ी", "Bamboo": "बांस की टोकरी" },
    ta: { "Pottery": "மண்பாண்ட குவளை", "Textiles": "பருத்தி புடவை", "Bamboo": "மூங்கில் கூடை" },
    te: { "Pottery": "కుండల వాసే", "Textiles": "పత్తి చీర", "Bamboo": "వెదురు బుట్ట" },
    bn: { "Pottery": "মৃৎশিল্প ফুলদানি", "Textiles": "সুতির শাড়ি", "Bamboo": "বাঁশের ঝুড়ি" },
    mr: { "Pottery": "मातीची फुलदाणी", "Textiles": "कापसाची साडी", "Bamboo": "बांबूची टोपली" },
    gu: { "Pottery": "માટીનો ફૂલદાની", "Textiles": "કપાસની સાડી", "Bamboo": "વાંસની ટોપલી" },
    kn: { "Pottery": "ಕುಂಬಾರಿಕೆ ಹೂದಾನಿ", "Textiles": "ಹತ್ತಿ ಸೀರೆ", "Bamboo": "ಬಿದಿರು ಬುಟ್ಟಿ" },
    ml: { "Pottery": "മൺപാത്ര പാത്രം", "Textiles": "പരുത്തി സാരി", "Bamboo": "മുള കൊട്ട" },
    pa: { "Pottery": "ਮਿੱਟੀ ਦਾ ਫੁੱਲਦਾਨ", "Textiles": "ਕਪਾਹ ਦੀ ਸਾੜੀ", "Bamboo": "ਬਾਂਸ ਦੀ ਟੋਕਰੀ" },
  };

  const titles: Record<string, string> = {};
  const descriptions: Record<string, string> = {};

  for (const lang of Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]) {
    const templates = titleTemplates[lang];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const itemName = itemNames[lang][detectedCategory] || itemNames[lang]["Pottery"] || "Item";
    titles[lang] = template.replace("{item}", itemName);

    // Generate description
    descriptions[lang] = SAMPLE_TRANSCRIPTIONS[lang][0];
  }

  // Generate tags
  const tags: string[] = [];
  tags.push(detectedCategory.toLowerCase());
  tags.push("handcrafted");
  tags.push("traditional");
  
  // Add random region
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  tags.push(region.toLowerCase().replace(/\s+/g, "-"));

  // Generate materials based on category
  const materials: string[] = [];
  if (detectedCategory === "Pottery") {
    materials.push("clay", "ceramic");
  } else if (detectedCategory === "Textiles") {
    materials.push("cotton", "silk");
  } else if (detectedCategory === "Bamboo") {
    materials.push("bamboo", "cane");
  } else {
    materials.push("natural materials");
  }

  // Generate techniques
  const techniques = ["handmade", "traditional craftsmanship", "artisan technique"];

  // Generate suggested price (in INR)
  const priceRanges: Record<string, [number, number]> = {
    "Pottery": [500, 2000],
    "Textiles": [1500, 5000],
    "Bamboo": [300, 1500],
    "Jewelry": [1000, 10000],
    "Woodwork": [800, 3000],
    "Metalwork": [1200, 4000],
  };

  const [minPrice, maxPrice] = priceRanges[detectedCategory] || [500, 2000];
  const suggestedPrice = Math.floor(minPrice + Math.random() * (maxPrice - minPrice));

  // Calculate confidence based on various factors
  const hasMultipleImages = imageUrls.length >= 2;
  const transcriptionLength = transcription.length;
  const baseConfidence = 0.75;
  const imageBonus = hasMultipleImages ? 0.1 : 0.05;
  const lengthBonus = transcriptionLength > 50 ? 0.1 : 0.05;
  
  const confidence = Math.min(baseConfidence + imageBonus + lengthBonus + Math.random() * 0.05, 0.95);

  return {
    title: titles,
    description: descriptions,
    category: categoryInfo.main,
    subcategory: categoryInfo.sub,
    tags,
    suggestedPrice,
    materials,
    techniques,
    region,
    confidence,
  };
}
