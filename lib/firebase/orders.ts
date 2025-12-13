/**
 * Firebase Orders Management
 * Functions for creating, updating, and querying orders
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Order, OrderStatus } from "@/types";

/**
 * Create a new order
 */
export async function createOrder(
  orderData: Omit<Order, "id" | "createdAt" | "statusHistory">
): Promise<string> {
  try {
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      statusHistory: [
        {
          status: orderData.status,
          timestamp: serverTimestamp(),
          note: "Order created",
        },
      ],
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<void> {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
      statusHistory: arrayUnion({
        status,
        timestamp: serverTimestamp(),
        note: note || `Order ${status}`,
      }),
    });

    // Send WhatsApp notification for status changes
    // Import dynamically to avoid circular dependencies
    if (typeof window === 'undefined') {
      // Only send notifications on server-side
      const { notifyOrderStatusChange } = await import('@/lib/whatsapp/order-notifications');
      await notifyOrderStatusChange(orderId, status).catch((error) => {
        console.error('Failed to send WhatsApp notification:', error);
        // Don't throw - notification failure shouldn't block order update
      });
    }
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
}

/**
 * Get orders for a seller
 */
export async function getSellerOrders(sellerId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("sellerId", "==", sellerId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    throw error;
  }
}

/**
 * Get orders for a buyer
 */
export async function getBuyerOrders(buyerId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("buyerId", "==", buyerId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    throw error;
  }
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      return {
        id: orderSnap.id,
        ...orderSnap.data(),
      } as Order;
    }

    return null;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

/**
 * Calculate earnings for a seller
 */
export async function calculateSellerEarnings(sellerId: string) {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("sellerId", "==", sellerId));

    const snapshot = await getDocs(q);

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

    return {
      totalEarnings,
      thisWeek,
      thisMonth,
      pendingPayouts,
      completedPayouts,
      commission,
    };
  } catch (error) {
    console.error("Error calculating earnings:", error);
    throw error;
  }
}

/**
 * Get order statistics for a seller
 */
export async function getOrderStats(sellerId: string) {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("sellerId", "==", sellerId));

    const snapshot = await getDocs(q);

    const stats = {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      cancelled: 0,
    };

    snapshot.forEach((doc) => {
      const order = doc.data() as Order;
      stats.total++;
      stats[order.status]++;
    });

    return stats;
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }
}

/**
 * Get sales count for a specific product
 */
export async function getProductSalesCount(productId: string): Promise<number> {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("productId", "==", productId));

    const snapshot = await getDocs(q);
    
    let totalSales = 0;
    snapshot.forEach((doc) => {
      const order = doc.data() as Order;
      if (order.status === "completed") {
        totalSales += order.quantity;
      }
    });

    return totalSales;
  } catch (error) {
    console.error("Error fetching product sales count:", error);
    return 0;
  }
}
