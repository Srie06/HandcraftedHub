/**
 * WhatsApp Order Notification Listener
 * Listens for new orders in Firestore and triggers WhatsApp notifications
 */

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, UserProfile } from '@/types';
import { sendOrderNotification } from './message-sender';

interface OrderNotificationData {
  orderId: string;
  productName: string;
  quantity: number;
  buyerLocation: string;
  totalAmount: number;
  artisanPhone: string;
  artisanName: string;
}

/**
 * Start listening for new orders for a specific seller
 */
export function listenForSellerOrders(
  sellerId: string,
  onNewOrder?: (order: Order) => void
): () => void {
  console.log('[Order Listener] Starting listener for seller:', sellerId);

  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('sellerId', '==', sellerId),
    where('status', '==', 'pending')
  );

  // Track processed orders to avoid duplicate notifications
  const processedOrders = new Set<string>();

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      console.log('[Order Listener] Received snapshot with', snapshot.docs.length, 'orders');

      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const order = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Order;

          // Skip if already processed
          if (processedOrders.has(order.id)) {
            continue;
          }

          console.log('[Order Listener] New order detected:', order.id);
          processedOrders.add(order.id);

          // Extract order and artisan details
          try {
            const notificationData = await extractOrderDetails(order);
            
            // Send WhatsApp notification
            await sendOrderNotification(
              notificationData.artisanPhone,
              {
                orderId: notificationData.orderId,
                productName: notificationData.productName,
                quantity: notificationData.quantity,
                buyerLocation: notificationData.buyerLocation,
                totalAmount: notificationData.totalAmount,
              }
            );

            console.log('[Order Listener] Notification sent for order:', order.id);

            // Call optional callback
            if (onNewOrder) {
              onNewOrder(order);
            }
          } catch (error) {
            console.error('[Order Listener] Error processing order:', order.id, error);
          }
        }
      }
    },
    (error) => {
      console.error('[Order Listener] Error in snapshot listener:', error);
    }
  );

  return unsubscribe;
}

/**
 * Start listening for all new orders (admin view)
 */
export function listenForAllOrders(
  onNewOrder?: (order: Order) => void
): () => void {
  console.log('[Order Listener] Starting listener for all orders');

  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('status', '==', 'pending'));

  const processedOrders = new Set<string>();

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const order = {
            id: change.doc.id,
            ...change.doc.data(),
          } as Order;

          if (processedOrders.has(order.id)) {
            continue;
          }

          console.log('[Order Listener] New order detected:', order.id);
          processedOrders.add(order.id);

          try {
            const notificationData = await extractOrderDetails(order);
            
            await sendOrderNotification(
              notificationData.artisanPhone,
              {
                orderId: notificationData.orderId,
                productName: notificationData.productName,
                quantity: notificationData.quantity,
                buyerLocation: notificationData.buyerLocation,
                totalAmount: notificationData.totalAmount,
              }
            );

            if (onNewOrder) {
              onNewOrder(order);
            }
          } catch (error) {
            console.error('[Order Listener] Error processing order:', order.id, error);
          }
        }
      }
    },
    (error) => {
      console.error('[Order Listener] Error in snapshot listener:', error);
    }
  );

  return unsubscribe;
}

/**
 * Extract order and artisan details from an order
 */
async function extractOrderDetails(order: Order): Promise<OrderNotificationData> {
  console.log('[Order Listener] Extracting details for order:', order.id);

  // Get seller profile to retrieve phone number
  const sellerRef = doc(db, 'users', order.sellerId);
  const sellerSnap = await getDoc(sellerRef);

  if (!sellerSnap.exists()) {
    throw new Error(`Seller not found: ${order.sellerId}`);
  }

  const sellerProfile = sellerSnap.data() as UserProfile;

  // Extract buyer location from order
  const buyerLocation = order.buyerInfo?.address || order.buyerInfo?.name || 'Not specified';

  return {
    orderId: order.id,
    productName: order.productTitle,
    quantity: order.quantity,
    buyerLocation,
    totalAmount: order.totalAmount,
    artisanPhone: sellerProfile.phone || '',
    artisanName: sellerProfile.displayName || sellerProfile.shopName || 'Artisan',
  };
}

/**
 * Listen for order status changes for a specific order
 */
export function listenForOrderStatusChanges(
  orderId: string,
  onStatusChange: (order: Order) => void
): () => void {
  console.log('[Order Listener] Starting status listener for order:', orderId);

  const orderRef = doc(db, 'orders', orderId);

  const unsubscribe = onSnapshot(
    orderRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const order = {
          id: snapshot.id,
          ...snapshot.data(),
        } as Order;

        console.log('[Order Listener] Order status changed:', order.status);
        onStatusChange(order);
      }
    },
    (error) => {
      console.error('[Order Listener] Error in status listener:', error);
    }
  );

  return unsubscribe;
}

/**
 * Get artisan phone number from seller ID
 */
export async function getArtisanPhone(sellerId: string): Promise<string> {
  const sellerRef = doc(db, 'users', sellerId);
  const sellerSnap = await getDoc(sellerRef);

  if (!sellerSnap.exists()) {
    throw new Error(`Seller not found: ${sellerId}`);
  }

  const sellerProfile = sellerSnap.data() as UserProfile;
  
  if (!sellerProfile.phone) {
    throw new Error(`Phone number not found for seller: ${sellerId}`);
  }

  return sellerProfile.phone;
}
