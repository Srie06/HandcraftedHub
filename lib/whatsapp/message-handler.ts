/**
 * WhatsApp Message Handler
 * Orchestrates message processing, session management, and AI workflow
 */

import { parseMessage, ParsedMessage } from './message-parser';
import { downloadAndUploadMedia, DownloadedMedia } from './media-handler';
import { sendTextMessage } from './message-sender';

export interface IncomingMessage {
  messageId: string;
  from: string;
  type: string;
  timestamp: number;
  content: any;
  metadata: any;
}

/**
 * Handle an incoming WhatsApp message
 * This is the main entry point for message processing
 */
export async function handleIncomingMessage(message: IncomingMessage): Promise<void> {
  console.log('[Message Handler] Processing incoming message:', {
    messageId: message.messageId,
    from: message.from,
    type: message.type,
  });

  try {
    // Parse the message
    const parsedMessage = parseMessage(message.content, message.metadata);

    // Check if this is a first-time user
    const { isFirstTimeUser, detectLanguageFromText, sendWelcomeMessage, processOnboardingResponse, getOnboardingStatus } = await import('./onboarding-handler');
    const isNewUser = await isFirstTimeUser(parsedMessage.from);

    if (isNewUser) {
      console.log('[Message Handler] First-time user detected:', parsedMessage.from);
      
      // Detect language from text message if available
      let detectedLang = 'hi'; // Default to Hindi
      if (parsedMessage.type === 'text') {
        const text = (parsedMessage.content as any)?.body || '';
        detectedLang = detectLanguageFromText(text);
      }

      // Send welcome message and start onboarding
      await sendWelcomeMessage(parsedMessage.from, detectedLang);
      return;
    }

    // Check if user is in onboarding process
    const onboardingStatus = await getOnboardingStatus(parsedMessage.from);
    if (onboardingStatus && onboardingStatus.step !== 'completed') {
      console.log('[Message Handler] User in onboarding:', parsedMessage.from, 'step:', onboardingStatus.step);
      
      // Only process text messages during onboarding
      if (parsedMessage.type === 'text') {
        const text = (parsedMessage.content as any)?.body || '';
        const isComplete = await processOnboardingResponse(parsedMessage.from, text);
        
        if (isComplete) {
          console.log('[Message Handler] Onboarding completed for:', parsedMessage.from);
        }
      } else {
        // Inform user to complete onboarding first
        await sendTextMessage(
          parsedMessage.from,
          'Please complete the registration by answering the questions first. 😊'
        );
      }
      return;
    }

    // Get or create session for this user
    const session = await getOrCreateSession(parsedMessage.from);

    // Update session with new message
    await updateSession(session.id, parsedMessage);

    // Process based on message type
    switch (parsedMessage.type) {
      case 'text':
        await handleTextMessage(parsedMessage, session);
        break;
      case 'image':
        await handleImageMessage(parsedMessage, session);
        break;
      case 'audio':
        await handleAudioMessage(parsedMessage, session);
        break;
      case 'video':
        await handleVideoMessage(parsedMessage, session);
        break;
      default:
        console.warn('[Message Handler] Unsupported message type:', parsedMessage.type);
        await sendTextMessage(
          parsedMessage.from,
          'Sorry, I can only process text, images, audio, and video messages.'
        );
    }
  } catch (error) {
    console.error('[Message Handler] Error handling message:', error);
    
    // Send error message to user
    try {
      await sendTextMessage(
        message.from,
        'Sorry, there was an error processing your message. Please try again.'
      );
    } catch (sendError) {
      console.error('[Message Handler] Failed to send error message:', sendError);
    }
  }
}

/**
 * Handle text message
 */
async function handleTextMessage(message: ParsedMessage, session: any): Promise<void> {
  const text = (message.content as any)?.body || '';
  
  console.log('[Message Handler] Handling text message:', {
    from: message.from,
    textLength: text.length,
  });

  // Check for commands
  const command = text.trim().toUpperCase();

  switch (command) {
    case 'HELP':
      await sendHelpMessage(message.from);
      break;
    case 'ORDERS':
      await sendOrdersInfo(message.from);
      break;
    case 'STATUS':
      await sendSessionStatus(message.from, session);
      break;
    default:
      // Regular text - add to session notes
      await sendTextMessage(
        message.from,
        'Got it! You can also send photos, voice messages, or videos of your product.'
      );
  }
}

/**
 * Handle image message
 */
async function handleImageMessage(message: ParsedMessage, session: any): Promise<void> {
  console.log('[Message Handler] Handling image message:', {
    from: message.from,
    mediaId: (message.content as any)?.id,
  });

  try {
    // Send acknowledgment
    await sendTextMessage(
      message.from,
      '📸 Got your image! Processing...'
    );

    // Download and upload media
    const mediaContent = message.content as any;
    const downloadedMedia = await downloadAndUploadMedia(
      mediaContent.id,
      mediaContent.mimeType,
      'whatsapp-products'
    );

    console.log('[Message Handler] Image processed:', downloadedMedia.cloudinaryUrl);

    // Send confirmation
    await sendTextMessage(
      message.from,
      `✅ Image received! You can send up to 3 images total.\n\nSend a voice message or video to describe your product, or type "DONE" when finished.`
    );
  } catch (error) {
    console.error('[Message Handler] Error processing image:', error);
    await sendTextMessage(
      message.from,
      '❌ Sorry, there was an error processing your image. Please try again.'
    );
  }
}

/**
 * Handle audio message
 */
async function handleAudioMessage(message: ParsedMessage, session: any): Promise<void> {
  console.log('[Message Handler] Handling audio message:', {
    from: message.from,
    mediaId: (message.content as any)?.id,
  });

  try {
    // Send acknowledgment
    await sendTextMessage(
      message.from,
      '🎤 Got your voice message! Processing...'
    );

    // Download and upload media
    const mediaContent = message.content as any;
    const downloadedMedia = await downloadAndUploadMedia(
      mediaContent.id,
      mediaContent.mimeType,
      'whatsapp-audio'
    );

    console.log('[Message Handler] Audio processed:', downloadedMedia.cloudinaryUrl);

    // Send confirmation
    await sendTextMessage(
      message.from,
      `✅ Voice message received! I'll transcribe it and create your product listing.\n\nProcessing will take a few moments. You'll be notified when it's ready for review.`
    );

    // TODO: Trigger AI processing workflow
    // This will be implemented in task 5 (product draft system)
  } catch (error) {
    console.error('[Message Handler] Error processing audio:', error);
    await sendTextMessage(
      message.from,
      '❌ Sorry, there was an error processing your voice message. Please try again.'
    );
  }
}

/**
 * Handle video message
 */
async function handleVideoMessage(message: ParsedMessage, session: any): Promise<void> {
  console.log('[Message Handler] Handling video message:', {
    from: message.from,
    mediaId: (message.content as any)?.id,
  });

  try {
    // Send acknowledgment
    await sendTextMessage(
      message.from,
      '📹 Got your video! Processing...'
    );

    // Download and upload media
    const mediaContent = message.content as any;
    const downloadedMedia = await downloadAndUploadMedia(
      mediaContent.id,
      mediaContent.mimeType,
      'whatsapp-videos'
    );

    console.log('[Message Handler] Video processed:', downloadedMedia.cloudinaryUrl);

    // Send confirmation
    await sendTextMessage(
      message.from,
      `✅ Video received! I'll extract the audio and create your product listing.\n\nProcessing will take a few moments. You'll be notified when it's ready for review.`
    );

    // TODO: Trigger AI processing workflow
    // This will be implemented in task 5 (product draft system)
  } catch (error) {
    console.error('[Message Handler] Error processing video:', error);
    await sendTextMessage(
      message.from,
      '❌ Sorry, there was an error processing your video. Please try again.'
    );
  }
}

/**
 * Send help message
 */
async function sendHelpMessage(phoneNumber: string): Promise<void> {
  const helpMessage = `📱 *HandcraftedHub Help*

*How to list a product:*
1. Send 1-3 photos of your product 📸
2. Send a voice message or video describing it 🎤
3. I'll create a listing for you!

*Commands:*
• HELP - Show this message
• ORDERS - View your orders
• STATUS - Check your current session

Need more help? Contact support at support@handcraftedhub.com`;

  await sendTextMessage(phoneNumber, helpMessage);
}

/**
 * Send orders info
 */
async function sendOrdersInfo(phoneNumber: string): Promise<void> {
  // TODO: Fetch actual orders from database
  await sendTextMessage(
    phoneNumber,
    '📦 *Your Orders*\n\nYou can view all your orders in the seller dashboard.\n\nWe\'ll send you WhatsApp notifications when you receive new orders!'
  );
}

/**
 * Send session status
 */
async function sendSessionStatus(phoneNumber: string, session: any): Promise<void> {
  const status = `📊 *Session Status*

Images: ${session.collectedMedia?.images?.length || 0}/3
Audio: ${session.collectedMedia?.audio ? '✅' : '❌'}
Video: ${session.collectedMedia?.video ? '✅' : '❌'}

Status: ${session.currentStep || 'collecting_media'}

${session.collectedMedia?.images?.length > 0 ? 'Send a voice message or video to complete your listing!' : 'Send product photos to get started!'}`;

  await sendTextMessage(phoneNumber, status);
}

/**
 * Get or create a session for a user
 * TODO: Implement actual Firestore session management in task 4
 */
async function getOrCreateSession(phoneNumber: string): Promise<any> {
  // Placeholder - will be implemented in task 4
  return {
    id: `session_${phoneNumber}_${Date.now()}`,
    phone: phoneNumber,
    status: 'active',
    startedAt: Date.now(),
    lastMessageAt: Date.now(),
    currentStep: 'collecting_media',
    collectedMedia: {
      images: [],
      audio: null,
      video: null,
      textNotes: [],
    },
  };
}

/**
 * Update session with new message
 * TODO: Implement actual Firestore session updates in task 4
 */
async function updateSession(sessionId: string, message: ParsedMessage): Promise<void> {
  // Placeholder - will be implemented in task 4
  console.log('[Message Handler] Session updated:', sessionId);
}
