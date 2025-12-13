import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import {
  ProductDraft,
  DraftStatus,
  AIProcessing,
  OriginalMedia,
  AdminReview,
} from "@/types";

/**
 * Remove undefined values from an object (Firestore doesn't allow undefined)
 */
function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key]);
      }
    }
    return cleaned;
  }
  
  return obj;
}

/**
 * Create a new product draft
 * @param draftData - Product draft data
 * @returns Draft ID
 */
export async function createProductDraft(
  draftData: Omit<ProductDraft, "id" | "submittedAt">
): Promise<string> {
  try {
    const draftsRef = collection(db, "productDrafts");
    const newDraftRef = doc(draftsRef);

    const draft: Omit<ProductDraft, "id"> = {
      ...draftData,
      submittedAt: Timestamp.now(),
    };

    // Remove undefined values (Firestore doesn't allow them)
    const cleanedDraft = removeUndefined(draft);

    await setDoc(newDraftRef, cleanedDraft);
    return newDraftRef.id;
  } catch (error: any) {
    console.error("Error creating product draft:", error);
    throw new Error(error.message || "Failed to create product draft");
  }
}

/**
 * Get a product draft by ID
 * @param draftId - Draft ID
 * @returns Product draft or null if not found
 */
export async function getProductDraft(
  draftId: string
): Promise<ProductDraft | null> {
  try {
    const draftRef = doc(db, "productDrafts", draftId);
    const draftSnap = await getDoc(draftRef);

    if (draftSnap.exists()) {
      return { id: draftSnap.id, ...draftSnap.data() } as ProductDraft;
    }
    return null;
  } catch (error: any) {
    console.error("Error getting product draft:", error);
    throw new Error(error.message || "Failed to get product draft");
  }
}

/**
 * Update product draft status
 * @param draftId - Draft ID
 * @param status - New status
 */
export async function updateDraftStatus(
  draftId: string,
  status: DraftStatus
): Promise<void> {
  try {
    const draftRef = doc(db, "productDrafts", draftId);
    const updateData: any = { status };

    if (status === "processing") {
      updateData.processedAt = Timestamp.now();
    } else if (status === "review" || status === "approved" || status === "rejected") {
      updateData.reviewedAt = Timestamp.now();
    }

    await updateDoc(draftRef, updateData);
  } catch (error: any) {
    console.error("Error updating draft status:", error);
    throw new Error(error.message || "Failed to update draft status");
  }
}

/**
 * Update product draft with AI processing results
 * @param draftId - Draft ID
 * @param aiProcessing - AI processing results
 */
export async function updateDraftAIProcessing(
  draftId: string,
  aiProcessing: AIProcessing
): Promise<void> {
  try {
    const draftRef = doc(db, "productDrafts", draftId);
    await updateDoc(draftRef, {
      aiProcessing,
      processedAt: Timestamp.now(),
      status: "review",
    });
  } catch (error: any) {
    console.error("Error updating draft AI processing:", error);
    throw new Error(error.message || "Failed to update draft AI processing");
  }
}

/**
 * Update product draft with admin review
 * @param draftId - Draft ID
 * @param adminReview - Admin review data
 */
export async function updateDraftAdminReview(
  draftId: string,
  adminReview: AdminReview
): Promise<void> {
  try {
    const draftRef = doc(db, "productDrafts", draftId);
    await updateDoc(draftRef, {
      adminReview,
      status: adminReview.action === "approved" ? "approved" : "rejected",
      reviewedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error("Error updating draft admin review:", error);
    throw new Error(error.message || "Failed to update draft admin review");
  }
}

/**
 * Link product draft to published product
 * @param draftId - Draft ID
 * @param productId - Published product ID
 */
export async function linkDraftToProduct(
  draftId: string,
  productId: string
): Promise<void> {
  try {
    const draftRef = doc(db, "productDrafts", draftId);
    await updateDoc(draftRef, {
      productId,
    });
  } catch (error: any) {
    console.error("Error linking draft to product:", error);
    throw new Error(error.message || "Failed to link draft to product");
  }
}

/**
 * Query product drafts by seller
 * @param sellerId - Seller ID
 * @returns Array of product drafts
 */
export async function getDraftsBySeller(
  sellerId: string
): Promise<ProductDraft[]> {
  try {
    const draftsRef = collection(db, "productDrafts");
    const q = query(
      draftsRef,
      where("sellerId", "==", sellerId),
      orderBy("submittedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ProductDraft)
    );
  } catch (error: any) {
    console.error("Error getting drafts by seller:", error);
    throw new Error(error.message || "Failed to get drafts by seller");
  }
}

/**
 * Query product drafts by status
 * @param status - Draft status
 * @returns Array of product drafts
 */
export async function getDraftsByStatus(
  status: DraftStatus
): Promise<ProductDraft[]> {
  try {
    const draftsRef = collection(db, "productDrafts");
    const q = query(
      draftsRef,
      where("status", "==", status),
      orderBy("submittedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ProductDraft)
    );
  } catch (error: any) {
    console.error("Error getting drafts by status:", error);
    throw new Error(error.message || "Failed to get drafts by status");
  }
}

/**
 * Get all product drafts (for admin)
 * @returns Array of product drafts
 */
export async function getAllDrafts(): Promise<ProductDraft[]> {
  try {
    const draftsRef = collection(db, "productDrafts");
    const q = query(draftsRef, orderBy("submittedAt", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as ProductDraft)
    );
  } catch (error: any) {
    console.error("Error getting all drafts:", error);
    throw new Error(error.message || "Failed to get all drafts");
  }
}
