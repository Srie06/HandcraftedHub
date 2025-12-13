/**
 * Draft Integration Module
 * 
 * This module provides high-level functions to integrate draft creation
 * with the WhatsApp webhook and session management.
 */

import { WhatsAppSession } from "@/types";
import { getSession, updateSessionStep } from "./session-manager";
import { createDraftFromSession, isSessionReadyForDraft } from "./draft-workflow";
import { processDraft } from "./draft-processor";

/**
 * Handle session completion and draft creation
 * This is the main entry point called when a session is ready to be processed
 * 
 * @param sessionId - Session ID
 * @returns Draft ID if created, null otherwise
 */
export async function handleSessionCompletion(
  sessionId: string
): Promise<string | null> {
  try {
    console.log(`Handling completion for session ${sessionId}`);

    // Get the session
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Check if session is ready for draft creation
    if (!isSessionReadyForDraft(session)) {
      console.log(`Session ${sessionId} not ready for draft creation`);
      return null;
    }

    // Check if draft already exists
    if (session.draftId) {
      console.log(`Session ${sessionId} already has draft ${session.draftId}`);
      return session.draftId;
    }

    // Update session to processing step
    await updateSessionStep(sessionId, "processing");

    // Create draft from session
    console.log(`Creating draft from session ${sessionId}`);
    const draftId = await createDraftFromSession(session);

    console.log(`Draft ${draftId} created from session ${sessionId}`);

    // Note: The draft is created with status "review" by the workflow
    // No additional processing needed as AI services are already called
    // during draft creation

    return draftId;
  } catch (error: any) {
    console.error(`Error handling session completion:`, error);
    throw error;
  }
}

/**
 * Reprocess a draft that failed or needs updating
 * 
 * @param draftId - Draft ID
 * @returns Processing result
 */
export async function reprocessDraft(draftId: string) {
  try {
    console.log(`Reprocessing draft ${draftId}`);
    return await processDraft(draftId);
  } catch (error: any) {
    console.error(`Error reprocessing draft ${draftId}:`, error);
    throw error;
  }
}

/**
 * Check if a session should trigger draft creation
 * This can be called after each message to determine if we should process
 * 
 * @param session - WhatsApp session
 * @returns True if should create draft
 */
export function shouldCreateDraft(session: WhatsAppSession): boolean {
  // Don't create if already has draft
  if (session.draftId) {
    return false;
  }

  // Don't create if session is not active
  if (session.status !== "active") {
    return false;
  }

  // Check if session has sufficient media
  return isSessionReadyForDraft(session);
}

/**
 * Get draft creation status for a session
 * 
 * @param session - WhatsApp session
 * @returns Status object
 */
export function getDraftCreationStatus(session: WhatsAppSession): {
  ready: boolean;
  hasImages: boolean;
  hasAudioOrVideo: boolean;
  hasDraft: boolean;
  draftId?: string;
  missingItems: string[];
} {
  const hasImages = session.collectedMedia.images.length > 0;
  const hasAudioOrVideo = !!(
    session.collectedMedia.audio || session.collectedMedia.video
  );
  const hasDraft = !!session.draftId;
  const ready = hasImages && hasAudioOrVideo && !hasDraft;

  const missingItems: string[] = [];
  if (!hasImages) {
    missingItems.push("images");
  }
  if (!hasAudioOrVideo) {
    missingItems.push("audio or video");
  }

  return {
    ready,
    hasImages,
    hasAudioOrVideo,
    hasDraft,
    draftId: session.draftId,
    missingItems,
  };
}
