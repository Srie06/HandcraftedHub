import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * WhatsApp session status
 */
export type SessionStatus = "active" | "completed" | "expired";

/**
 * Session state machine steps
 */
export type SessionStep =
  | "greeting"
  | "collecting_media"
  | "processing"
  | "completed";

/**
 * Message in a session
 */
export interface SessionMessage {
  id: string;
  type: "text" | "image" | "audio" | "video";
  content: string;
  timestamp: Timestamp;
  processed: boolean;
}

/**
 * Collected media in a session
 */
export interface CollectedMedia {
  images: string[];
  audio?: string;
  video?: string;
  textNotes: string[];
}

/**
 * WhatsApp session document
 */
export interface WhatsAppSession {
  id: string;
  phone: string;
  sellerId?: string;
  status: SessionStatus;
  startedAt: Timestamp;
  lastMessageAt: Timestamp;
  expiresAt: Timestamp;
  messages: SessionMessage[];
  collectedMedia: CollectedMedia;
  currentStep: SessionStep;
  draftId?: string;
}

const COLLECTION_NAME = "whatsappSessions";
const SESSION_TIMEOUT_MINUTES = 30;

/**
 * Create a new WhatsApp session
 * @param phone - Artisan's phone number
 * @param sellerId - Optional seller ID if already registered
 * @returns Created session
 */
export async function createSession(
  phone: string,
  sellerId?: string
): Promise<WhatsAppSession> {
  try {
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      now.toMillis() + SESSION_TIMEOUT_MINUTES * 60 * 1000
    );

    const sessionData: Omit<WhatsAppSession, "id"> = {
      phone,
      sellerId,
      status: "active",
      startedAt: now,
      lastMessageAt: now,
      expiresAt,
      messages: [],
      collectedMedia: {
        images: [],
        textNotes: [],
      },
      currentStep: "greeting",
    };

    const sessionRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(sessionRef, sessionData);

    return {
      id: sessionRef.id,
      ...sessionData,
    };
  } catch (error: any) {
    console.error("Error creating WhatsApp session:", error);
    throw new Error(error.message || "Failed to create session");
  }
}

/**
 * Get active session for a phone number
 * @param phone - Artisan's phone number
 * @returns Active session or null
 */
export async function getActiveSession(
  phone: string
): Promise<WhatsAppSession | null> {
  try {
    const sessionsRef = collection(db, COLLECTION_NAME);
    const q = query(
      sessionsRef,
      where("phone", "==", phone),
      where("status", "==", "active")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    // Get the most recent active session
    const sessions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WhatsAppSession[];

    // Sort by lastMessageAt descending
    sessions.sort(
      (a, b) => b.lastMessageAt.toMillis() - a.lastMessageAt.toMillis()
    );

    const session = sessions[0];

    // Check if session has expired
    if (session.expiresAt.toMillis() < Date.now()) {
      await expireSession(session.id);
      return null;
    }

    return session;
  } catch (error: any) {
    console.error("Error getting active session:", error);
    throw new Error(error.message || "Failed to get active session");
  }
}

/**
 * Get session by ID
 * @param sessionId - Session ID
 * @returns Session or null
 */
export async function getSession(
  sessionId: string
): Promise<WhatsAppSession | null> {
  try {
    const sessionRef = doc(db, COLLECTION_NAME, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return null;
    }

    return {
      id: sessionSnap.id,
      ...sessionSnap.data(),
    } as WhatsAppSession;
  } catch (error: any) {
    console.error("Error getting session:", error);
    throw new Error(error.message || "Failed to get session");
  }
}

/**
 * Add a message to a session
 * @param sessionId - Session ID
 * @param message - Message to add
 */
export async function addMessageToSession(
  sessionId: string,
  message: Omit<SessionMessage, "id">
): Promise<void> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      now.toMillis() + SESSION_TIMEOUT_MINUTES * 60 * 1000
    );

    const newMessage: SessionMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...message,
    };

    const sessionRef = doc(db, COLLECTION_NAME, sessionId);
    await updateDoc(sessionRef, {
      messages: [...session.messages, newMessage],
      lastMessageAt: now,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Error adding message to session:", error);
    throw new Error(error.message || "Failed to add message");
  }
}

/**
 * Add media to session's collected media
 * @param sessionId - Session ID
 * @param mediaType - Type of media
 * @param mediaUrl - URL of the media
 */
export async function addMediaToSession(
  sessionId: string,
  mediaType: "image" | "audio" | "video" | "text",
  mediaUrl: string
): Promise<void> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const updatedMedia = { ...session.collectedMedia };

    switch (mediaType) {
      case "image":
        updatedMedia.images = [...updatedMedia.images, mediaUrl];
        break;
      case "audio":
        updatedMedia.audio = mediaUrl;
        break;
      case "video":
        updatedMedia.video = mediaUrl;
        break;
      case "text":
        updatedMedia.textNotes = [...updatedMedia.textNotes, mediaUrl];
        break;
    }

    const sessionRef = doc(db, COLLECTION_NAME, sessionId);
    await updateDoc(sessionRef, {
      collectedMedia: updatedMedia,
    });
  } catch (error: any) {
    console.error("Error adding media to session:", error);
    throw new Error(error.message || "Failed to add media");
  }
}

/**
 * Update session step in state machine
 * @param sessionId - Session ID
 * @param step - New step
 */
export async function updateSessionStep(
  sessionId: string,
  step: SessionStep
): Promise<void> {
  try {
    const sessionRef = doc(db, COLLECTION_NAME, sessionId);
    await updateDoc(sessionRef, {
      currentStep: step,
    });
  } catch (error: any) {
    console.error("Error updating session step:", error);
    throw new Error(error.message || "Failed to update session step");
  }
}

/**
 * Complete a session
 * @param sessionId - Session ID
 * @param draftId - Optional product draft ID
 */
export async function completeSession(
  sessionId: string,
  draftId?: string
): Promise<void> {
  try {
    const sessionRef = doc(db, COLLECTION_NAME, sessionId);
    const updateData: any = {
      status: "completed",
      currentStep: "completed",
    };

    if (draftId) {
      updateData.draftId = draftId;
    }

    await updateDoc(sessionRef, updateData);
  } catch (error: any) {
    console.error("Error completing session:", error);
    throw new Error(error.message || "Failed to complete session");
  }
}

/**
 * Expire a session due to timeout
 * @param sessionId - Session ID
 */
export async function expireSession(sessionId: string): Promise<void> {
  try {
    const sessionRef = doc(db, COLLECTION_NAME, sessionId);
    await updateDoc(sessionRef, {
      status: "expired",
    });
  } catch (error: any) {
    console.error("Error expiring session:", error);
    throw new Error(error.message || "Failed to expire session");
  }
}

/**
 * Get or create session for a phone number
 * Creates a new session if no active session exists
 * @param phone - Artisan's phone number
 * @param sellerId - Optional seller ID
 * @returns Active or newly created session
 */
export async function getOrCreateSession(
  phone: string,
  sellerId?: string
): Promise<WhatsAppSession> {
  try {
    const activeSession = await getActiveSession(phone);

    if (activeSession) {
      return activeSession;
    }

    return await createSession(phone, sellerId);
  } catch (error: any) {
    console.error("Error getting or creating session:", error);
    throw new Error(error.message || "Failed to get or create session");
  }
}

/**
 * Check if session should transition to processing
 * A session is ready for processing when it has collected sufficient media
 * @param session - WhatsApp session
 * @returns True if ready for processing
 */
export function isSessionReadyForProcessing(
  session: WhatsAppSession
): boolean {
  const { images, audio, video } = session.collectedMedia;

  // Session is ready if it has at least one image and either audio or video
  return images.length > 0 && (!!audio || !!video);
}

/**
 * Transition session through state machine
 * @param sessionId - Session ID
 * @param currentStep - Current step
 * @returns Next step or null if no transition needed
 */
export async function transitionSessionState(
  sessionId: string
): Promise<SessionStep | null> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    let nextStep: SessionStep | null = null;

    switch (session.currentStep) {
      case "greeting":
        // Transition to collecting_media after greeting
        nextStep = "collecting_media";
        break;

      case "collecting_media":
        // Transition to processing if we have sufficient media
        if (isSessionReadyForProcessing(session)) {
          nextStep = "processing";
        }
        break;

      case "processing":
        // Transition to completed after processing
        nextStep = "completed";
        break;

      case "completed":
        // No further transitions
        nextStep = null;
        break;
    }

    if (nextStep) {
      await updateSessionStep(sessionId, nextStep);
    }

    return nextStep;
  } catch (error: any) {
    console.error("Error transitioning session state:", error);
    throw new Error(error.message || "Failed to transition session state");
  }
}
