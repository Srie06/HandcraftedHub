/**
 * Example: How to integrate session management with message handling
 * 
 * This file demonstrates the typical flow of using the session manager
 * with incoming WhatsApp messages.
 */

import {
  getOrCreateSession,
  addMessageToSession,
  addMediaToSession,
  updateSessionStep,
  transitionSessionState,
  isSessionReadyForProcessing,
  completeSession,
} from "./session-manager";
import { parseMessage } from "./message-parser";
import { sendTextMessage } from "./message-sender";
import { downloadAndUploadMedia } from "./media-handler";
import { Timestamp } from "firebase/firestore";

/**
 * Example 1: Handle incoming text message
 */
export async function handleTextMessage(
  phone: string,
  text: string
): Promise<void> {
  // Get or create session
  const session = await getOrCreateSession(phone);

  // Add message to session
  await addMessageToSession(session.id, {
    type: "text",
    content: text,
    timestamp: Timestamp.now(),
    processed: false,
  });

  // Add to text notes
  await addMediaToSession(session.id, "text", text);

  // Send acknowledgment
  await sendTextMessage(
    phone,
    "Thank you! I've noted that. Please send product images and a voice description."
  );

  // Transition state if needed
  if (session.currentStep === "greeting") {
    await updateSessionStep(session.id, "collecting_media");
  }
}

/**
 * Example 2: Handle incoming image message
 */
export async function handleImageMessage(
  phone: string,
  mediaId: string,
  caption?: string
): Promise<void> {
  // Get or create session
  const session = await getOrCreateSession(phone);

  // Download and upload image
  const downloadedMedia = await downloadAndUploadMedia(mediaId, "image/jpeg");
  const imageUrl = downloadedMedia.cloudinaryUrl;

  // Add to session
  await addMediaToSession(session.id, "image", imageUrl);

  // Add message to history
  await addMessageToSession(session.id, {
    type: "image",
    content: imageUrl,
    timestamp: Timestamp.now(),
    processed: false,
  });

  // If caption provided, add as text note
  if (caption) {
    await addMediaToSession(session.id, "text", caption);
  }

  // Send acknowledgment
  const imageCount = session.collectedMedia.images.length + 1;
  await sendTextMessage(
    phone,
    `Image ${imageCount} received! You can send up to 3 images. Send a voice note to describe your product.`
  );

  // Update state
  if (session.currentStep === "greeting") {
    await updateSessionStep(session.id, "collecting_media");
  }
}

/**
 * Example 3: Handle incoming audio message
 */
export async function handleAudioMessage(
  phone: string,
  mediaId: string
): Promise<void> {
  // Get or create session
  const session = await getOrCreateSession(phone);

  // Download and upload audio
  const downloadedMedia = await downloadAndUploadMedia(mediaId, "audio/ogg");
  const audioUrl = downloadedMedia.cloudinaryUrl;

  // Add to session
  await addMediaToSession(session.id, "audio", audioUrl);

  // Add message to history
  await addMessageToSession(session.id, {
    type: "audio",
    content: audioUrl,
    timestamp: Timestamp.now(),
    processed: false,
  });

  // Send acknowledgment
  await sendTextMessage(
    phone,
    "Voice message received! Processing your product listing..."
  );

  // Check if ready for processing
  const updatedSession = await getOrCreateSession(phone);
  if (isSessionReadyForProcessing(updatedSession)) {
    // Transition to processing
    await updateSessionStep(session.id, "processing");

    // Trigger AI processing (task 5)
    await triggerAIProcessing(session.id);
  }
}

/**
 * Example 4: Handle incoming video message
 */
export async function handleVideoMessage(
  phone: string,
  mediaId: string,
  caption?: string
): Promise<void> {
  // Get or create session
  const session = await getOrCreateSession(phone);

  // Download and upload video
  const downloadedMedia = await downloadAndUploadMedia(mediaId, "video/mp4");
  const videoUrl = downloadedMedia.cloudinaryUrl;

  // Add to session
  await addMediaToSession(session.id, "video", videoUrl);

  // Add message to history
  await addMessageToSession(session.id, {
    type: "video",
    content: videoUrl,
    timestamp: Timestamp.now(),
    processed: false,
  });

  // If caption provided, add as text note
  if (caption) {
    await addMediaToSession(session.id, "text", caption);
  }

  // Send acknowledgment
  await sendTextMessage(
    phone,
    "Video received! Processing your product listing..."
  );

  // Check if ready for processing
  const updatedSession = await getOrCreateSession(phone);
  if (isSessionReadyForProcessing(updatedSession)) {
    // Transition to processing
    await updateSessionStep(session.id, "processing");

    // Trigger AI processing (task 5)
    await triggerAIProcessing(session.id);
  }
}

/**
 * Example 5: Complete session after AI processing
 */
export async function handleProcessingComplete(
  sessionId: string,
  draftId: string
): Promise<void> {
  // Complete the session
  await completeSession(sessionId, draftId);

  // Get session to send notification
  const { getSession } = await import("./session-manager");
  const session = await getSession(sessionId);

  if (session) {
    // Notify artisan
    await sendTextMessage(
      session.phone,
      `Great! Your product has been submitted for review. You'll receive a notification once it's approved. Draft ID: ${draftId}`
    );
  }
}

/**
 * Placeholder for AI processing trigger (task 5)
 */
async function triggerAIProcessing(sessionId: string): Promise<void> {
  // This will be implemented in task 5
  console.log(`[Session Integration] Triggering AI processing for session ${sessionId}`);
  
  // Future implementation:
  // 1. Get session data
  // 2. Transcribe audio/video
  // 3. Translate to all languages
  // 4. Generate product data
  // 5. Create product draft
  // 6. Complete session with draft ID
}

/**
 * Example 6: Handle session timeout
 */
export async function checkAndExpireSessions(): Promise<void> {
  // This would typically run as a scheduled job
  // For now, it's a placeholder showing the concept
  
  console.log("[Session Integration] Checking for expired sessions...");
  
  // Future implementation:
  // 1. Query all active sessions
  // 2. Check expiration time
  // 3. Expire sessions past timeout
  // 4. Optionally notify artisans
}

/**
 * Example 7: Resume session flow
 */
export async function resumeSession(phone: string): Promise<void> {
  const session = await getOrCreateSession(phone);

  // Provide context based on current step
  switch (session.currentStep) {
    case "greeting":
      await sendTextMessage(
        phone,
        "Welcome! Send me photos of your product and a voice description to get started."
      );
      break;

    case "collecting_media":
      const imageCount = session.collectedMedia.images.length;
      const hasAudio = !!session.collectedMedia.audio;
      const hasVideo = !!session.collectedMedia.video;

      if (imageCount === 0) {
        await sendTextMessage(
          phone,
          "Please send 1-3 photos of your product to continue."
        );
      } else if (!hasAudio && !hasVideo) {
        await sendTextMessage(
          phone,
          `I have ${imageCount} image(s). Please send a voice note or video describing your product.`
        );
      } else {
        await sendTextMessage(
          phone,
          "I have your media. Processing your product listing..."
        );
      }
      break;

    case "processing":
      await sendTextMessage(
        phone,
        "Your product is being processed. You'll receive a notification soon!"
      );
      break;

    case "completed":
      await sendTextMessage(
        phone,
        "Your previous submission is complete. Send new photos to list another product!"
      );
      break;
  }
}
