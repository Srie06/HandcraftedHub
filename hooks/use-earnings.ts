/**
 * Custom hook for calculating seller earnings with real-time updates
 */

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Order, EarningsSummary } from "@/types";

export function useEarnings(sellerId: string | undefined) {
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0,
    thisWeek: 0,
    thisMonth: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    commission: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!sellerId) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("sellerId", "==", sellerId));

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          let totalEarnings = 0;
          let thisWeek = 0;
          let thisMonth = 0;
          let pendingPayouts = 0;
          let completedPayouts = 0;

          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

          snapshot.forEach((doc) => {
            const order = doc.data() as Order;
            const orderDate = (order.createdAt as Timestamp).toDate();

            if (order.status === "completed") {
              totalEarnings += order.totalAmount;
              completedPayouts += order.totalAmount;

              if (orderDate >= weekAgo) {
                thisWeek += order.totalAmount;
              }
              if (orderDate >= monthAgo) {
                thisMonth += order.totalAmount;
              }
            } else if (order.status === "accepted") {
              pendingPayouts += order.totalAmount;
            }
          });

          const commission = totalEarnings * 0.1; // 10% platform fee

          setEarnings({
            totalEarnings,
            thisWeek,
            thisMonth,
            pendingPayouts,
            completedPayouts,
            commission,
          });
          setLoading(false);
        },
        (err) => {
          console.error("Error calculating earnings:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up earnings listener:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [sellerId]);

  return { earnings, loading, error };
}
