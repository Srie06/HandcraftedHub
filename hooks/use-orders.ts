/**
 * Custom hook for managing orders with real-time updates
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
import { Order, OrderStatus } from "@/types";

interface UseOrdersOptions {
  sellerId?: string;
  buyerId?: string;
  status?: OrderStatus;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!options.sellerId && !options.buyerId) {
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, "orders");
      let q = query(ordersRef, orderBy("createdAt", "desc"));

      // Filter by seller or buyer
      if (options.sellerId) {
        q = query(q, where("sellerId", "==", options.sellerId));
      } else if (options.buyerId) {
        q = query(q, where("buyerId", "==", options.buyerId));
      }

      // Filter by status if provided
      if (options.status) {
        q = query(q, where("status", "==", options.status));
      }

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const ordersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];

          setOrders(ordersData);
          setLoading(false);
        },
        (err) => {
          console.error("Error fetching orders:", err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up orders listener:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [options.sellerId, options.buyerId, options.status]);

  return { orders, loading, error };
}
