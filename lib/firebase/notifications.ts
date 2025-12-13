/**
 * Firebase Notifications Management
 * Functions for creating and managing notifications
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { Notification, NotificationType } from "@/types";

/**
 * Create a new notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string
): Promise<string> {
  try {
    const notificationsRef = collection(db, "notifications");
    const docRef = await addDoc(notificationsRef, {
      userId,
      type,
      title,
      message,
      read: false,
      actionUrl,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  limitCount: number = 10
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
}

/**
 * Helper function to create order notification
 */
export async function notifyNewOrder(
  sellerId: string,
  orderId: string,
  productTitle: string
): Promise<void> {
  await createNotification(
    sellerId,
    "order",
    "New Order Received!",
    `You have a new order for "${productTitle}"`,
    `/orders`
  );
}

/**
 * Helper function to create low stock notification
 */
export async function notifyLowStock(
  sellerId: string,
  productTitle: string,
  stock: number
): Promise<void> {
  await createNotification(
    sellerId,
    "stock",
    "Low Stock Alert",
    `"${productTitle}" is running low (${stock} items left)`,
    `/dashboard`
  );
}

/**
 * Helper function to create payment notification
 */
export async function notifyPayment(
  sellerId: string,
  amount: number,
  status: string
): Promise<void> {
  await createNotification(
    sellerId,
    "payment",
    "Payment Update",
    `Payment of $${amount.toFixed(2)} is ${status}`,
    `/earnings`
  );
}
