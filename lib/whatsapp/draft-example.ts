/**
 * Example Usage of Product Draft System
 * 
 * This file demonstrates how to use the draft system in different scenarios.
 * These examples can be used for testing and integration.
 */

import { Timestamp } from "firebase/firestore";
import { WhatsAppSession } from "@/types";
import { handleSessionCompletion, getDraftCreationStatus } from "./draft-integration";
import { processDraft, batchProcessDrafts, getProcessingStats } from "./draft-processor";
import { createDraftFromSession } from "./draft-workflow";
import {
  getProductDraft,
  getDraftsBySeller,
  getDraftsByStatus,
  updateDraftAdminReview,
} from "../firebase/product-drafts";

/**
 * Example 1: Complete workflow from session to draft
 */
export async function exampleCompleteWorkflow() {
  // Simulate a completed session with media
  const mockSession: WhatsAppSession = {
    id: "session_123",
    phone: "+919876543210",
    sellerId: "seller_456",
    status: "active",
    startedAt: Timestamp.now(),
    lastMessageAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(Date.now() + 30 * 60 * 1000),
    messages: [],
    collectedMedia: {
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/pottery1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/pottery2.jpg",
      ],
      audio: "https://res.cloudinary.com/demo/video/upload/v1/voice_note.mp3",
      textNotes: ["Beautiful handcrafted pottery"],
    },
    currentStep: "collecting_media",
  };

  // Check draft creation status
  const status = getDraftCreationStatus(mockSession);
  console.log("Draft Status:", status);
  // Output: { ready: true, hasImages: true, hasAudioOrVideo: true, hasDraft: false, missingItems: [] }

  // Handle session completion (creates draft automatically)
  const draftId = await handleSessionCompletion(mockSession.id);
  console.log("Draft created:", draftId);

  // Get the created draft
  const draft = await getProductDraft(draftId!);
  console.log("Draft details:", {
    status: draft?.status,
    category: draft?.aiProcessing.generated.category,
    languages: Object.keys(draft?.aiProcessing.translations || {}),
    confidence: draft?.aiProcessing.generated.confidence,
  });
}

/**
 * Example 2: Query drafts for admin review
 */
export async function exampleAdminReview() {
  // Get all drafts pending review
  const pendingDrafts = await getDraftsByStatus("review");
  console.log(`Found ${pendingDrafts.length} drafts pending review`);

  // Review each draft
  for (const draft of pendingDrafts) {
    console.log("\nDraft:", draft.id);
    console.log("Seller:", draft.sellerName, draft.sellerPhone);
    console.log("Category:", draft.aiProcessing.generated.category);
    console.log("Confidence:", draft.aiProcessing.generated.confidence);
    console.log("Languages:", Object.keys(draft.aiProcessing.translations));
    console.log("Images:", draft.originalMedia.images.length);
    console.log("Suggested Price:", draft.aiProcessing.generated.suggestedPrice);
  }
}

/**
 * Example 3: Approve a draft
 */
export async function exampleApproveDraft(draftId: string) {
  // Admin reviews and approves
  await updateDraftAdminReview(draftId, {
    reviewerId: "admin_123",
    reviewerName: "Admin User",
    reviewedAt: Timestamp.now(),
    action: "approved",
    edits: {
      price: 1500, // Admin sets final price
      stock: 10, // Admin sets initial stock
    },
  });

  console.log(`Draft ${draftId} approved`);

  // In a real implementation, this would trigger product creation
  // See task 6.4 for the full approval workflow
}

/**
 * Example 4: Reject a draft with feedback
 */
export async function exampleRejectDraft(draftId: string) {
  await updateDraftAdminReview(draftId, {
    reviewerId: "admin_123",
    reviewerName: "Admin User",
    reviewedAt: Timestamp.now(),
    action: "rejected",
    feedback: "Please provide clearer images and more detailed description",
    edits: {},
  });

  console.log(`Draft ${draftId} rejected with feedback`);

  // In a real implementation, this would send WhatsApp notification to artisan
  // See task 3.4 for notification workflow
}

/**
 * Example 5: Query seller's drafts
 */
export async function exampleSellerDashboard(sellerId: string) {
  const drafts = await getDraftsBySeller(sellerId);

  console.log(`\nSeller ${sellerId} has ${drafts.length} drafts:`);

  const byStatus = drafts.reduce((acc, draft) => {
    acc[draft.status] = (acc[draft.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("By status:", byStatus);
  // Output: { pending: 2, review: 3, approved: 5, rejected: 1 }
}

/**
 * Example 6: Batch process multiple drafts
 */
export async function exampleBatchProcessing() {
  const draftIds = ["draft_1", "draft_2", "draft_3", "draft_4", "draft_5"];

  console.log(`Processing ${draftIds.length} drafts...`);

  // Process 3 at a time
  const results = await batchProcessDrafts(draftIds, 3);

  // Get statistics
  const stats = getProcessingStats(results);
  console.log("\nProcessing Statistics:");
  console.log(`Total: ${stats.total}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Success Rate: ${stats.successRate.toFixed(2)}%`);
  console.log("Errors by step:", stats.errorsByStep);
}

/**
 * Example 7: Reprocess a failed draft
 */
export async function exampleReprocessFailedDraft(draftId: string) {
  console.log(`Reprocessing draft ${draftId}...`);

  const result = await processDraft(draftId);

  if (result.success) {
    console.log("Reprocessing successful!");
  } else {
    console.error(`Reprocessing failed at step: ${result.step}`);
    console.error(`Error: ${result.error}`);
  }
}

/**
 * Example 8: Check session readiness
 */
export async function exampleCheckSessionReadiness(session: WhatsAppSession) {
  const status = getDraftCreationStatus(session);

  if (status.ready) {
    console.log("✅ Session is ready for draft creation");
  } else {
    console.log("❌ Session not ready. Missing:");
    status.missingItems.forEach((item) => console.log(`  - ${item}`));
  }

  console.log("\nSession details:");
  console.log(`Images: ${session.collectedMedia.images.length}`);
  console.log(`Audio: ${session.collectedMedia.audio ? "Yes" : "No"}`);
  console.log(`Video: ${session.collectedMedia.video ? "Yes" : "No"}`);
  console.log(`Text notes: ${session.collectedMedia.textNotes.length}`);
}

/**
 * Example 9: View draft translations
 */
export async function exampleViewTranslations(draftId: string) {
  const draft = await getProductDraft(draftId);

  if (!draft) {
    console.log("Draft not found");
    return;
  }

  console.log("\nProduct Translations:");
  console.log("=".repeat(50));

  for (const [lang, translation] of Object.entries(
    draft.aiProcessing.translations
  )) {
    console.log(`\n[${lang.toUpperCase()}]`);
    console.log(`Title: ${translation.title}`);
    console.log(`Description: ${translation.description.substring(0, 100)}...`);
  }

  console.log("\n" + "=".repeat(50));
  console.log(`Original language: ${draft.aiProcessing.transcription.detectedLanguage}`);
  console.log(`Transcription confidence: ${draft.aiProcessing.transcription.confidence}`);
}

/**
 * Example 10: View generated product metadata
 */
export async function exampleViewMetadata(draftId: string) {
  const draft = await getProductDraft(draftId);

  if (!draft) {
    console.log("Draft not found");
    return;
  }

  const generated = draft.aiProcessing.generated;

  console.log("\nGenerated Product Metadata:");
  console.log("=".repeat(50));
  console.log(`Category: ${generated.category}`);
  console.log(`Subcategory: ${generated.subcategory || "N/A"}`);
  console.log(`Tags: ${generated.tags.join(", ")}`);
  console.log(`Materials: ${generated.materials.join(", ")}`);
  console.log(`Techniques: ${generated.techniques.join(", ")}`);
  console.log(`Region: ${generated.region || "N/A"}`);
  console.log(`Suggested Price: ₹${generated.suggestedPrice || "N/A"}`);
  console.log(`Confidence: ${(generated.confidence * 100).toFixed(1)}%`);
  console.log("=".repeat(50));
}

// Export all examples
export const examples = {
  completeWorkflow: exampleCompleteWorkflow,
  adminReview: exampleAdminReview,
  approveDraft: exampleApproveDraft,
  rejectDraft: exampleRejectDraft,
  sellerDashboard: exampleSellerDashboard,
  batchProcessing: exampleBatchProcessing,
  reprocessFailedDraft: exampleReprocessFailedDraft,
  checkSessionReadiness: exampleCheckSessionReadiness,
  viewTranslations: exampleViewTranslations,
  viewMetadata: exampleViewMetadata,
};
