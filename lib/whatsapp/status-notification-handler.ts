/**
 * WhatsApp Status Notification Handler
 * Handles sending status update notifications to artisans
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Order, UserProfile, OrderStatus } from '@/types';
import { sendTextMessage, SendMessageResult } from './message-sender';
import {
  generateStatusUpdateNotification,
  detectSellerLanguage,
  StatusUpdateParams,
} from './notification-message-generator';

/**
 * Send status update notification when order status changes
 */
export async function sendOrderStatusNotification(
  order: Order,
  newStatus: OrderStatus
): Promise<SendMessageResult> {
  console.log('[Status Notification] Sending notification for order:', order.id, 'status:', newStatus);

  try {
    // Get seller profile to retrieve phone and language preference
    const sellerRef = doc(db, 'users', order.sellerId);
    const sellerSnap = await getDoc(sellerRef);

    if (!sellerSnap.exists()) {
      console.error('[Status Notification] Seller not found:', order.sellerId);
      return {
        success: false,
        error: 'Seller not found',
      };
    }

    const sellerProfile = sellerSnap.data() as UserProfile;

    if (!sellerProfile.phone) {
      console.error('[Status Notification] Seller phone not found:', order.sellerId);
      return {
        success: false,
        error: 'Seller phone number not found',
      };
    }

    // Map order status to notification status
    const notificationStatus = mapOrderStatusToNotificationStatus(newStatus);

    if (!notificationStatus) {
      console.log('[Status Notification] No notification needed for status:', newStatus);
      return {
        success: true,
        messageId: 'skipped',
      };
    }

    // Detect seller's preferred language
    const language = detectSellerLanguage(sellerProfile);

    // Generate notification message
    const params: StatusUpdateParams = {
      orderId: order.id,
      productName: order.productTitle,
      status: notificationStatus,
    };

    const message = generateStatusUpdateNotification(params, language);

    // Send WhatsApp message
    const result = await sendTextMessage(sellerProfile.phone, message);

    if (result.success) {
      console.log('[Status Notification] Notification sent successfully:', result.messageId);
    } else {
      console.error('[Status Notification] Failed to send notification:', result.error);
    }

    return result;
  } catch (error) {
    console.error('[Status Notification] Error sending notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send "ready for pickup" confirmation
 */
export async function sendReadyForPickupNotification(
  orderId: string
): Promise<SendMessageResult> {
  console.log('[Status Notification] Sending ready for pickup notification:', orderId);

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    return await sendOrderStatusNotification(order, 'accepted');
  } catch (error) {
    console.error('[Status Notification] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send "picked up" notification
 */
export async function sendPickedUpNotification(
  orderId: string
): Promise<SendMessageResult> {
  console.log('[Status Notification] Sending picked up notification:', orderId);

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // For picked up, we'll use a custom status
    const sellerRef = doc(db, 'users', order.sellerId);
    const sellerSnap = await getDoc(sellerRef);

    if (!sellerSnap.exists() || !sellerSnap.data().phone) {
      return {
        success: false,
        error: 'Seller phone not found',
      };
    }

    const sellerProfile = sellerSnap.data() as UserProfile;
    const language = detectSellerLanguage(sellerProfile);

    const params: StatusUpdateParams = {
      orderId: order.id,
      productName: order.productTitle,
      status: 'picked_up',
    };

    const message = generateStatusUpdateNotification(params, language);
    return await sendTextMessage(sellerProfile.phone, message);
  } catch (error) {
    console.error('[Status Notification] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send "delivered" notification
 */
export async function sendDeliveredNotification(
  orderId: string
): Promise<SendMessageResult> {
  console.log('[Status Notification] Sending delivered notification:', orderId);

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    return await sendOrderStatusNotification(order, 'completed');
  } catch (error) {
    console.error('[Status Notification] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle notification failures with retry logic
 */
export async function sendNotificationWithRetry(
  orderId: string,
  status: 'ready_for_pickup' | 'picked_up' | 'delivered',
  maxRetries: number = 3
): Promise<SendMessageResult> {
  console.log('[Status Notification] Sending with retry:', orderId, status, 'max retries:', maxRetries);

  let lastError: string = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[Status Notification] Attempt ${attempt}/${maxRetries}`);

    let result: SendMessageResult;

    switch (status) {
      case 'ready_for_pickup':
        result = await sendReadyForPickupNotification(orderId);
        break;
      case 'picked_up':
        result = await sendPickedUpNotification(orderId);
        break;
      case 'delivered':
        result = await sendDeliveredNotification(orderId);
        break;
    }

    if (result.success) {
      console.log('[Status Notification] Success on attempt:', attempt);
      return result;
    }

    lastError = result.error || 'Unknown error';
    console.warn(`[Status Notification] Attempt ${attempt} failed:`, lastError);

    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.log(`[Status Notification] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('[Status Notification] All retry attempts failed');
  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`,
  };
}

/**
 * Map order status to notification status
 */
function mapOrderStatusToNotificationStatus(
  orderStatus: OrderStatus
): 'ready_for_pickup' | 'picked_up' | 'delivered' | null {
  const statusMap: Record<OrderStatus, 'ready_for_pickup' | 'picked_up' | 'delivered' | null> = {
    pending: null, // No notification for pending (handled by order creation)
    accepted: 'ready_for_pickup',
    completed: 'delivered',
    cancelled: null, // Could add cancelled notification in future
  };

  return statusMap[orderStatus];
}

/**
 * Get order by ID
 */
async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return null;
    }

    return {
      id: orderSnap.id,
      ...orderSnap.data(),
    } as Order;
  } catch (error) {
    console.error('[Status Notification] Error fetching order:', error);
    return null;
  }
}

/**
 * Batch send notifications for multiple orders
 */
export async function sendBatchStatusNotifications(
  orderIds: string[],
  status: 'ready_for_pickup' | 'picked_up' | 'delivered'
): Promise<{ success: number; failed: number; results: SendMessageResult[] }> {
  console.log('[Status Notification] Sending batch notifications:', orderIds.length, 'orders');

  const results: SendMessageResult[] = [];
  let success = 0;
  let failed = 0;

  for (const orderId of orderIds) {
    const result = await sendNotificationWithRetry(orderId, status, 2);
    results.push(result);

    if (result.success) {
      success++;
    } else {
      failed++;
    }

    // Small delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('[Status Notification] Batch complete:', { success, failed });

  return { success, failed, results };
}
