# AI Services for HandcraftedHub

This directory contains AI service integrations for translation, transcription, and content generation with a focus on Indian languages.

## Services Overview

### 🇮🇳 Bhashini Service (`bhashini-service.ts`)

**Government of India's AI Platform**

- Official: https://bhashini.gov.in/
- Best for: Government-backed, reliable translation
- Features:
  - Text translation (10+ Indian languages)
  - Audio transcription (ASR)
  - Batch translation support
  - Free tier available for government projects

### 🚀 Sarvam AI Service (`sarvam-service.ts`)

**Indian AI Company**

- Official: https://www.sarvam.ai/
- Best for: Advanced features, better audio quality
- Features:
  - Text translation (10+ Indian languages)
  - Audio transcription (ASR)
  - Text-to-Speech (TTS)
  - Batch translation support
  - Higher accuracy for modern content

### 🎭 Mock Services (`mock-services.ts`)

**Development & Testing**

- Fallback when APIs not configured
- Sample data for all supported languages
- No API keys required
- Perfect for local development

## Supported Languages

All services support these languages:

| Code | Language  | Native Name |
| ---- | --------- | ----------- |
| `en` | English   | English     |
| `hi` | Hindi     | हिंदी       |
| `ta` | Tamil     | தமிழ்       |
| `te` | Telugu    | తెలుగు      |
| `bn` | Bengali   | বাংলা       |
| `mr` | Marathi   | मराठी       |
| `gu` | Gujarati  | ગુજરાતી     |
| `kn` | Kannada   | ಕನ್ನಡ       |
| `ml` | Malayalam | മലയാളം      |
| `pa` | Punjabi   | ਪੰਜਾਬੀ      |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Create `.env.local` file:

```bash
# Bhashini
BHASHINI_USER_ID=your_user_id
BHASHINI_API_KEY=your_api_key

# Sarvam AI
SARVAM_API_KEY=your_api_key
```

### 3. Test Services

```bash
npx ts-node scripts/test-ai-services.ts
```

## Usage Examples

### Translation

```typescript
import { translateWithBhashini } from "@/lib/ai/bhashini-service";
import { translateWithSarvam } from "@/lib/ai/sarvam-service";

// Using Bhashini
const hindiText = await translateWithBhashini(
  "Beautiful handcrafted pottery",
  "en", // source
  "hi" // target
);

// Using Sarvam AI
const tamilText = await translateWithSarvam(
  "Traditional bamboo basket",
  "en",
  "ta"
);
```

### Batch Translation

```typescript
import { batchTranslateWithBhashini } from "@/lib/ai/bhashini-service";

const translations = await batchTranslateWithBhashini(
  "Handwoven cotton saree",
  "en",
  ["hi", "ta", "te", "bn", "mr"]
);

// Result:
// {
//   hi: "हाथ से बुनी हुई कपास की साड़ी",
//   ta: "கைத்தறி பருத்தி புடவை",
//   te: "చేతితో నేసిన పత్తి చీర",
//   ...
// }
```

### Audio Transcription

```typescript
import { transcribeWithSarvam } from "@/lib/ai/sarvam-service";

const result = await transcribeWithSarvam(
  "https://example.com/audio.wav",
  "hi"
);

console.log(result.text); // Transcribed text
console.log(result.language); // Language code
console.log(result.confidence); // Confidence score
```

### Text-to-Speech

```typescript
import { textToSpeechWithSarvam } from "@/lib/ai/sarvam-service";

const audioBase64 = await textToSpeechWithSarvam(
  "यह एक सुंदर हस्तनिर्मित वस्तु है",
  "hi",
  "Female"
);

// Use audioBase64 to play or save audio
```

## Service Selection Strategy

The system uses a smart fallback strategy:

```
1. Try Sarvam AI (if configured)
   ↓ (if fails or not configured)
2. Try Bhashini (if configured)
   ↓ (if fails or not configured)
3. Use Mock Service (always available)
```

### When to Use Which Service?

**Use Sarvam AI when:**

- You need Text-to-Speech
- You want better audio transcription quality
- You're working with modern, conversational content
- You need faster response times

**Use Bhashini when:**

- You're working on government projects
- You need official, standardized translations
- You want free tier for testing
- You prefer government-backed services

**Use Mock Service when:**

- Developing locally without API keys
- Testing UI/UX without real API calls
- Running automated tests
- Demonstrating features without costs

## API Response Formats

### Translation Response

```typescript
{
  translatedText: string; // The translated text
}
```

### Transcription Response

```typescript
{
  text: string; // Transcribed text
  language: string; // Language code
  confidence: number; // 0.0 to 1.0
}
```

### Batch Translation Response

```typescript
{
  [languageCode: string]: string;
}
```

## Error Handling

All services include automatic error handling and fallback:

```typescript
try {
  const result = await translateWithSarvam(text, "en", "hi");
  // Use result
} catch (error) {
  // Service automatically falls back to original text
  console.error("Translation failed:", error);
}
```

## Performance Tips

### 1. Use Batch Operations

```typescript
// ❌ Slow: Multiple calls
for (const lang of languages) {
  await translateWithSarvam(text, "en", lang);
}

// ✅ Fast: Single batch call
const translations = await batchTranslateWithSarvam(text, "en", languages);
```

### 2. Cache Translations

```typescript
const cache = new Map<string, string>();

async function getCachedTranslation(text: string, lang: string) {
  const key = `${text}:${lang}`;
  if (cache.has(key)) return cache.get(key);

  const translation = await translateWithSarvam(text, "en", lang);
  cache.set(key, translation);
  return translation;
}
```

### 3. Parallel Processing

```typescript
// Process multiple translations in parallel
const results = await Promise.all([
  translateWithSarvam(text1, "en", "hi"),
  translateWithSarvam(text2, "en", "ta"),
  translateWithSarvam(text3, "en", "te"),
]);
```

## Testing

### Unit Tests

```typescript
import { translateWithBhashini } from "@/lib/ai/bhashini-service";

describe("Bhashini Translation", () => {
  it("should translate English to Hindi", async () => {
    const result = await translateWithBhashini("Hello", "en", "hi");
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
```

### Integration Tests

```bash
# Run test script
npx ts-node scripts/test-ai-services.ts
```

## Monitoring

Check console logs for service usage:

```
[Sarvam] Translated en → hi
[Bhashini] Transcribed audio in hi
[Sarvam] Generated speech in hi
[Mock AI] Using fallback translation
```

## Cost Optimization

1. **Batch translations** - Reduce API calls by 80%
2. **Cache results** - Store frequently used translations
3. **Use mock service** - For development and testing
4. **Rate limiting** - Prevent excessive API usage
5. **Lazy loading** - Translate only when needed

## Troubleshooting

### Issue: API not working

**Check:**

1. API keys in `.env.local`
2. Network connectivity
3. API key validity
4. Service status

**Solution:**

```bash
# Test configuration
npx ts-node scripts/test-ai-services.ts
```

### Issue: Poor translation quality

**Try:**

1. Switch to different service (Sarvam ↔ Bhashini)
2. Check source language detection
3. Verify text encoding (UTF-8)
4. Use formal mode for better results

### Issue: Audio transcription fails

**Check:**

1. Audio format (WAV recommended)
2. Audio quality (clear speech)
3. File size (< 10MB)
4. Language code correctness

## File Structure

```
lib/ai/
├── README.md                 # This file
├── bhashini-service.ts       # Bhashini integration
├── sarvam-service.ts         # Sarvam AI integration
└── mock-services.ts          # Mock/fallback services
```

## Related Documentation

- [AI Translation Integration Guide](../../docs/AI_TRANSLATION_INTEGRATION.md)
- [WhatsApp Integration](../../docs/WHATSAPP_WEBHOOK_COMPLETE_SETUP.md)
- [Environment Variables](../../docs/ENVIRONMENT_VARIABLES.md)

## API Documentation

- [Bhashini API Docs](https://bhashini.gov.in/docs)
- [Sarvam AI API Docs](https://docs.sarvam.ai/)

## Support

For issues:

- **Bhashini:** support@bhashini.gov.in
- **Sarvam AI:** support@sarvam.ai
- **HandcraftedHub:** Open GitHub issue

## License

See [LICENSE](../../LICENSE) file for details.
