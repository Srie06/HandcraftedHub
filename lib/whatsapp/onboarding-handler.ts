/**
 * WhatsApp Artisan Onboarding Handler
 * Handles first-time user detection, welcome messages, and conversational onboarding
 */

import { sendTextMessage } from './message-sender';
import { getDocument, createDocument, updateDocument } from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';

/**
 * Onboarding state for an artisan
 */
export type OnboardingStep = 
  | 'welcome'
  | 'collecting_name'
  | 'collecting_location'
  | 'collecting_craft_type'
  | 'completed';

/**
 * Artisan onboarding data
 */
export interface ArtisanOnboarding {
  id: string;
  phone: string;
  step: OnboardingStep;
  data: {
    name?: string;
    location?: string;
    craftType?: string;
  };
  detectedLanguage: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  sellerId?: string;
}

const COLLECTION_NAME = 'artisanOnboarding';

/**
 * Welcome messages in all supported languages
 */
const WELCOME_MESSAGES = {
  en: `🙏 Welcome to HandcraftedHub!

I'm here to help you sell your beautiful handcrafted products.

To get started, I need to know a few things about you.

What is your name?`,

  hi: `🙏 हैंडक्राफ्टेड हब में आपका स्वागत है!

मैं आपके सुंदर हस्तनिर्मित उत्पादों को बेचने में आपकी मदद करने के लिए यहां हूं।

शुरू करने के लिए, मुझे आपके बारे में कुछ बातें जाननी होंगी।

आपका नाम क्या है?`,

  ta: `🙏 ஹேண்ட்கிராஃப்டட் ஹப்பிற்கு வரவேற்கிறோம்!

உங்கள் அழகான கைவினைப் பொருட்களை விற்க நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன்.

தொடங்க, உங்களைப் பற்றி சில விஷயங்களை நான் தெரிந்து கொள்ள வேண்டும்.

உங்கள் பெயர் என்ன?`,

  te: `🙏 హ్యాండ్‌క్రాఫ్టెడ్ హబ్‌కు స్వాగతం!

మీ అందమైన చేతితో తయారు చేసిన ఉత్పత్తులను విక్రయించడంలో మీకు సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను.

ప్రారంభించడానికి, మీ గురించి కొన్ని విషయాలు తెలుసుకోవాలి.

మీ పేరు ఏమిటి?`,

  bn: `🙏 হ্যান্ডক্রাফটেড হাবে স্বাগতম!

আপনার সুন্দর হস্তনির্মিত পণ্য বিক্রয় করতে আমি আপনাকে সাহায্য করতে এখানে আছি।

শুরু করতে, আমাকে আপনার সম্পর্কে কিছু জিনিস জানতে হবে।

আপনার নাম কি?`,

  mr: `🙏 हँडक्राफ्टेड हबमध्ये आपले स्वागत आहे!

तुमची सुंदर हस्तकला उत्पादने विकण्यात मदत करण्यासाठी मी येथे आहे।

सुरुवात करण्यासाठी, मला तुमच्याबद्दल काही गोष्टी जाणून घ्यायच्या आहेत।

तुमचे नाव काय आहे?`,

  gu: `🙏 હેન્ડક્રાફ્ટેડ હબમાં આપનું સ્વાગત છે!

તમારા સુંદર હસ્તકલા ઉત્પાદનો વેચવામાં મદદ કરવા માટે હું અહીં છું।

શરૂ કરવા માટે, મારે તમારા વિશે કેટલીક બાબતો જાણવાની જરૂર છે.

તમારું નામ શું છે?`,

  kn: `🙏 ಹ್ಯಾಂಡ್‌ಕ್ರಾಫ್ಟೆಡ್ ಹಬ್‌ಗೆ ಸ್ವಾಗತ!

ನಿಮ್ಮ ಸುಂದರ ಕೈಗಾರಿಕೆ ಉತ್ಪನ್ನಗಳನ್ನು ಮಾರಾಟ ಮಾಡಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ.

ಪ್ರಾರಂಭಿಸಲು, ನಿಮ್ಮ ಬಗ್ಗೆ ಕೆಲವು ವಿಷಯಗಳನ್ನು ತಿಳಿದುಕೊಳ್ಳಬೇಕು.

ನಿಮ್ಮ ಹೆಸರು ಏನು?`,

  ml: `🙏 ഹാൻഡ്ക്രാഫ്റ്റഡ് ഹബിലേക്ക് സ്വാഗതം!

നിങ്ങളുടെ മനോഹരമായ കരകൗശല ഉൽപ്പന്നങ്ങൾ വിൽക്കാൻ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്.

ആരംഭിക്കാൻ, നിങ്ങളെക്കുറിച്ച് ചില കാര്യങ്ങൾ അറിയേണ്ടതുണ്ട്.

നിങ്ങളുടെ പേര് എന്താണ്?`,

  pa: `🙏 ਹੈਂਡਕ੍ਰਾਫਟਡ ਹੱਬ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ!

ਮੈਂ ਤੁਹਾਡੇ ਸੁੰਦਰ ਹੱਥ ਨਾਲ ਬਣੇ ਉਤਪਾਦਾਂ ਨੂੰ ਵੇਚਣ ਵਿੱਚ ਤੁਹਾਡੀ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ।

ਸ਼ੁਰੂ ਕਰਨ ਲਈ, ਮੈਨੂੰ ਤੁਹਾਡੇ ਬਾਰੇ ਕੁਝ ਗੱਲਾਂ ਜਾਣਨ ਦੀ ਲੋੜ ਹੈ।

ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?`,
};

/**
 * Check if a phone number is a first-time user
 * @param phone - Artisan's phone number
 * @returns True if first-time user
 */
export async function isFirstTimeUser(phone: string): Promise<boolean> {
  try {
    // Check if user has an existing seller account
    const { queryDocuments, where } = await import('../firebase/firestore');
    const sellers = await queryDocuments('users', where('phone', '==', phone), where('role', '==', 'seller'));
    
    if (sellers.length > 0) {
      return false;
    }

    // Check if user has an active or completed onboarding
    const onboardings = await queryDocuments(
      COLLECTION_NAME,
      where('phone', '==', phone)
    );

    // If they have a completed onboarding, they're not first-time
    const hasCompleted = onboardings.some(
      (ob: any) => ob.step === 'completed' && ob.sellerId
    );

    return !hasCompleted;
  } catch (error) {
    console.error('[Onboarding] Error checking first-time user:', error);
    // Default to true to be safe
    return true;
  }
}

/**
 * Get or create onboarding record for a phone number
 * @param phone - Artisan's phone number
 * @param detectedLanguage - Detected language code
 * @returns Onboarding record
 */
export async function getOrCreateOnboarding(
  phone: string,
  detectedLanguage: string = 'hi'
): Promise<ArtisanOnboarding> {
  try {
    // Check for existing active onboarding
    const { queryDocuments, where } = await import('../firebase/firestore');
    const onboardings = await queryDocuments(
      COLLECTION_NAME,
      where('phone', '==', phone),
      where('step', '!=', 'completed')
    );

    if (onboardings.length > 0) {
      return onboardings[0] as ArtisanOnboarding;
    }

    // Create new onboarding
    const onboardingData: Omit<ArtisanOnboarding, 'id'> = {
      phone,
      step: 'welcome',
      data: {},
      detectedLanguage,
      startedAt: Timestamp.now(),
    };

    const id = await createDocument(COLLECTION_NAME, onboardingData);

    return {
      id,
      ...onboardingData,
    };
  } catch (error: any) {
    console.error('[Onboarding] Error getting/creating onboarding:', error);
    throw new Error(error.message || 'Failed to get/create onboarding');
  }
}

/**
 * Send welcome message to first-time user
 * @param phone - Artisan's phone number
 * @param detectedLanguage - Detected language code (defaults to Hindi)
 */
export async function sendWelcomeMessage(
  phone: string,
  detectedLanguage: string = 'hi'
): Promise<void> {
  try {
    // Validate language code
    const languageCode = WELCOME_MESSAGES[detectedLanguage as keyof typeof WELCOME_MESSAGES]
      ? detectedLanguage
      : 'hi'; // Default to Hindi

    const welcomeMessage = WELCOME_MESSAGES[languageCode as keyof typeof WELCOME_MESSAGES];

    // Send welcome message
    await sendTextMessage(phone, welcomeMessage);

    // Create or update onboarding record
    const onboarding = await getOrCreateOnboarding(phone, languageCode);
    
    // Update step to collecting_name
    await updateDocument(COLLECTION_NAME, onboarding.id, {
      step: 'collecting_name',
    });

    console.log('[Onboarding] Welcome message sent to:', phone, 'in language:', languageCode);
  } catch (error) {
    console.error('[Onboarding] Error sending welcome message:', error);
    throw error;
  }
}

/**
 * Detect language from text message
 * Simple heuristic based on Unicode ranges
 * @param text - Text to analyze
 * @returns Detected language code
 */
export function detectLanguageFromText(text: string): string {
  // Hindi (Devanagari)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return 'ta';
  }
  // Telugu
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return 'te';
  }
  // Bengali
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'bn';
  }
  // Gujarati
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return 'gu';
  }
  // Kannada
  if (/[\u0C80-\u0CFF]/.test(text)) {
    return 'kn';
  }
  // Malayalam
  if (/[\u0D00-\u0D7F]/.test(text)) {
    return 'ml';
  }
  // Punjabi (Gurmukhi)
  if (/[\u0A00-\u0A7F]/.test(text)) {
    return 'pa';
  }
  // Marathi (also uses Devanagari, but check after Hindi)
  // For now, treat Devanagari as Hindi by default
  
  // Default to English
  return 'en';
}

/**
 * Prompts for collecting information in different languages
 */
const LOCATION_PROMPTS = {
  en: `Great to meet you, {name}! 👋

Where are you located? (City or region)`,
  hi: `आपसे मिलकर खुशी हुई, {name}! 👋

आप कहाँ स्थित हैं? (शहर या क्षेत्र)`,
  ta: `உங்களைச் சந்தித்ததில் மகிழ்ச்சி, {name}! 👋

நீங்கள் எங்கு இருக்கிறீர்கள்? (நகரம் அல்லது பகுதி)`,
  te: `మిమ్మల్ని కలవడం ఆనందంగా ఉంది, {name}! 👋

మీరు ఎక్కడ ఉన్నారు? (నగరం లేదా ప్రాంతం)`,
  bn: `আপনার সাথে দেখা করে ভালো লাগলো, {name}! 👋

আপনি কোথায় অবস্থিত? (শহর বা অঞ্চল)`,
  mr: `तुम्हाला भेटून आनंद झाला, {name}! 👋

तुम्ही कुठे आहात? (शहर किंवा प्रदेश)`,
  gu: `તમને મળીને આનંદ થયો, {name}! 👋

તમે ક્યાં સ્થિત છો? (શહેર અથવા પ્રદેશ)`,
  kn: `ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಲು ಸಂತೋಷವಾಗಿದೆ, {name}! 👋

ನೀವು ಎಲ್ಲಿ ಇದ್ದೀರಿ? (ನಗರ ಅಥವಾ ಪ್ರದೇಶ)`,
  ml: `നിങ്ങളെ കാണാൻ സന്തോഷം, {name}! 👋

നിങ്ങൾ എവിടെയാണ്? (നഗരം അല്ലെങ്കിൽ പ്രദേശം)`,
  pa: `ਤੁਹਾਨੂੰ ਮਿਲ ਕੇ ਖੁਸ਼ੀ ਹੋਈ, {name}! 👋

ਤੁਸੀਂ ਕਿੱਥੇ ਹੋ? (ਸ਼ਹਿਰ ਜਾਂ ਖੇਤਰ)`,
};

const CRAFT_TYPE_PROMPTS = {
  en: `Perfect! 📍

What type of crafts do you make?
(For example: pottery, textiles, jewelry, wood carving, etc.)`,
  hi: `बढ़िया! 📍

आप किस प्रकार की शिल्पकला बनाते हैं?
(उदाहरण के लिए: मिट्टी के बर्तन, वस्त्र, आभूषण, लकड़ी की नक्काशी, आदि)`,
  ta: `சரியாக! 📍

நீங்கள் என்ன வகையான கைவினைப் பொருட்களை உருவாக்குகிறீர்கள்?
(எடுத்துக்காட்டு: மண்பாண்டங்கள், துணிகள், நகைகள், மர செதுக்கல், போன்றவை)`,
  te: `పర్ఫెక్ట్! 📍

మీరు ఏ రకమైన చేతిపనులు చేస్తారు?
(ఉదాహరణకు: కుండలు, వస్త్రాలు, ఆభరణాలు, చెక్క చెక్కడం, మొదలైనవి)`,
  bn: `নিখুঁত! 📍

আপনি কি ধরনের কারুশিল্প তৈরি করেন?
(উদাহরণস্বরূপ: মৃৎশিল্প, বস্ত্র, গহনা, কাঠের খোদাই, ইত্যাদি)`,
  mr: `परफेक्ट! 📍

तुम्ही कोणत्या प्रकारची हस्तकला बनवता?
(उदाहरणार्थ: मातीची भांडी, वस्त्र, दागिने, लाकूड कोरीव काम, इ.)`,
  gu: `પરફેક્ટ! 📍

તમે કયા પ્રકારની હસ્તકલા બનાવો છો?
(ઉદાહરણ તરીકે: માટીકામ, કાપડ, દાગીના, લાકડાની કોતરણી, વગેરે)`,
  kn: `ಪರ್ಫೆಕ್ಟ್! 📍

ನೀವು ಯಾವ ರೀತಿಯ ಕರಕುಶಲ ತಯಾರಿಸುತ್ತೀರಿ?
(ಉದಾಹರಣೆಗೆ: ಕುಂಬಾರಿಕೆ, ಜವಳಿ, ಆಭರಣ, ಮರದ ಕೆತ್ತನೆ, ಇತ್ಯಾದಿ)`,
  ml: `പെർഫെക്റ്റ്! 📍

നിങ്ങൾ ഏത് തരത്തിലുള്ള കരകൗശലവസ്തുക്കൾ നിർമ്മിക്കുന്നു?
(ഉദാഹരണത്തിന്: മൺപാത്രങ്ങൾ, തുണിത്തരങ്ങൾ, ആഭരണങ്ങൾ, മരം കൊത്തുപണി, മുതലായവ)`,
  pa: `ਸੰਪੂਰਨ! 📍

ਤੁਸੀਂ ਕਿਸ ਕਿਸਮ ਦੇ ਸ਼ਿਲਪਕਾਰੀ ਬਣਾਉਂਦੇ ਹੋ?
(ਉਦਾਹਰਨ ਲਈ: ਮਿੱਟੀ ਦੇ ਭਾਂਡੇ, ਕੱਪੜੇ, ਗਹਿਣੇ, ਲੱਕੜ ਦੀ ਨੱਕਾਸ਼ੀ, ਆਦਿ)`,
};

/**
 * Process onboarding response based on current step
 * @param phone - Artisan's phone number
 * @param message - User's text message
 * @returns True if onboarding is complete
 */
export async function processOnboardingResponse(
  phone: string,
  message: string
): Promise<boolean> {
  try {
    // Get current onboarding state
    const { queryDocuments, where } = await import('../firebase/firestore');
    const onboardings = await queryDocuments(
      COLLECTION_NAME,
      where('phone', '==', phone),
      where('step', '!=', 'completed')
    );

    if (onboardings.length === 0) {
      console.log('[Onboarding] No active onboarding found for:', phone);
      return false;
    }

    const onboarding = onboardings[0] as ArtisanOnboarding;
    const lang = onboarding.detectedLanguage;

    switch (onboarding.step) {
      case 'collecting_name':
        return await handleNameCollection(onboarding, message, lang);
      
      case 'collecting_location':
        return await handleLocationCollection(onboarding, message, lang);
      
      case 'collecting_craft_type':
        return await handleCraftTypeCollection(onboarding, message, lang);
      
      default:
        console.log('[Onboarding] Unknown step:', onboarding.step);
        return false;
    }
  } catch (error) {
    console.error('[Onboarding] Error processing response:', error);
    return false;
  }
}

/**
 * Handle name collection step
 */
async function handleNameCollection(
  onboarding: ArtisanOnboarding,
  name: string,
  lang: string
): Promise<boolean> {
  try {
    // Update onboarding with name
    await updateDocument(COLLECTION_NAME, onboarding.id, {
      'data.name': name.trim(),
      step: 'collecting_location',
    });

    // Send location prompt
    const prompt = LOCATION_PROMPTS[lang as keyof typeof LOCATION_PROMPTS] || LOCATION_PROMPTS.en;
    const message = prompt.replace('{name}', name.trim());
    await sendTextMessage(onboarding.phone, message);

    return false;
  } catch (error) {
    console.error('[Onboarding] Error handling name collection:', error);
    throw error;
  }
}

/**
 * Handle location collection step
 */
async function handleLocationCollection(
  onboarding: ArtisanOnboarding,
  location: string,
  lang: string
): Promise<boolean> {
  try {
    // Update onboarding with location
    await updateDocument(COLLECTION_NAME, onboarding.id, {
      'data.location': location.trim(),
      step: 'collecting_craft_type',
    });

    // Send craft type prompt
    const prompt = CRAFT_TYPE_PROMPTS[lang as keyof typeof CRAFT_TYPE_PROMPTS] || CRAFT_TYPE_PROMPTS.en;
    await sendTextMessage(onboarding.phone, prompt);

    return false;
  } catch (error) {
    console.error('[Onboarding] Error handling location collection:', error);
    throw error;
  }
}

/**
 * Handle craft type collection step
 */
async function handleCraftTypeCollection(
  onboarding: ArtisanOnboarding,
  craftType: string,
  lang: string
): Promise<boolean> {
  try {
    // Update onboarding with craft type
    await updateDocument(COLLECTION_NAME, onboarding.id, {
      'data.craftType': craftType.trim(),
    });

    // Create seller account
    const sellerId = await createSellerAccount(onboarding, craftType.trim());

    // Mark onboarding as completed
    await updateDocument(COLLECTION_NAME, onboarding.id, {
      step: 'completed',
      completedAt: Timestamp.now(),
      sellerId,
    });

    // Send confirmation message
    await sendOnboardingConfirmation(onboarding.phone, onboarding.data.name || 'Artisan', lang);

    return true;
  } catch (error) {
    console.error('[Onboarding] Error handling craft type collection:', error);
    throw error;
  }
}

/**
 * Create seller account from onboarding data
 * @param onboarding - Onboarding record
 * @param craftType - Craft type
 * @returns Seller ID
 */
async function createSellerAccount(
  onboarding: ArtisanOnboarding,
  craftType: string
): Promise<string> {
  try {
    const { name, location } = onboarding.data;

    // Create a seller profile in users collection
    const sellerData = {
      email: `${onboarding.phone}@whatsapp.handcraftedhub.com`, // Placeholder email
      displayName: name || 'Artisan',
      role: 'seller',
      phone: onboarding.phone,
      shopName: `${name}'s ${craftType}`,
      shopDescription: `Handcrafted ${craftType} from ${location}`,
      location: location || 'India',
      profileComplete: true,
      onboardedViaWhatsApp: true,
      createdAt: Timestamp.now(),
    };

    const sellerId = await createDocument('users', sellerData);
    
    console.log('[Onboarding] Seller account created:', sellerId);
    
    return sellerId;
  } catch (error: any) {
    console.error('[Onboarding] Error creating seller account:', error);
    throw new Error(error.message || 'Failed to create seller account');
  }
}

/**
 * Confirmation messages in all supported languages
 */
const CONFIRMATION_MESSAGES = {
  en: `🎉 Congratulations, {name}!

Your seller account has been created successfully!

*How to list your products:*
1. Send 1-3 photos of your product 📸
2. Send a voice message or video describing it 🎤
3. I'll create a listing for you automatically!

*Simple commands:*
• HELP - Show help message
• STATUS - Check your listing status
• ORDERS - View your orders

Start by sending photos of your first product! 🚀`,

  hi: `🎉 बधाई हो, {name}!

आपका विक्रेता खाता सफलतापूर्वक बना दिया गया है!

*अपने उत्पादों को सूचीबद्ध करने का तरीका:*
1. अपने उत्पाद की 1-3 तस्वीरें भेजें 📸
2. इसका वर्णन करते हुए एक वॉयस मैसेज या वीडियो भेजें 🎤
3. मैं आपके लिए स्वचालित रूप से एक लिस्टिंग बना दूंगा!

*सरल कमांड:*
• HELP - सहायता संदेश दिखाएं
• STATUS - अपनी लिस्टिंग स्थिति जांचें
• ORDERS - अपने ऑर्डर देखें

अपने पहले उत्पाद की तस्वीरें भेजकर शुरू करें! 🚀`,

  ta: `🎉 வாழ்த்துக்கள், {name}!

உங்கள் விற்பனையாளர் கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!

*உங்கள் தயாரிப்புகளை பட்டியலிடுவது எப்படி:*
1. உங்கள் தயாரிப்பின் 1-3 புகைப்படங்களை அனுப்பவும் 📸
2. அதை விவரிக்கும் குரல் செய்தி அல்லது வீடியோவை அனுப்பவும் 🎤
3. நான் உங்களுக்காக தானாகவே ஒரு பட்டியலை உருவாக்குவேன்!

*எளிய கட்டளைகள்:*
• HELP - உதவி செய்தியைக் காட்டு
• STATUS - உங்கள் பட்டியல் நிலையைச் சரிபார்க்கவும்
• ORDERS - உங்கள் ஆர்டர்களைப் பார்க்கவும்

உங்கள் முதல் தயாரிப்பின் புகைப்படங்களை அனுப்புவதன் மூலம் தொடங்குங்கள்! 🚀`,

  te: `🎉 అభినందనలు, {name}!

మీ విక్రేత ఖాతా విజయవంతంగా సృష్టించబడింది!

*మీ ఉత్పత్తులను జాబితా చేయడం ఎలా:*
1. మీ ఉత్పత్తి యొక్క 1-3 ఫోటోలను పంపండి 📸
2. దానిని వివరించే వాయిస్ మెసేజ్ లేదా వీడియోను పంపండి 🎤
3. నేను మీ కోసం స్వయంచాలకంగా జాబితాను సృష్టిస్తాను!

*సాధారణ ఆదేశాలు:*
• HELP - సహాయ సందేశాన్ని చూపించు
• STATUS - మీ జాబితా స్థితిని తనిఖీ చేయండి
• ORDERS - మీ ఆర్డర్‌లను చూడండి

మీ మొదటి ఉత్పత్తి ఫోటోలను పంపడం ద్వారా ప్రారంభించండి! 🚀`,

  bn: `🎉 অভিনন্দন, {name}!

আপনার বিক্রেতা অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!

*আপনার পণ্য তালিকাভুক্ত করার উপায়:*
1. আপনার পণ্যের 1-3টি ফটো পাঠান 📸
2. এটি বর্ণনা করে একটি ভয়েস মেসেজ বা ভিডিও পাঠান 🎤
3. আমি আপনার জন্য স্বয়ংক্রিয়ভাবে একটি তালিকা তৈরি করব!

*সহজ কমান্ড:*
• HELP - সাহায্য বার্তা দেখান
• STATUS - আপনার তালিকার অবস্থা পরীক্ষা করুন
• ORDERS - আপনার অর্ডার দেখুন

আপনার প্রথম পণ্যের ফটো পাঠিয়ে শুরু করুন! 🚀`,

  mr: `🎉 अभिनंदन, {name}!

तुमचे विक्रेता खाते यशस्वीरित्या तयार केले गेले आहे!

*तुमची उत्पादने सूचीबद्ध कशी करावी:*
1. तुमच्या उत्पादनाचे 1-3 फोटो पाठवा 📸
2. त्याचे वर्णन करणारा व्हॉइस मेसेज किंवा व्हिडिओ पाठवा 🎤
3. मी तुमच्यासाठी आपोआप एक यादी तयार करेन!

*सोपे आदेश:*
• HELP - मदत संदेश दाखवा
• STATUS - तुमची यादी स्थिती तपासा
• ORDERS - तुमचे ऑर्डर पहा

तुमच्या पहिल्या उत्पादनाचे फोटो पाठवून सुरुवात करा! 🚀`,

  gu: `🎉 અભિનંદન, {name}!

તમારું વિક્રેતા ખાતું સફળતાપૂર્વક બનાવવામાં આવ્યું છે!

*તમારા ઉત્પાદનોને સૂચિબદ્ધ કેવી રીતે કરવું:*
1. તમારા ઉત્પાદનના 1-3 ફોટા મોકલો 📸
2. તેનું વર્ણન કરતો વૉઇસ મેસેજ અથવા વીડિયો મોકલો 🎤
3. હું તમારા માટે આપમેળે સૂચિ બનાવીશ!

*સરળ આદેશો:*
• HELP - મદદ સંદેશ બતાવો
• STATUS - તમારી સૂચિની સ્થિતિ તપાસો
• ORDERS - તમારા ઓર્ડર જુઓ

તમારા પ્રથમ ઉત્પાદનના ફોટા મોકલીને શરૂ કરો! 🚀`,

  kn: `🎉 ಅಭಿನಂದನೆಗಳು, {name}!

ನಿಮ್ಮ ಮಾರಾಟಗಾರ ಖಾತೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!

*ನಿಮ್ಮ ಉತ್ಪನ್ನಗಳನ್ನು ಪಟ್ಟಿ ಮಾಡುವುದು ಹೇಗೆ:*
1. ನಿಮ್ಮ ಉತ್ಪನ್ನದ 1-3 ಫೋಟೋಗಳನ್ನು ಕಳುಹಿಸಿ 📸
2. ಅದನ್ನು ವಿವರಿಸುವ ಧ್ವನಿ ಸಂದೇಶ ಅಥವಾ ವೀಡಿಯೊವನ್ನು ಕಳುಹಿಸಿ 🎤
3. ನಾನು ನಿಮಗಾಗಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪಟ್ಟಿಯನ್ನು ರಚಿಸುತ್ತೇನೆ!

*ಸರಳ ಆಜ್ಞೆಗಳು:*
• HELP - ಸಹಾಯ ಸಂದೇಶವನ್ನು ತೋರಿಸಿ
• STATUS - ನಿಮ್ಮ ಪಟ್ಟಿ ಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ
• ORDERS - ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ

ನಿಮ್ಮ ಮೊದಲ ಉತ್ಪನ್ನದ ಫೋಟೋಗಳನ್ನು ಕಳುಹಿಸುವ ಮೂಲಕ ಪ್ರಾರಂಭಿಸಿ! 🚀`,

  ml: `🎉 അഭിനന്ദനങ്ങൾ, {name}!

നിങ്ങളുടെ വിൽപ്പനക്കാരൻ അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു!

*നിങ്ങളുടെ ഉൽപ്പന്നങ്ങൾ പട്ടികപ്പെടുത്തുന്നത് എങ്ങനെ:*
1. നിങ്ങളുടെ ഉൽപ്പന്നത്തിന്റെ 1-3 ഫോട്ടോകൾ അയയ്ക്കുക 📸
2. അത് വിവരിക്കുന്ന വോയ്‌സ് സന്ദേശം അല്ലെങ്കിൽ വീഡിയോ അയയ്ക്കുക 🎤
3. ഞാൻ നിങ്ങൾക്കായി സ്വയമേവ ഒരു ലിസ്റ്റിംഗ് സൃഷ്ടിക്കും!

*ലളിതമായ കമാൻഡുകൾ:*
• HELP - സഹായ സന്ദേശം കാണിക്കുക
• STATUS - നിങ്ങളുടെ ലിസ്റ്റിംഗ് സ്റ്റാറ്റസ് പരിശോധിക്കുക
• ORDERS - നിങ്ങളുടെ ഓർഡറുകൾ കാണുക

നിങ്ങളുടെ ആദ്യ ഉൽപ്പന്നത്തിന്റെ ഫോട്ടോകൾ അയച്ച് ആരംഭിക്കുക! 🚀`,

  pa: `🎉 ਵਧਾਈਆਂ, {name}!

ਤੁਹਾਡਾ ਵਿਕਰੇਤਾ ਖਾਤਾ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਇਆ ਗਿਆ ਹੈ!

*ਆਪਣੇ ਉਤਪਾਦਾਂ ਨੂੰ ਸੂਚੀਬੱਧ ਕਿਵੇਂ ਕਰੀਏ:*
1. ਆਪਣੇ ਉਤਪਾਦ ਦੀਆਂ 1-3 ਫੋਟੋਆਂ ਭੇਜੋ 📸
2. ਇਸਦਾ ਵਰਣਨ ਕਰਦਾ ਵੌਇਸ ਮੈਸੇਜ ਜਾਂ ਵੀਡੀਓ ਭੇਜੋ 🎤
3. ਮੈਂ ਤੁਹਾਡੇ ਲਈ ਆਪਣੇ ਆਪ ਇੱਕ ਸੂਚੀ ਬਣਾਵਾਂਗਾ!

*ਸਧਾਰਨ ਕਮਾਂਡਾਂ:*
• HELP - ਮਦਦ ਸੁਨੇਹਾ ਦਿਖਾਓ
• STATUS - ਆਪਣੀ ਸੂਚੀ ਸਥਿਤੀ ਦੀ ਜਾਂਚ ਕਰੋ
• ORDERS - ਆਪਣੇ ਆਰਡਰ ਦੇਖੋ

ਆਪਣੇ ਪਹਿਲੇ ਉਤਪਾਦ ਦੀਆਂ ਫੋਟੋਆਂ ਭੇਜ ਕੇ ਸ਼ੁਰੂ ਕਰੋ! 🚀`,
};

/**
 * Send onboarding confirmation message
 * @param phone - Artisan's phone number
 * @param name - Artisan's name
 * @param lang - Language code
 */
export async function sendOnboardingConfirmation(
  phone: string,
  name: string,
  lang: string
): Promise<void> {
  try {
    const languageCode = CONFIRMATION_MESSAGES[lang as keyof typeof CONFIRMATION_MESSAGES]
      ? lang
      : 'en';

    const confirmationMessage = CONFIRMATION_MESSAGES[languageCode as keyof typeof CONFIRMATION_MESSAGES];
    const message = confirmationMessage.replace('{name}', name);

    await sendTextMessage(phone, message);

    console.log('[Onboarding] Confirmation sent to:', phone);
  } catch (error) {
    console.error('[Onboarding] Error sending confirmation:', error);
    throw error;
  }
}

/**
 * Get onboarding status for a phone number
 * @param phone - Artisan's phone number
 * @returns Onboarding record or null
 */
export async function getOnboardingStatus(
  phone: string
): Promise<ArtisanOnboarding | null> {
  try {
    const { queryDocuments, where } = await import('../firebase/firestore');
    const onboardings = await queryDocuments(
      COLLECTION_NAME,
      where('phone', '==', phone)
    );

    if (onboardings.length === 0) {
      return null;
    }

    // Return the most recent onboarding
    const sorted = onboardings.sort(
      (a: any, b: any) => b.startedAt.toMillis() - a.startedAt.toMillis()
    );

    return sorted[0] as ArtisanOnboarding;
  } catch (error) {
    console.error('[Onboarding] Error getting onboarding status:', error);
    return null;
  }
}
