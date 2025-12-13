import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  QueryConstraint,
  DocumentData,
  Timestamp,
  addDoc,
  onSnapshot,
  Query,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Create a new document in a collection
 * @param collectionName - Name of the collection
 * @param data - Document data
 * @param docId - Optional document ID (if not provided, Firestore generates one)
 * @returns Document ID
 * @throws Error if creation fails
 */
export async function createDocument(
  collectionName: string,
  data: DocumentData,
  docId?: string
): Promise<string> {
  try {
    if (docId) {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
      return docId;
    } else {
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    }
  } catch (error: any) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw new Error(error.message || "Failed to create document");
  }
}

/**
 * Get a document by ID
 * @param collectionName - Name of the collection
 * @param docId - Document ID
 * @returns Document data or null if not found
 * @throws Error if retrieval fails
 */
export async function getDocument(
  collectionName: string,
  docId: string
): Promise<DocumentData | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error: any) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw new Error(error.message || "Failed to get document");
  }
}

/**
 * Update a document
 * @param collectionName - Name of the collection
 * @param docId - Document ID
 * @param data - Updated data
 * @throws Error if update fails
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: DocumentData
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw new Error(error.message || "Failed to update document");
  }
}

/**
 * Delete a document
 * @param collectionName - Name of the collection
 * @param docId - Document ID
 * @throws Error if deletion fails
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw new Error(error.message || "Failed to delete document");
  }
}

/**
 * Query documents with filters
 * @param collectionName - Name of the collection
 * @param constraints - Query constraints (where, orderBy, etc.)
 * @returns Array of documents
 * @throws Error if query fails
 */
export async function queryDocuments(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<DocumentData[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw new Error(error.message || "Failed to query documents");
  }
}

/**
 * Subscribe to real-time updates for a query
 * @param collectionName - Name of the collection
 * @param callback - Callback function to handle updates
 * @param constraints - Query constraints
 * @returns Unsubscribe function
 */
export function subscribeToQuery(
  collectionName: string,
  callback: (documents: DocumentData[]) => void,
  ...constraints: QueryConstraint[]
): () => void {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const documents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(documents);
      },
      (error) => {
        console.error(
          `Error in real-time subscription for ${collectionName}:`,
          error
        );
      }
    );

    return unsubscribe;
  } catch (error: any) {
    console.error(`Error setting up subscription for ${collectionName}:`, error);
    throw new Error(error.message || "Failed to set up subscription");
  }
}

/**
 * Subscribe to real-time updates for a single document
 * @param collectionName - Name of the collection
 * @param docId - Document ID
 * @param callback - Callback function to handle updates
 * @returns Unsubscribe function
 */
export function subscribeToDocument(
  collectionName: string,
  docId: string,
  callback: (document: DocumentData | null) => void
): () => void {
  try {
    const docRef = doc(db, collectionName, docId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(
          `Error in real-time subscription for document ${docId}:`,
          error
        );
      }
    );

    return unsubscribe;
  } catch (error: any) {
    console.error(`Error setting up document subscription:`, error);
    throw new Error(error.message || "Failed to set up document subscription");
  }
}

/**
 * Delete a product with all associated images
 * @param productId - Product document ID
 * @param imageUrls - Array of Firebase Storage URLs for product images
 * @throws Error if product deletion fails (logs storage errors but continues)
 */
export async function deleteProduct(
  productId: string,
  imageUrls: string[]
): Promise<void> {
  try {
    // Import storage deletion function
    const { deleteFilesByURLs } = await import("./storage");

    // Delete images from Storage (log errors but continue)
    if (imageUrls && imageUrls.length > 0) {
      try {
        await deleteFilesByURLs(imageUrls);
      } catch (storageError) {
        // Log storage error but continue with document deletion
        console.error(
          `Error deleting images for product ${productId}:`,
          storageError
        );
      }
    }

    // Delete product document from Firestore
    await deleteDocument("products", productId);
  } catch (error: any) {
    console.error(`Error deleting product ${productId}:`, error);
    throw new Error(error.message || "Failed to delete product");
  }
}

// Export Firestore utilities for use in queries
export { where, orderBy, Timestamp };
