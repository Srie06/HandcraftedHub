/**
 * Example usage of the artisan onboarding system
 * This demonstrates how the onboarding flow works
 */

import {
  isFirstTimeUser,
  sendWelcomeMessage,
  processOnboardingResponse,
  getOnboardingStatus,
  detectLanguageFromText,
} from './onboarding-handler';

/**
 * Example: Complete onboarding flow for a new artisan
 */
export async function exampleOnboardingFlow() {
  const phone = '+919876543210';

  console.log('=== Artisan Onboarding Example ===\n');

  // Step 1: Check if first-time user
  console.log('Step 1: Checking if first-time user...');
  const isNew = await isFirstTimeUser(phone);
  console.log(`Is first-time user: ${isNew}\n`);

  if (!isNew) {
    console.log('User already registered. Skipping onboarding.\n');
    return;
  }

  // Step 2: Send welcome message (in Hindi)
  console.log('Step 2: Sending welcome message...');
  await sendWelcomeMessage(phone, 'hi');
  console.log('Welcome message sent!\n');

  // Step 3: User responds with name
  console.log('Step 3: User responds with name...');
  console.log('User: "Ramesh Kumar"');
  await processOnboardingResponse(phone, 'Ramesh Kumar');
  console.log('Name collected. Location prompt sent.\n');

  // Step 4: User responds with location
  console.log('Step 4: User responds with location...');
  console.log('User: "Jaipur"');
  await processOnboardingResponse(phone, 'Jaipur');
  console.log('Location collected. Craft type prompt sent.\n');

  // Step 5: User responds with craft type
  console.log('Step 5: User responds with craft type...');
  console.log('User: "Blue pottery"');
  const isComplete = await processOnboardingResponse(phone, 'Blue pottery');
  console.log(`Craft type collected. Onboarding complete: ${isComplete}\n`);

  // Step 6: Check final status
  console.log('Step 6: Checking final onboarding status...');
  const status = await getOnboardingStatus(phone);
  console.log('Final status:', {
    step: status?.step,
    name: status?.data.name,
    location: status?.data.location,
    craftType: status?.data.craftType,
    sellerId: status?.sellerId,
  });

  console.log('\n=== Onboarding Complete! ===');
}

/**
 * Example: Language detection
 */
export function exampleLanguageDetection() {
  console.log('=== Language Detection Examples ===\n');

  const examples = [
    { text: 'Hello, I want to sell pottery', expected: 'en' },
    { text: 'नमस्ते, मैं मिट्टी के बर्तन बेचना चाहता हूं', expected: 'hi' },
    { text: 'வணக்கம், நான் மண்பாண்டங்களை விற்க விரும்புகிறேன்', expected: 'ta' },
    { text: 'నమస్కారం, నేను కుండలు అమ్మాలనుకుంటున్నాను', expected: 'te' },
    { text: 'হ্যালো, আমি মৃৎশিল্প বিক্রি করতে চাই', expected: 'bn' },
    { text: 'નમસ્તે, હું માટીકામ વેચવા માંગુ છું', expected: 'gu' },
    { text: 'ನಮಸ್ಕಾರ, ನಾನು ಕುಂಬಾರಿಕೆ ಮಾರಾಟ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ', expected: 'kn' },
    { text: 'നമസ്കാരം, എനിക്ക് മൺപാത്രങ്ങൾ വിൽക്കണം', expected: 'ml' },
    { text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਮਿੱਟੀ ਦੇ ਭਾਂਡੇ ਵੇਚਣਾ ਚਾਹੁੰਦਾ ਹਾਂ', expected: 'pa' },
  ];

  examples.forEach(({ text, expected }) => {
    const detected = detectLanguageFromText(text);
    const match = detected === expected ? '✓' : '✗';
    console.log(`${match} Text: "${text.substring(0, 30)}..."`);
    console.log(`  Expected: ${expected}, Detected: ${detected}\n`);
  });

  console.log('=== Language Detection Complete ===');
}

/**
 * Example: Handling returning user
 */
export async function exampleReturningUser() {
  const phone = '+919876543210';

  console.log('=== Returning User Example ===\n');

  // Check if first-time user
  const isNew = await isFirstTimeUser(phone);
  console.log(`Is first-time user: ${isNew}`);

  if (!isNew) {
    console.log('User already registered!');
    console.log('Proceeding with normal product listing flow...\n');
    
    // Get their onboarding info
    const status = await getOnboardingStatus(phone);
    if (status) {
      console.log('User info:', {
        name: status.data.name,
        location: status.data.location,
        craftType: status.data.craftType,
      });
    }
  }

  console.log('\n=== Example Complete ===');
}

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('Running onboarding examples...\n');
  
  // Uncomment to run examples:
  // exampleLanguageDetection();
  // exampleOnboardingFlow().catch(console.error);
  // exampleReturningUser().catch(console.error);
  
  console.log('\nNote: Uncomment the example functions to run them.');
  console.log('Make sure Firebase is configured before running flow examples.');
}
