# WhatsApp Artisan Onboarding System

## Quick Start

The onboarding system is automatically triggered when a first-time user sends a message to the WhatsApp bot.

## Files Created

### Core Implementation

- **`lib/whatsapp/onboarding-handler.ts`** - Main onboarding logic
  - First-time user detection
  - Welcome message sending (10 languages)
  - Conversational flow management
  - Seller account creation
  - Confirmation messages

### Integration

- **`lib/whatsapp/message-handler.ts`** - Updated to integrate onboarding
  - Detects first-time users
  - Routes to onboarding flow
  - Prevents product listing until onboarding complete

### Documentation & Examples

- **`docs/WHATSAPP_ARTISAN_ONBOARDING.md`** - Complete documentation
- **`lib/whatsapp/onboarding-example.ts`** - Usage examples

## Key Features Implemented

### ✅ Subtask 11.1: Welcome Message Handler

- Detects first-time users by checking for existing seller accounts
- Sends welcome message in detected language (10 Indian languages)
- Provides simple instructions to get started
- Automatically starts onboarding flow

### ✅ Subtask 11.2: Conversational Onboarding

- Collects artisan name through natural conversation
- Collects location/region information
- Collects craft type (pottery, textiles, etc.)
- Creates seller account automatically with collected data
- Maintains onboarding state in Firestore

### ✅ Subtask 11.3: Onboarding Confirmation

- Confirms account creation with personalized message
- Provides listing instructions in user's language
- Shares simple commands (HELP, STATUS, ORDERS)
- Encourages user to start listing products

## Onboarding State Machine

```
welcome
  ↓
collecting_name
  ↓
collecting_location
  ↓
collecting_craft_type
  ↓
completed (seller account created)
```

## Language Support

All messages support 10 Indian languages:

- English (en)
- Hindi (hi) - Default
- Tamil (ta)
- Telugu (te)
- Bengali (bn)
- Marathi (mr)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)

## Language Detection

Uses Unicode character ranges to detect language from user's text:

- Devanagari (Hindi/Marathi)
- Tamil script
- Telugu script
- Bengali script
- Gujarati script
- Kannada script
- Malayalam script
- Gurmukhi (Punjabi)
- Latin (English)

## Data Storage

### Firestore Collection: `artisanOnboarding`

```typescript
{
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
```

### Firestore Collection: `users` (Seller Account)

```typescript
{
  email: string; // {phone}@whatsapp.handcraftedhub.com
  displayName: string;
  role: "seller";
  phone: string;
  shopName: string; // "{name}'s {craftType}"
  shopDescription: string; // "Handcrafted {craftType} from {location}"
  location: string;
  profileComplete: true;
  onboardedViaWhatsApp: true;
  createdAt: Timestamp;
}
```

## Integration Points

### Message Handler Integration

The message handler now:

1. Checks if user is first-time → triggers welcome
2. Checks if user is in onboarding → processes responses
3. Only allows product listing after onboarding complete

### Session Manager Integration

- Onboarding completes before session creation
- Seller ID is available for session association
- Smooth transition from onboarding to product listing

## Testing

### Manual Testing

1. Use WhatsApp simulator at `/admin/whatsapp-simulator`
2. Send message as new phone number
3. Follow conversational prompts
4. Verify seller account created in Firestore

### Example Code

See `lib/whatsapp/onboarding-example.ts` for:

- Complete flow example
- Language detection examples
- Returning user handling

## API Reference

### Main Functions

```typescript
// Check if phone number is first-time user
isFirstTimeUser(phone: string): Promise<boolean>

// Send welcome message and start onboarding
sendWelcomeMessage(phone: string, detectedLanguage: string): Promise<void>

// Process user's response in onboarding flow
processOnboardingResponse(phone: string, message: string): Promise<boolean>

// Send confirmation after account creation
sendOnboardingConfirmation(phone: string, name: string, lang: string): Promise<void>

// Detect language from text
detectLanguageFromText(text: string): string

// Get current onboarding status
getOnboardingStatus(phone: string): Promise<ArtisanOnboarding | null>
```

## Requirements Validated

✅ **Requirement 10.1**: First-time users receive welcome message with instructions
✅ **Requirement 10.2**: Conversational flow collects artisan name, location, craft type
✅ **Requirement 10.3**: Seller account created automatically
✅ **Requirement 10.4**: Confirmation sent after account creation
✅ **Requirement 10.5**: Simple commands provided for next steps

## Next Steps

After onboarding is complete, artisans can:

1. Send product photos (1-3 images)
2. Send voice/video description
3. System creates product draft for admin review
4. Receive order notifications via WhatsApp

## Error Handling

- Language detection failure → defaults to Hindi
- Account creation failure → logs error, notifies admin
- Non-text during onboarding → prompts to complete registration
- Database errors → graceful error messages to user

## Future Enhancements

- Voice-based onboarding (process audio responses)
- Profile photo upload
- Bank account details collection
- Phone number verification (OTP)
- Document upload for verification
- Multi-language UI for seller dashboard
