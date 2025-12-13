# WhatsApp Webhook Infrastructure

This directory contains the complete WhatsApp Business API integration for HandcraftedHub, enabling artisans to list products via WhatsApp messages.

## Architecture Overview

```
WhatsApp Business API
        ↓
Webhook Endpoint (route.ts)
        ↓
Message Parser (message-parser.ts)
        ↓
Message Handler (message-handler.ts)
        ↓
┌───────────────┬──────────────────┬──────────────────┐
↓               ↓                  ↓                  ↓
Media Handler   Message Sender     Session Manager   AI Processing
(media-handler) (message-sender)   (session-manager) (future: task 5)
```

## Components

### 1. Webhook Endpoint (`app/api/webhooks/whatsapp/route.ts`)

**Purpose:** Receives and validates incoming WhatsApp messages

**Features:**

- GET handler for webhook verification
- POST handler for message processing
- Signature verification for security
- Error handling and logging
- Response time tracking (< 5 seconds requirement)

**Environment Variables Required:**

```env
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_APP_SECRET=your_app_secret
```

### 2. Message Parser (`lib/whatsapp/message-parser.ts`)

**Purpose:** Parses different types of WhatsApp messages

**Supported Message Types:**

- Text messages
- Image messages (with captions)
- Audio messages (voice notes)
- Video messages (with captions)
- Document messages

**Key Functions:**

- `parseMessage()` - Main parsing function
- `normalizePhoneNumber()` - Phone number formatting
- `isValidMessage()` - Message validation

### 3. Message Handler (`lib/whatsapp/message-handler.ts`)

**Purpose:** Orchestrates message processing workflow

**Features:**

- Session management (placeholder for task 4)
- Command processing (HELP, ORDERS, STATUS)
- Media processing coordination
- User feedback and acknowledgments

**Workflow:**

1. Parse incoming message
2. Get/create user session
3. Process based on message type
4. Send acknowledgment to user
5. Trigger AI processing (for media)

### 4. Media Handler (`lib/whatsapp/media-handler.ts`)

**Purpose:** Downloads media from WhatsApp and uploads to Cloudinary

**Features:**

- Retry logic (3 attempts with exponential backoff)
- Parallel media downloads
- Cloudinary upload with optimization
- Audio extraction from video
- File size validation

**Key Functions:**

- `downloadAndUploadMedia()` - Main download/upload function
- `downloadMultipleMedia()` - Batch processing
- `extractAudioFromVideo()` - Audio extraction

**Environment Variables Required:**

```env
WHATSAPP_ACCESS_TOKEN=your_access_token
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 5. Session Manager (`lib/whatsapp/session-manager.ts`)

**Purpose:** Manages WhatsApp conversation sessions with artisans

**Features:**

- Session creation and tracking
- 30-minute inactivity timeout
- State machine (greeting → collecting_media → processing → completed)
- Media association with sessions
- Message history tracking
- Automatic session expiration

**Key Functions:**

- `createSession()` - Create new session
- `getActiveSession()` - Get active session for phone number
- `getOrCreateSession()` - Get or create session
- `addMessageToSession()` - Add message to session
- `addMediaToSession()` - Associate media with session
- `updateSessionStep()` - Update state machine step
- `completeSession()` - Mark session as completed
- `expireSession()` - Expire inactive session
- `isSessionReadyForProcessing()` - Check if ready for AI processing
- `transitionSessionState()` - Automatic state transitions

**State Machine:**

1. **greeting** - Initial welcome message sent
2. **collecting_media** - Collecting images, audio, video, text
3. **processing** - AI processing product data
4. **completed** - Product draft created

**Session Timeout:**

- 30 minutes of inactivity
- Timer resets on each new message
- Expired sessions cannot be reactivated
- New session created for next message

**Firestore Collection:** `whatsappSessions`

### 6. Message Sender (`lib/whatsapp/message-sender.ts`)

**Purpose:** Sends messages to artisans via WhatsApp

**Features:**

- Rate limiting (80 messages/minute)
- Order notifications
- Status updates
- Product approval/rejection notifications
- Welcome and onboarding messages
- Template message support

**Key Functions:**

- `sendTextMessage()` - Send plain text
- `sendOrderNotification()` - New order alerts
- `sendStatusUpdate()` - Order status changes
- `sendProductApprovalNotification()` - Product approved
- `sendProductRejectionNotification()` - Product needs revision
- `sendWelcomeMessage()` - First-time user greeting
- `sendOnboardingConfirmation()` - Account created

**Environment Variables Required:**

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

## Setup Instructions

### 1. WhatsApp Business API Setup

1. Create a Meta Business Account
2. Set up WhatsApp Business API
3. Get your credentials:
   - Phone Number ID
   - Access Token
   - App Secret
   - Verify Token (create your own)

### 2. Environment Configuration

Add to `.env.local`:

```env
# WhatsApp Business API
WHATSAPP_VERIFY_TOKEN=handcrafted_hub_verify_token_2024
WHATSAPP_APP_SECRET=your_whatsapp_app_secret_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
```

### 3. Local Development with ngrok

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Use the ngrok URL for webhook
# Example: https://abc123.ngrok.io/api/webhooks/whatsapp
```

### 4. Configure Webhook in Meta Dashboard

1. Go to Meta for Developers
2. Navigate to your WhatsApp app
3. Go to Configuration → Webhooks
4. Add webhook URL: `https://your-domain.com/api/webhooks/whatsapp`
5. Add verify token (same as WHATSAPP_VERIFY_TOKEN)
6. Subscribe to `messages` events

## Testing

### Test Webhook Verification

```bash
curl "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=handcrafted_hub_verify_token_2024&hub.challenge=test123"
```

Expected response: `test123`

### Test Message Reception

Send a message to your WhatsApp Business number and check the logs:

```bash
# Check Next.js console for:
[WhatsApp Webhook] Message received
[Message Parser] Parsing message
[Message Handler] Processing incoming message
```

## Message Flow Examples

### Example 1: Artisan Sends Product Photos

1. Artisan sends 3 images via WhatsApp
2. Webhook receives messages
3. Parser extracts media IDs
4. Handler downloads from WhatsApp
5. Media handler uploads to Cloudinary
6. Confirmation sent to artisan
7. Session updated with media URLs

### Example 2: Artisan Sends Voice Description

1. Artisan sends voice note
2. Webhook receives audio message
3. Parser extracts audio ID
4. Handler downloads audio
5. Media handler uploads to Cloudinary
6. AI processing triggered (task 5)
7. Product draft created
8. Admin notified for review

### Example 3: Order Notification

1. Buyer places order
2. Order webhook triggered
3. Message sender formats notification
4. WhatsApp API sends message
5. Artisan receives order details
6. Rate limit updated

## Rate Limiting

**Configuration:**

- Window: 60 seconds
- Max messages: 80 per window per phone number
- Storage: In-memory Map (use Redis in production)
- Cleanup: Every 5 minutes

**Behavior:**

- Exceeding limit returns error
- User receives "try again later" message
- Logs rate limit violations

## Error Handling

### Webhook Errors

- Invalid signature → 403 Forbidden
- Malformed payload → 400 Bad Request
- Processing timeout → 200 OK (async processing)
- Media download failure → Retry 3x, then notify

### Media Errors

- Download failure → Retry with exponential backoff
- Upload failure → Log and notify admin
- Invalid file type → Reject and notify user
- File too large → Reject and notify user

### Sending Errors

- Rate limit exceeded → Queue for later
- API error → Log and retry
- Invalid phone → Log and notify admin

## Security Considerations

1. **Signature Verification**

   - All webhooks verified with HMAC SHA-256
   - Invalid signatures rejected immediately

2. **Rate Limiting**

   - Per-phone-number limits
   - Prevents abuse and spam

3. **Environment Variables**

   - Sensitive credentials in .env.local
   - Never committed to git

4. **HTTPS Only**
   - Webhook endpoint requires HTTPS
   - Use ngrok for local development

## Monitoring

### Key Metrics to Track

- Webhook response time (target: < 5 seconds)
- Media download success rate
- Message delivery rate
- Rate limit violations
- Error rates by type

### Logging

All components log to console with prefixes:

- `[WhatsApp Webhook]` - Webhook endpoint
- `[Message Parser]` - Message parsing
- `[Message Handler]` - Message handling
- `[Media Handler]` - Media processing
- `[Message Sender]` - Message sending

### 7. Draft Workflow (`lib/whatsapp/draft-workflow.ts`)

**Purpose:** Creates product drafts from completed WhatsApp sessions

**Features:**

- Automatic draft creation when session completes
- AI processing orchestration
- Multi-language translation
- Product data generation
- Session-to-draft linking

**Key Functions:**

- `createDraftFromSession()` - Main draft creation function
- `isSessionReadyForDraft()` - Check if session has sufficient media
- `processSessionForDraft()` - Entry point for draft creation

**Workflow:**

1. Validate session has images + audio/video
2. Transcribe audio/video with language detection
3. Translate to all 10 supported languages
4. Generate product data (category, tags, price, etc.)
5. Create draft in Firestore with status "review"
6. Link draft to session
7. Mark session as completed

**Requirements:** 1.4, 2.7

### 8. Draft Processor (`lib/whatsapp/draft-processor.ts`)

**Purpose:** Orchestrates AI processing pipeline with error handling

**Features:**

- Retry logic with exponential backoff (3 attempts per step)
- Error categorization (retryable vs non-retryable)
- Status tracking throughout pipeline
- Admin notifications when ready for review
- Batch processing support

**Key Functions:**

- `processDraft()` - Process single draft through AI pipeline
- `batchProcessDrafts()` - Process multiple drafts concurrently
- `getProcessingStats()` - Get processing statistics

**Processing Steps:**

1. **Transcription** - Convert audio/video to text
2. **Translation** - Translate to all languages
3. **Generation** - Generate product metadata
4. **Storage** - Save results to Firestore

**Error Handling:**

- Automatic retry with exponential backoff
- Non-retryable errors fail immediately
- Status updates on failure
- Detailed error logging

**Requirements:** 2.1-2.7

### 9. Draft Integration (`lib/whatsapp/draft-integration.ts`)

**Purpose:** High-level integration between sessions and drafts

**Features:**

- Session completion handling
- Draft creation status checking
- Reprocessing failed drafts
- Status reporting

**Key Functions:**

- `handleSessionCompletion()` - Main entry point for webhook
- `shouldCreateDraft()` - Check if session should trigger draft
- `getDraftCreationStatus()` - Get detailed status
- `reprocessDraft()` - Reprocess failed draft

**Usage Example:**

```typescript
// In webhook after receiving media
const session = await getOrCreateSession(phone);
await addMediaToSession(session.id, "image", imageUrl);

// Check if ready to create draft
if (shouldCreateDraft(session)) {
  const draftId = await handleSessionCompletion(session.id);
  console.log(`Draft created: ${draftId}`);
}
```

## Product Draft System

### Firestore Collections

#### `productDrafts` Collection

**Schema:**

```typescript
{
  id: string;
  sellerId: string;
  sellerPhone: string;
  sellerName: string;
  status: "pending" | "processing" | "review" | "approved" | "rejected";
  submittedAt: Timestamp;
  processedAt?: Timestamp;
  reviewedAt?: Timestamp;

  originalMedia: {
    images: string[];      // Cloudinary URLs
    audio?: string;        // Cloudinary URL
    video?: string;        // Cloudinary URL
    textMessages: string[];
  };

  aiProcessing: {
    transcription: {
      text: string;
      detectedLanguage: string;
      confidence: number;
    };
    translations: {
      [languageCode: string]: {
        title: string;
        description: string;
      };
    };
    generated: {
      category: string;
      subcategory?: string;
      tags: string[];
      suggestedPrice?: number;
      materials: string[];
      techniques: string[];
      region?: string;
      confidence: number;
    };
  };

  adminReview?: {
    reviewerId: string;
    reviewerName: string;
    reviewedAt: Timestamp;
    action: "approved" | "rejected";
    feedback?: string;
    edits: {
      title?: { [lang: string]: string };
      description?: { [lang: string]: string };
      category?: string;
      tags?: string[];
      price?: number;
      stock?: number;
    };
  };

  productId?: string;  // Linked product after approval
}
```

**Indexes:**

- `sellerId` + `submittedAt` (desc) - Query seller's drafts
- `status` + `submittedAt` (desc) - Query by status
- `submittedAt` (desc) - Admin view all drafts

**Security Rules:**

- Sellers can read their own drafts
- Admins can read all drafts
- System can create drafts (webhook)
- Admins and sellers can update drafts
- No deletion allowed

### Draft Status Flow

```
pending → processing → review → approved/rejected
                                    ↓
                              (creates product)
```

### Supported Languages

All drafts include translations for:

- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Bengali (bn)
- Marathi (mr)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)

### 10. Order Notification System

**Purpose:** Automatically send WhatsApp notifications to artisans for orders

**Components:**

- `order-notification-listener.ts` - Listens for new orders in Firestore
- `notification-message-generator.ts` - Generates multilingual notification messages
- `status-notification-handler.ts` - Handles status update notifications with retry
- `order-notifications.ts` - Main integration API

**Features:**

- Real-time order notifications when orders are placed
- Status update notifications (ready for pickup, picked up, delivered)
- Multilingual support (10 Indian languages)
- Automatic language detection from seller profile
- Retry logic with exponential backoff
- Rate limiting compliance
- Batch notification support

**Key Functions:**

- `initializeSellerOrderNotifications()` - Start listening for seller's orders
- `notifyOrderStatusChange()` - Send notification on status change
- `notifyReadyForPickup()` - Send ready for pickup notification
- `notifyPickedUp()` - Send picked up notification
- `notifyDelivered()` - Send delivered notification
- `notifyBatchOrders()` - Send notifications to multiple orders

**Notification Types:**

1. **New Order** - Sent when order is placed (status: pending)
2. **Ready for Pickup** - Sent when order is accepted
3. **Picked Up** - Sent when logistics picks up product
4. **Delivered** - Sent when order is completed

**Language Detection:**

- Checks seller's `preferredLanguage` field
- Falls back to location-based detection
- Defaults to Hindi if no preference found

**Integration:**

The `updateOrderStatus()` function in `lib/firebase/orders.ts` automatically sends notifications when order status changes.

**Usage Example:**

```typescript
import { initializeSellerOrderNotifications } from "@/lib/whatsapp/order-notifications";

// In seller dashboard
useEffect(() => {
  if (user?.role === "seller") {
    const unsubscribe = initializeSellerOrderNotifications(user.uid);
    return () => unsubscribe();
  }
}, [user]);
```

**Documentation:** See [WHATSAPP_ORDER_NOTIFICATIONS.md](../../docs/WHATSAPP_ORDER_NOTIFICATIONS.md)

**Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5

## Next Steps

This infrastructure is ready for:

- ✅ Task 4: Session management (COMPLETED)
- ✅ Task 5: Product draft system (COMPLETED)
- ✅ Task 10: Order notification system (COMPLETED)
- Task 6: Admin panel for review
- Task 11: Artisan onboarding flow

## Troubleshooting

### Webhook not receiving messages

1. Check ngrok is running
2. Verify webhook URL in Meta dashboard
3. Check verify token matches
4. Review Meta webhook logs

### Media download failing

1. Check WHATSAPP_ACCESS_TOKEN is valid
2. Verify media ID is correct
3. Check Cloudinary credentials
4. Review retry logs

### Messages not sending

1. Check WHATSAPP_PHONE_NUMBER_ID
2. Verify WHATSAPP_ACCESS_TOKEN
3. Check rate limits
4. Review WhatsApp API status

### Signature verification failing

1. Check WHATSAPP_APP_SECRET is correct
2. Verify request is from WhatsApp
3. Check for proxy/middleware modifying body

## API Reference

See individual file documentation for detailed API references:

- [Webhook Route](../app/api/webhooks/whatsapp/route.ts)
- [Message Parser](./message-parser.ts)
- [Message Handler](./message-handler.ts)
- [Media Handler](./media-handler.ts)
- [Message Sender](./message-sender.ts)
