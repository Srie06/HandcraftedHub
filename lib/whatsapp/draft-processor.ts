/**
 * Product Draft Processing Pipeline
 * 
 * This module orchestrates the AI processing pipeline for product drafts.
 * It handles errors, retries, and status updates throughout the process.
 * 
 * Requirements: 2.1-2.7
 */

import { Timestamp } from "firebase/firestore";
import {
  getProductDraft,
  updateDraftStatus,
  updateDraftAIProcessing,
} from "../firebase/product-drafts";
import {
  mockTranscribeAudio,
  mockTranslate,
  mockGenerateProduct,
  SUPPORTED_LANGUAGES,
  LanguageCode,
  TranscriptionResult,
  TranslationResult,
  ProductGeneration,
} from "../ai/mock-services";
import { ProductDraft, AIProcessing } from "@/types";

/**
 * Processing error types
 */
export class ProcessingError extends Error {
  constructor(
    message: string,
    public step: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = "ProcessingError";
  }
}

/**
 * Processing result
 */
export interface ProcessingResult {
  success: boolean;
  draftId: string;
  error?: string;
  step?: string;
}

/**
 * Process a product draft through the AI pipeline
 * 
 * @param draftId - Draft ID to process
 * @param maxRetries - Maximum number of retries per step (default: 3)
 * @returns Processing result
 */
export async function processDraft(
  draftId: string,
  maxRetries: number = 3
): Promise<ProcessingResult> {
  try {
    console.log(`Starting processing for draft ${draftId}`);

    // Get the draft
    const draft = await getProductDraft(draftId);
    if (!draft) {
      throw new ProcessingError("Draft not found", "fetch", false);
    }

    // Check if already processed
    if (draft.status === "review" || draft.status === "approved") {
      console.log(`Draft ${draftId} already processed`);
      return {
        success: true,
        draftId,
      };
    }

    // Update status to processing
    await updateDraftStatus(draftId, "processing");

    // Step 1: Transcribe audio/video with retry
    console.log("Step 1: Transcribing audio/video...");
    const transcriptionResult = await retryOperation(
      () => transcribeMedia(draft),
      maxRetries,
      "transcription"
    );

    // Step 2: Translate to all languages with retry
    console.log("Step 2: Translating content...");
    const translationResults = await retryOperation(
      () => translateContent(transcriptionResult),
      maxRetries,
      "translation"
    );

    // Step 3: Generate product data with retry
    console.log("Step 3: Generating product data...");
    const productGeneration = await retryOperation(
      () => generateProductData(draft, transcriptionResult),
      maxRetries,
      "generation"
    );

    // Step 4: Format and store results
    console.log("Step 4: Storing AI processing results...");
    const aiProcessing = formatAIProcessing(
      transcriptionResult,
      translationResults,
      productGeneration
    );

    await updateDraftAIProcessing(draftId, aiProcessing);

    console.log(`Draft ${draftId} processed successfully`);

    // TODO: Notify admin when ready for review
    // This would be implemented in a separate notification service
    await notifyAdminForReview(draftId);

    return {
      success: true,
      draftId,
    };
  } catch (error: any) {
    console.error(`Error processing draft ${draftId}:`, error);

    // Update draft status to pending with error
    try {
      await updateDraftStatus(draftId, "pending");
    } catch (updateError) {
      console.error("Failed to update draft status after error:", updateError);
    }

    return {
      success: false,
      draftId,
      error: error.message,
      step: error.step || "unknown",
    };
  }
}

/**
 * Transcribe media from draft
 * 
 * @param draft - Product draft
 * @returns Transcription result
 */
async function transcribeMedia(
  draft: ProductDraft
): Promise<TranscriptionResult> {
  const audioUrl =
    draft.originalMedia.audio || draft.originalMedia.video || "";

  if (!audioUrl) {
    throw new ProcessingError(
      "No audio or video found in draft",
      "transcription",
      false
    );
  }

  try {
    return await mockTranscribeAudio(audioUrl);
  } catch (error: any) {
    throw new ProcessingError(
      `Transcription failed: ${error.message}`,
      "transcription",
      true
    );
  }
}

/**
 * Translate content to all supported languages
 * 
 * @param transcription - Transcription result
 * @returns Translation results
 */
async function translateContent(
  transcription: TranscriptionResult
): Promise<TranslationResult> {
  try {
    const targetLanguages = Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[];
    return await mockTranslate(
      transcription.text,
      transcription.language,
      targetLanguages
    );
  } catch (error: any) {
    throw new ProcessingError(
      `Translation failed: ${error.message}`,
      "translation",
      true
    );
  }
}

/**
 * Generate product data from draft and transcription
 * 
 * @param draft - Product draft
 * @param transcription - Transcription result
 * @returns Product generation result
 */
async function generateProductData(
  draft: ProductDraft,
  transcription: TranscriptionResult
): Promise<ProductGeneration> {
  try {
    return await mockGenerateProduct(
      transcription.text,
      transcription.language,
      draft.originalMedia.images
    );
  } catch (error: any) {
    throw new ProcessingError(
      `Product generation failed: ${error.message}`,
      "generation",
      true
    );
  }
}

/**
 * Format AI processing results for storage
 * 
 * @param transcription - Transcription result
 * @param translations - Translation results
 * @param generation - Product generation result
 * @returns Formatted AI processing data
 */
function formatAIProcessing(
  transcription: TranscriptionResult,
  translations: TranslationResult,
  generation: ProductGeneration
): AIProcessing {
  // Format translations with titles and descriptions
  const formattedTranslations: Record<
    string,
    { title: string; description: string }
  > = {};

  for (const [lang, translatedText] of Object.entries(translations)) {
    formattedTranslations[lang] = {
      title: generation.title[lang] || generation.title.en || "Untitled",
      description: translatedText,
    };
  }

  return {
    transcription: {
      text: transcription.text,
      detectedLanguage: transcription.language,
      confidence: transcription.confidence,
    },
    translations: formattedTranslations,
    generated: {
      category: generation.category,
      subcategory: generation.subcategory,
      tags: generation.tags,
      suggestedPrice: generation.suggestedPrice,
      materials: generation.materials,
      techniques: generation.techniques,
      region: generation.region,
      confidence: generation.confidence,
    },
  };
}

/**
 * Retry an operation with exponential backoff
 * 
 * @param operation - Operation to retry
 * @param maxRetries - Maximum number of retries
 * @param stepName - Name of the step for logging
 * @returns Operation result
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  stepName: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(
        `${stepName} attempt ${attempt}/${maxRetries} failed:`,
        error.message
      );

      // Check if error is retryable
      if (error instanceof ProcessingError && !error.retryable) {
        throw error;
      }

      // Don't wait after last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying ${stepName} in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  throw new ProcessingError(
    `${stepName} failed after ${maxRetries} attempts: ${lastError?.message}`,
    stepName,
    false
  );
}

/**
 * Notify admin that a draft is ready for review
 * 
 * @param draftId - Draft ID
 */
async function notifyAdminForReview(draftId: string): Promise<void> {
  try {
    console.log(`Notifying admin for draft ${draftId} review`);

    // TODO: Implement actual notification
    // This could be:
    // - Email notification
    // - In-app notification
    // - Slack/Discord webhook
    // - Push notification

    // For now, just log
    console.log(`Admin notification sent for draft ${draftId}`);
  } catch (error: any) {
    // Don't fail the entire process if notification fails
    console.error("Failed to notify admin:", error);
  }
}

/**
 * Batch process multiple drafts
 * 
 * @param draftIds - Array of draft IDs to process
 * @param concurrency - Number of drafts to process concurrently (default: 3)
 * @returns Array of processing results
 */
export async function batchProcessDrafts(
  draftIds: string[],
  concurrency: number = 3
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  // Process in batches
  for (let i = 0; i < draftIds.length; i += concurrency) {
    const batch = draftIds.slice(i, i + concurrency);
    console.log(
      `Processing batch ${Math.floor(i / concurrency) + 1}: ${batch.length} drafts`
    );

    const batchResults = await Promise.all(
      batch.map((draftId) => processDraft(draftId))
    );

    results.push(...batchResults);
  }

  return results;
}

/**
 * Get processing statistics
 * 
 * @param results - Array of processing results
 * @returns Statistics object
 */
export function getProcessingStats(results: ProcessingResult[]): {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  errorsByStep: Record<string, number>;
} {
  const total = results.length;
  const successful = results.filter((r) => r.success).length;
  const failed = total - successful;
  const successRate = total > 0 ? (successful / total) * 100 : 0;

  const errorsByStep: Record<string, number> = {};
  results
    .filter((r) => !r.success && r.step)
    .forEach((r) => {
      const step = r.step!;
      errorsByStep[step] = (errorsByStep[step] || 0) + 1;
    });

  return {
    total,
    successful,
    failed,
    successRate,
    errorsByStep,
  };
}
