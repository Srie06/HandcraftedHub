/**
 * Product Draft Creation Workflow
 * 
 * This module handles the creation of product drafts from completed WhatsApp sessions.
 * It orchestrates the AI processing pipeline and stores results in Firestore.
 * 
 * Requirements: 1.4, 2.7
 */

import { Timestamp } from "firebase/firestore";
import { WhatsAppSession } from "@/types";
import { createProductDraft } from "../firebase/product-drafts";
import {
  mockTranscribeAudio,
  mockTranslate,
  mockGenerateProduct,
  SUPPORTED_LANGUAGES,
  LanguageCode,
} from "../ai/mock-services";
import { completeSession } from "./session-manager";

/**
 * Create a product draft from a completed WhatsApp session
 * Triggers AI processing and stores all results
 * 
 * @param session - Completed WhatsApp session
 * @returns Draft ID
 */
export async function createDraftFromSession(
  session: WhatsAppSession
): Promise<string> {
  try {
    console.log(`Creating draft from session ${session.id}`);

    // Validate session has required media
    if (session.collectedMedia.images.length === 0) {
      throw new Error("Session must have at least one image");
    }

    if (!session.collectedMedia.audio && !session.collectedMedia.video) {
      throw new Error("Session must have audio or video");
    }

    // Step 1: Transcribe audio/video
    console.log("Step 1: Transcribing audio...");
    const audioUrl = session.collectedMedia.audio || session.collectedMedia.video || "";
    const transcriptionResult = await mockTranscribeAudio(audioUrl);

    console.log(`Transcription complete: ${transcriptionResult.language} (${transcriptionResult.confidence})`);

    // Step 2: Translate to all supported languages
    console.log("Step 2: Translating to all languages...");
    const targetLanguages = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
    const translationResults = await mockTranslate(
      transcriptionResult.text,
      transcriptionResult.language,
      targetLanguages
    );

    console.log(`Translation complete for ${Object.keys(translationResults).length} languages`);

    // Step 3: Generate product data
    console.log("Step 3: Generating product data...");
    const productGeneration = await mockGenerateProduct(
      transcriptionResult.text,
      transcriptionResult.language,
      session.collectedMedia.images
    );

    console.log(`Product generation complete: ${productGeneration.category} (${productGeneration.confidence})`);

    // Step 4: Format translations for storage
    const translations: Record<string, { title: string; description: string }> = {};
    for (const lang of targetLanguages) {
      translations[lang] = {
        title: productGeneration.title[lang] || productGeneration.title.en,
        description: translationResults[lang] || transcriptionResult.text,
      };
    }

    // Step 5: Get seller information
    // In a real implementation, this would fetch from the users collection
    // For now, we'll use placeholder data
    const sellerName = session.sellerId ? `Seller ${session.sellerId}` : "Unknown Artisan";

    // Step 6: Create the product draft
    console.log("Step 4: Creating product draft in Firestore...");
    const draftId = await createProductDraft({
      sellerId: session.sellerId || "unknown",
      sellerPhone: session.phone,
      sellerName,
      status: "review",
      processedAt: Timestamp.now(),
      originalMedia: {
        images: session.collectedMedia.images,
        audio: session.collectedMedia.audio,
        video: session.collectedMedia.video,
        textMessages: session.collectedMedia.textNotes,
      },
      aiProcessing: {
        transcription: {
          text: transcriptionResult.text,
          detectedLanguage: transcriptionResult.language,
          confidence: transcriptionResult.confidence,
        },
        translations,
        generated: {
          category: productGeneration.category,
          subcategory: productGeneration.subcategory,
          tags: productGeneration.tags,
          suggestedPrice: productGeneration.suggestedPrice,
          materials: productGeneration.materials,
          techniques: productGeneration.techniques,
          region: productGeneration.region,
          confidence: productGeneration.confidence,
        },
      },
    });

    console.log(`Draft created successfully: ${draftId}`);

    // Step 7: Update session with draft ID
    await completeSession(session.id, draftId);

    return draftId;
  } catch (error: any) {
    console.error("Error creating draft from session:", error);
    throw new Error(error.message || "Failed to create draft from session");
  }
}

/**
 * Check if a session is ready for draft creation
 * 
 * @param session - WhatsApp session
 * @returns True if session has sufficient media
 */
export function isSessionReadyForDraft(session: WhatsAppSession): boolean {
  const hasImages = session.collectedMedia.images.length > 0;
  const hasAudioOrVideo = !!(
    session.collectedMedia.audio || session.collectedMedia.video
  );

  return hasImages && hasAudioOrVideo;
}

/**
 * Process a session and create draft if ready
 * This is the main entry point for the draft creation workflow
 * 
 * @param session - WhatsApp session
 * @returns Draft ID if created, null if not ready
 */
export async function processSessionForDraft(
  session: WhatsAppSession
): Promise<string | null> {
  try {
    // Check if session is ready
    if (!isSessionReadyForDraft(session)) {
      console.log(`Session ${session.id} not ready for draft creation`);
      return null;
    }

    // Check if draft already created
    if (session.draftId) {
      console.log(`Session ${session.id} already has draft ${session.draftId}`);
      return session.draftId;
    }

    // Create draft
    const draftId = await createDraftFromSession(session);
    return draftId;
  } catch (error: any) {
    console.error("Error processing session for draft:", error);
    throw error;
  }
}
