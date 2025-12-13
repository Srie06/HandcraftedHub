/**
 * WhatsApp Notification Message Generator
 * Formats order details for WhatsApp messages in multiple languages
 */

import { LanguageCode } from '@/lib/i18n/config';

export interface OrderNotificationParams {
  orderId: string;
  productName: string;
  quantity: number;
  buyerLocation: string;
  totalAmount: number;
  trackingLink?: string;
}

export interface StatusUpdateParams {
  orderId: string;
  productName: string;
  status: 'ready_for_pickup' | 'picked_up' | 'delivered';
}

/**
 * Generate order notification message in specified language
 */
export function generateOrderNotification(
  params: OrderNotificationParams,
  language: LanguageCode = 'en'
): string {
  const templates = {
    en: `🎉 *New Order Received!*

📦 *Product:* ${params.productName}
🔢 *Quantity:* ${params.quantity}
📍 *Buyer Location:* ${params.buyerLocation}
💰 *Amount:* ₹${params.totalAmount}

🆔 *Order ID:* ${params.orderId}
${params.trackingLink ? `🔗 *Track Order:* ${params.trackingLink}` : ''}

Please prepare the product for pickup. You'll receive another notification when the logistics partner picks it up.

Thank you for being part of HandcraftedHub! 🙏`,

    hi: `🎉 *नया ऑर्डर प्राप्त हुआ!*

📦 *उत्पाद:* ${params.productName}
🔢 *मात्रा:* ${params.quantity}
📍 *खरीदार का स्थान:* ${params.buyerLocation}
💰 *राशि:* ₹${params.totalAmount}

🆔 *ऑर्डर आईडी:* ${params.orderId}
${params.trackingLink ? `🔗 *ऑर्डर ट्रैक करें:* ${params.trackingLink}` : ''}

कृपया उत्पाद को पिकअप के लिए तैयार करें। जब लॉजिस्टिक्स पार्टनर इसे उठाएगा तो आपको एक और सूचना मिलेगी।

HandcraftedHub का हिस्सा बनने के लिए धन्यवाद! 🙏`,

    ta: `🎉 *புதிய ஆர்டர் பெறப்பட்டது!*

📦 *தயாரிப்பு:* ${params.productName}
🔢 *அளவு:* ${params.quantity}
📍 *வாங்குபவர் இடம்:* ${params.buyerLocation}
💰 *தொகை:* ₹${params.totalAmount}

🆔 *ஆர்டர் ஐடி:* ${params.orderId}
${params.trackingLink ? `🔗 *ஆர்டரைக் கண்காணிக்கவும்:* ${params.trackingLink}` : ''}

தயவுசெய்து தயாரிப்பை எடுப்பதற்கு தயார் செய்யுங்கள். லாஜிஸ்டிக்ஸ் பார்ட்னர் அதை எடுக்கும்போது மற்றொரு அறிவிப்பு கிடைக்கும்.

HandcraftedHub இன் பகுதியாக இருப்பதற்கு நன்றி! 🙏`,

    te: `🎉 *కొత్త ఆర్డర్ అందింది!*

📦 *ఉత్పత్తి:* ${params.productName}
🔢 *పరిమాణం:* ${params.quantity}
📍 *కొనుగోలుదారు స్థానం:* ${params.buyerLocation}
💰 *మొత్తం:* ₹${params.totalAmount}

🆔 *ఆర్డర్ ID:* ${params.orderId}
${params.trackingLink ? `🔗 *ఆర్డర్ ట్రాక్ చేయండి:* ${params.trackingLink}` : ''}

దయచేసి ఉత్పత్తిని పికప్ కోసం సిద్ధం చేయండి. లాజిస్టిక్స్ భాగస్వామి దానిని తీసుకున్నప్పుడు మరొక నోటిఫికేషన్ అందుతుంది.

HandcraftedHub లో భాగమైనందుకు ధన్యవాదాలు! 🙏`,

    bn: `🎉 *নতুন অর্ডার পাওয়া গেছে!*

📦 *পণ্য:* ${params.productName}
🔢 *পরিমাণ:* ${params.quantity}
📍 *ক্রেতার অবস্থান:* ${params.buyerLocation}
💰 *মোট:* ₹${params.totalAmount}

🆔 *অর্ডার আইডি:* ${params.orderId}
${params.trackingLink ? `🔗 *অর্ডার ট্র্যাক করুন:* ${params.trackingLink}` : ''}

অনুগ্রহ করে পিকআপের জন্য পণ্য প্রস্তুত করুন। লজিস্টিক পার্টনার এটি তুলে নিলে আপনি আরেকটি বিজ্ঞপ্তি পাবেন।

HandcraftedHub এর অংশ হওয়ার জন্য ধন্যবাদ! 🙏`,

    mr: `🎉 *नवीन ऑर्डर प्राप्त झाली!*

📦 *उत्पादन:* ${params.productName}
🔢 *प्रमाण:* ${params.quantity}
📍 *खरेदीदाराचे स्थान:* ${params.buyerLocation}
💰 *रक्कम:* ₹${params.totalAmount}

🆔 *ऑर्डर आयडी:* ${params.orderId}
${params.trackingLink ? `🔗 *ऑर्डर ट्रॅक करा:* ${params.trackingLink}` : ''}

कृपया उत्पादन पिकअपसाठी तयार करा. लॉजिस्टिक्स पार्टनर ते उचलेल तेव्हा तुम्हाला दुसरी सूचना मिळेल.

HandcraftedHub चा भाग असल्याबद्दल धन्यवाद! 🙏`,

    gu: `🎉 *નવો ઓર્ડર પ્રાપ્ત થયો!*

📦 *ઉત્પાદન:* ${params.productName}
🔢 *જથ્થો:* ${params.quantity}
📍 *ખરીદદારનું સ્થાન:* ${params.buyerLocation}
💰 *રકમ:* ₹${params.totalAmount}

🆔 *ઓર્ડર ID:* ${params.orderId}
${params.trackingLink ? `🔗 *ઓર્ડર ટ્રૅક કરો:* ${params.trackingLink}` : ''}

કૃપા કરીને પિકઅપ માટે ઉત્પાદન તૈયાર કરો. લોજિસ્ટિક્સ પાર્ટનર તેને ઉપાડે ત્યારે તમને બીજી સૂચના મળશે.

HandcraftedHub નો ભાગ બનવા બદલ આભાર! 🙏`,

    kn: `🎉 *ಹೊಸ ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!*

📦 *ಉತ್ಪನ್ನ:* ${params.productName}
🔢 *ಪ್ರಮಾಣ:* ${params.quantity}
📍 *ಖರೀದಿದಾರರ ಸ್ಥಳ:* ${params.buyerLocation}
💰 *ಮೊತ್ತ:* ₹${params.totalAmount}

🆔 *ಆರ್ಡರ್ ID:* ${params.orderId}
${params.trackingLink ? `🔗 *ಆರ್ಡರ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ:* ${params.trackingLink}` : ''}

ದಯವಿಟ್ಟು ಪಿಕಪ್‌ಗಾಗಿ ಉತ್ಪನ್ನವನ್ನು ತಯಾರಿಸಿ. ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಪಾಲುದಾರರು ಅದನ್ನು ತೆಗೆದುಕೊಂಡಾಗ ನೀವು ಮತ್ತೊಂದು ಅಧಿಸೂಚನೆಯನ್ನು ಪಡೆಯುತ್ತೀರಿ.

HandcraftedHub ನ ಭಾಗವಾಗಿರುವುದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು! 🙏`,

    ml: `🎉 *പുതിയ ഓർഡർ ലഭിച്ചു!*

📦 *ഉൽപ്പന്നം:* ${params.productName}
🔢 *അളവ്:* ${params.quantity}
📍 *വാങ്ങുന്നയാളുടെ സ്ഥലം:* ${params.buyerLocation}
💰 *തുക:* ₹${params.totalAmount}

🆔 *ഓർഡർ ID:* ${params.orderId}
${params.trackingLink ? `🔗 *ഓർഡർ ട്രാക്ക് ചെയ്യുക:* ${params.trackingLink}` : ''}

പിക്കപ്പിനായി ഉൽപ്പന്നം തയ്യാറാക്കുക. ലോജിസ്റ്റിക്സ് പങ്കാളി അത് എടുക്കുമ്പോൾ നിങ്ങൾക്ക് മറ്റൊരു അറിയിപ്പ് ലഭിക്കും.

HandcraftedHub ന്റെ ഭാഗമായതിന് നന്ദി! 🙏`,

    pa: `🎉 *ਨਵਾਂ ਆਰਡਰ ਪ੍ਰਾਪਤ ਹੋਇਆ!*

📦 *ਉਤਪਾਦ:* ${params.productName}
🔢 *ਮਾਤਰਾ:* ${params.quantity}
📍 *ਖਰੀਦਦਾਰ ਦਾ ਸਥਾਨ:* ${params.buyerLocation}
💰 *ਰਕਮ:* ₹${params.totalAmount}

🆔 *ਆਰਡਰ ID:* ${params.orderId}
${params.trackingLink ? `🔗 *ਆਰਡਰ ਟਰੈਕ ਕਰੋ:* ${params.trackingLink}` : ''}

ਕਿਰਪਾ ਕਰਕੇ ਪਿਕਅੱਪ ਲਈ ਉਤਪਾਦ ਤਿਆਰ ਕਰੋ। ਜਦੋਂ ਲੌਜਿਸਟਿਕਸ ਪਾਰਟਨਰ ਇਸਨੂੰ ਚੁੱਕਦਾ ਹੈ ਤਾਂ ਤੁਹਾਨੂੰ ਇੱਕ ਹੋਰ ਸੂਚਨਾ ਮਿਲੇਗੀ।

HandcraftedHub ਦਾ ਹਿੱਸਾ ਬਣਨ ਲਈ ਧੰਨਵਾਦ! 🙏`,
  };

  return templates[language] || templates.en;
}

/**
 * Generate status update notification message
 */
export function generateStatusUpdateNotification(
  params: StatusUpdateParams,
  language: LanguageCode = 'en'
): string {
  const statusTemplates = {
    ready_for_pickup: {
      en: `✅ *Order Ready for Pickup*

📦 *Product:* ${params.productName}
🆔 *Order ID:* ${params.orderId}

Your product is ready for pickup. The logistics partner will collect it soon.`,

      hi: `✅ *ऑर्डर पिकअप के लिए तैयार*

📦 *उत्पाद:* ${params.productName}
🆔 *ऑर्डर आईडी:* ${params.orderId}

आपका उत्पाद पिकअप के लिए तैयार है। लॉजिस्टिक्स पार्टनर जल्द ही इसे एकत्र करेगा।`,

      ta: `✅ *ஆர்டர் எடுப்பதற்கு தயார்*

📦 *தயாரிப்பு:* ${params.productName}
🆔 *ஆர்டர் ஐடி:* ${params.orderId}

உங்கள் தயாரிப்பு எடுப்பதற்கு தயாராக உள்ளது. லாஜிஸ்டிக்ஸ் பார்ட்னர் விரைவில் அதை சேகரிப்பார்.`,

      te: `✅ *ఆర్డర్ పికప్ కోసం సిద్ధంగా ఉంది*

📦 *ఉత్పత్తి:* ${params.productName}
🆔 *ఆర్డర్ ID:* ${params.orderId}

మీ ఉత్పత్తి పికప్ కోసం సిద్ధంగా ఉంది. లాజిస్టిక్స్ భాగస్వామి త్వరలో దానిని సేకరిస్తారు.`,

      bn: `✅ *অর্ডার পিকআপের জন্য প্রস্তুত*

📦 *পণ্য:* ${params.productName}
🆔 *অর্ডার আইডি:* ${params.orderId}

আপনার পণ্য পিকআপের জন্য প্রস্তুত। লজিস্টিক পার্টনার শীঘ্রই এটি সংগ্রহ করবে।`,

      mr: `✅ *ऑर्डर पिकअपसाठी तयार*

📦 *उत्पादन:* ${params.productName}
🆔 *ऑर्डर आयडी:* ${params.orderId}

तुमचे उत्पादन पिकअपसाठी तयार आहे. लॉजिस्टिक्स पार्टनर लवकरच ते गोळा करेल.`,

      gu: `✅ *ઓર્ડર પિકઅપ માટે તૈયાર*

📦 *ઉત્પાદન:* ${params.productName}
🆔 *ઓર્ડર ID:* ${params.orderId}

તમારું ઉત્પાદન પિકઅપ માટે તૈયાર છે. લોજિસ્ટિક્સ પાર્ટનર ટૂંક સમયમાં તેને એકત્રિત કરશે.`,

      kn: `✅ *ಆರ್ಡರ್ ಪಿಕಪ್‌ಗೆ ಸಿದ್ಧವಾಗಿದೆ*

📦 *ಉತ್ಪನ್ನ:* ${params.productName}
🆔 *ಆರ್ಡರ್ ID:* ${params.orderId}

ನಿಮ್ಮ ಉತ್ಪನ್ನ ಪಿಕಪ್‌ಗೆ ಸಿದ್ಧವಾಗಿದೆ. ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಪಾಲುದಾರರು ಶೀಘ್ರದಲ್ಲೇ ಅದನ್ನು ಸಂಗ್ರಹಿಸುತ್ತಾರೆ.`,

      ml: `✅ *ഓർഡർ പിക്കപ്പിന് തയ്യാറാണ്*

📦 *ഉൽപ്പന്നം:* ${params.productName}
🆔 *ഓർഡർ ID:* ${params.orderId}

നിങ്ങളുടെ ഉൽപ്പന്നം പിക്കപ്പിന് തയ്യാറാണ്. ലോജിസ്റ്റിക്സ് പങ്കാളി ഉടൻ അത് ശേഖരിക്കും.`,

      pa: `✅ *ਆਰਡਰ ਪਿਕਅੱਪ ਲਈ ਤਿਆਰ*

📦 *ਉਤਪਾਦ:* ${params.productName}
🆔 *ਆਰਡਰ ID:* ${params.orderId}

ਤੁਹਾਡਾ ਉਤਪਾਦ ਪਿਕਅੱਪ ਲਈ ਤਿਆਰ ਹੈ। ਲੌਜਿਸਟਿਕਸ ਪਾਰਟਨਰ ਜਲਦੀ ਹੀ ਇਸਨੂੰ ਇਕੱਠਾ ਕਰੇਗਾ।`,
    },

    picked_up: {
      en: `🚚 *Order Picked Up*

📦 *Product:* ${params.productName}
🆔 *Order ID:* ${params.orderId}

The logistics partner has picked up your product. It's on its way to the buyer!`,

      hi: `🚚 *ऑर्डर उठा लिया गया*

📦 *उत्पाद:* ${params.productName}
🆔 *ऑर्डर आईडी:* ${params.orderId}

लॉजिस्टिक्स पार्टनर ने आपका उत्पाद उठा लिया है। यह खरीदार के पास जा रहा है!`,

      ta: `🚚 *ஆர்டர் எடுக்கப்பட்டது*

📦 *தயாரிப்பு:* ${params.productName}
🆔 *ஆர்டர் ஐடி:* ${params.orderId}

லாஜிஸ்டிக்ஸ் பார்ட்னர் உங்கள் தயாரிப்பை எடுத்துவிட்டார். இது வாங்குபவருக்கு செல்கிறது!`,

      te: `🚚 *ఆర్డర్ పికప్ చేయబడింది*

📦 *ఉత్పత్తి:* ${params.productName}
🆔 *ఆర్డర్ ID:* ${params.orderId}

లాజిస్టిక్స్ భాగస్వామి మీ ఉత్పత్తిని పికప్ చేసారు. ఇది కొనుగోలుదారుకు వెళ్తోంది!`,

      bn: `🚚 *অর্ডার তুলে নেওয়া হয়েছে*

📦 *পণ্য:* ${params.productName}
🆔 *অর্ডার আইডি:* ${params.orderId}

লজিস্টিক পার্টনার আপনার পণ্য তুলে নিয়েছে। এটি ক্রেতার কাছে যাচ্ছে!`,

      mr: `🚚 *ऑर्डर उचलली गेली*

📦 *उत्पादन:* ${params.productName}
🆔 *ऑर्डर आयडी:* ${params.orderId}

लॉजिस्टिक्स पार्टनरने तुमचे उत्पादन उचलले आहे. ते खरेदीदाराकडे जात आहे!`,

      gu: `🚚 *ઓર્ડર ઉપાડવામાં આવ્યો*

📦 *ઉત્પાદન:* ${params.productName}
🆔 *ઓર્ડર ID:* ${params.orderId}

લોજિસ્ટિક્સ પાર્ટનરે તમારું ઉત્પાદન ઉપાડ્યું છે. તે ખરીદદાર પાસે જઈ રહ્યું છે!`,

      kn: `🚚 *ಆರ್ಡರ್ ಪಿಕಪ್ ಮಾಡಲಾಗಿದೆ*

📦 *ಉತ್ಪನ್ನ:* ${params.productName}
🆔 *ಆರ್ಡರ್ ID:* ${params.orderId}

ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಪಾಲುದಾರರು ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಪಿಕಪ್ ಮಾಡಿದ್ದಾರೆ. ಇದು ಖರೀದಿದಾರರಿಗೆ ಹೋಗುತ್ತಿದೆ!`,

      ml: `🚚 *ഓർഡർ പിക്കപ്പ് ചെയ്തു*

📦 *ഉൽപ്പന്നം:* ${params.productName}
🆔 *ഓർഡർ ID:* ${params.orderId}

ലോജിസ്റ്റിക്സ് പങ്കാളി നിങ്ങളുടെ ഉൽപ്പന്നം പിക്കപ്പ് ചെയ്തു. ഇത് വാങ്ങുന്നയാളിലേക്ക് പോകുന്നു!`,

      pa: `🚚 *ਆਰਡਰ ਚੁੱਕਿਆ ਗਿਆ*

📦 *ਉਤਪਾਦ:* ${params.productName}
🆔 *ਆਰਡਰ ID:* ${params.orderId}

ਲੌਜਿਸਟਿਕਸ ਪਾਰਟਨਰ ਨੇ ਤੁਹਾਡਾ ਉਤਪਾਦ ਚੁੱਕ ਲਿਆ ਹੈ। ਇਹ ਖਰੀਦਦਾਰ ਕੋਲ ਜਾ ਰਿਹਾ ਹੈ!`,
    },

    delivered: {
      en: `🎊 *Order Delivered Successfully!*

📦 *Product:* ${params.productName}
🆔 *Order ID:* ${params.orderId}

Your product has been delivered to the buyer. Payment will be processed soon.

Thank you for your craftsmanship! 🙏`,

      hi: `🎊 *ऑर्डर सफलतापूर्वक डिलीवर हो गया!*

📦 *उत्पाद:* ${params.productName}
🆔 *ऑर्डर आईडी:* ${params.orderId}

आपका उत्पाद खरीदार को डिलीवर कर दिया गया है। भुगतान जल्द ही संसाधित किया जाएगा।

आपकी शिल्प कौशल के लिए धन्यवाद! 🙏`,

      ta: `🎊 *ஆர்டர் வெற்றிகரமாக வழங்கப்பட்டது!*

📦 *தயாரிப்பு:* ${params.productName}
🆔 *ஆர்டர் ஐடி:* ${params.orderId}

உங்கள் தயாரிப்பு வாங்குபவருக்கு வழங்கப்பட்டுள்ளது. கட்டணம் விரைவில் செயல்படுத்தப்படும்.

உங்கள் கைவினைத்திறனுக்கு நன்றி! 🙏`,

      te: `🎊 *ఆర్డర్ విజయవంతంగా డెలివరీ చేయబడింది!*

📦 *ఉత్పత్తి:* ${params.productName}
🆔 *ఆర్డర్ ID:* ${params.orderId}

మీ ఉత్పత్తి కొనుగోలుదారుకు డెలివరీ చేయబడింది. చెల్లింపు త్వరలో ప్రాసెస్ చేయబడుతుంది.

మీ హస్తకళకు ధన్యవాదాలు! 🙏`,

      bn: `🎊 *অর্ডার সফলভাবে ডেলিভার হয়েছে!*

📦 *পণ্য:* ${params.productName}
🆔 *অর্ডার আইডি:* ${params.orderId}

আপনার পণ্য ক্রেতার কাছে ডেলিভার করা হয়েছে। পেমেন্ট শীঘ্রই প্রক্রিয়া করা হবে।

আপনার কারুশিল্পের জন্য ধন্যবাদ! 🙏`,

      mr: `🎊 *ऑर्डर यशस्वीरित्या डिलिव्हर झाली!*

📦 *उत्पादन:* ${params.productName}
🆔 *ऑर्डर आयडी:* ${params.orderId}

तुमचे उत्पादन खरेदीदाराला डिलिव्हर केले गेले आहे. पेमेंट लवकरच प्रक्रिया केली जाईल.

तुमच्या कारागिरीबद्दल धन्यवाद! 🙏`,

      gu: `🎊 *ઓર્ડર સફળતાપૂર્વક ડિલિવર થયો!*

📦 *ઉત્પાદન:* ${params.productName}
🆔 *ઓર્ડર ID:* ${params.orderId}

તમારું ઉત્પાદન ખરીદદારને ડિલિવર કરવામાં આવ્યું છે. ચુકવણી ટૂંક સમયમાં પ્રક્રિયા કરવામાં આવશે.

તમારી કારીગરી માટે આભાર! 🙏`,

      kn: `🎊 *ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ವಿತರಿಸಲಾಗಿದೆ!*

📦 *ಉತ್ಪನ್ನ:* ${params.productName}
🆔 *ಆರ್ಡರ್ ID:* ${params.orderId}

ನಿಮ್ಮ ಉತ್ಪನ್ನವನ್ನು ಖರೀದಿದಾರರಿಗೆ ವಿತರಿಸಲಾಗಿದೆ. ಪಾವತಿಯನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುವುದು.

ನಿಮ್ಮ ಕರಕುಶಲತೆಗಾಗಿ ಧನ್ಯವಾದಗಳು! 🙏`,

      ml: `🎊 *ഓർഡർ വിജയകരമായി ഡെലിവർ ചെയ്തു!*

📦 *ഉൽപ്പന്നം:* ${params.productName}
🆔 *ഓർഡർ ID:* ${params.orderId}

നിങ്ങളുടെ ഉൽപ്പന്നം വാങ്ങുന്നയാൾക്ക് ഡെലിവർ ചെയ്തു. പേയ്‌മെന്റ് ഉടൻ പ്രോസസ്സ് ചെയ്യപ്പെടും.

നിങ്ങളുടെ കരകൗശലത്തിന് നന്ദി! 🙏`,

      pa: `🎊 *ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਡਿਲੀਵਰ ਹੋ ਗਿਆ!*

📦 *ਉਤਪਾਦ:* ${params.productName}
🆔 *ਆਰਡਰ ID:* ${params.orderId}

ਤੁਹਾਡਾ ਉਤਪਾਦ ਖਰੀਦਦਾਰ ਨੂੰ ਡਿਲੀਵਰ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਭੁਗਤਾਨ ਜਲਦੀ ਹੀ ਪ੍ਰਕਿਰਿਆ ਕੀਤਾ ਜਾਵੇਗਾ।

ਤੁਹਾਡੀ ਕਾਰੀਗਰੀ ਲਈ ਧੰਨਵਾਦ! 🙏`,
    },
  };

  const templates = statusTemplates[params.status];
  return templates[language] || templates.en;
}

/**
 * Detect language from seller profile or default to Hindi
 */
export function detectSellerLanguage(sellerProfile: any): LanguageCode {
  // Check if seller has a preferred language set
  if (sellerProfile?.preferredLanguage) {
    return sellerProfile.preferredLanguage as LanguageCode;
  }

  // Try to detect from location
  const locationLanguageMap: Record<string, LanguageCode> = {
    'Tamil Nadu': 'ta',
    'Telangana': 'te',
    'Andhra Pradesh': 'te',
    'West Bengal': 'bn',
    'Maharashtra': 'mr',
    'Gujarat': 'gu',
    'Karnataka': 'kn',
    'Kerala': 'ml',
    'Punjab': 'pa',
  };

  if (sellerProfile?.location) {
    for (const [region, lang] of Object.entries(locationLanguageMap)) {
      if (sellerProfile.location.includes(region)) {
        return lang;
      }
    }
  }

  // Default to Hindi
  return 'hi';
}
