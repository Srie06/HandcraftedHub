/**
 * Custom hook for managing WhatsApp product drafts with real-time updates
 */

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ProductDraft, DraftStatus } from "@/types";

interface UseWhatsAppDraftsOptions {
  sellerId?: string;
  status?: DraftStatus;
}

export function useWhatsAppDrafts(options: UseWhatsAppDraftsOptions = {}) {
  const [drafts, setDrafts] = useState<ProductDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!options.sellerId) {
      setLoading(false);
      return;
    }

    try {
      const draftsRef = collection(db, "productDrafts");
      let q = query(
        draftsRef,
        where("sellerId", "==", options.sellerId),
        orderBy("submittedAt", "desc")
      );

      // Filter by status if provided
      if (options.status) {
        q = query(
          draftsRef,
          where("sellerId", "==", options.sellerId),
          where("status", "==", options.status),
          orderBy("submittedAt", "desc")
        );
      }

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const draftsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as ProductDraft[];

          setDrafts(draftsData);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching WhatsApp drafts:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up drafts listener:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [options.sellerId, options.status]);

  return { drafts, loading, error };
}
