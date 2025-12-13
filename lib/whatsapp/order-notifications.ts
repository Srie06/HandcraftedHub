/**
 * WhatsApp Order Notifications Integration
 * Main entry point for order notification functionality
 */

import { OrderStatus } from '@/types';
import {
  listenForSellerOrders,
  listenForAllOrders,
  listenForOrderStatusChanges,
} from './order-notification-listener';
import {
  sendOrderStatusNotification,
  sendReadyForPickupNotification,
  sendPickedUpNotification,
  sendDeliveredNotification,
  sendNotificationWithRetry,
  sendBatchStatusNotifications,
} from './status-notification-handler';
import { SendMessageResult } from './message-sender';

/**
 * Initialize order notification system for a seller
 * Returns unsubscribe function
 */
export function initializeSellerOrderNotifications(sellerId: string): () => void {
  console.log('[Order Notifications] Initializing for seller:', sellerId);
  return listenForSellerOrders(sellerId);
}

/**
 * Initialize order notification system for all orders (admin)
 * Returns unsubscribe function
 */
export function initializeAllOrderNotifications(): () => void {
  console.log('[Order Notifications] Initializing for all orders');
  return listenForAllOrders();
}

/**
 * Send notification when order status changes
 */
export async function notifyOrderStatusChange(
  orderId: string,
  newStatus: OrderStatus
): Promise<SendMessageResult> {
  console.log('[Order Notifications] Status change:', orderId, newStatus);

  // Use retry logic for important status updates
  const statusesWithRetry: OrderStatus[] = ['accepted', 'completed'];

  if (statusesWithRetry.includes(newStatus)) {
    const notificationStatus = mapOrderStatusForRetry(newStatus);
    if (notificationStatus) {
      return await sendNotificationWithRetry(orderId, notificationStatus);
    }
  }

  // For other statuses, send without retry
  const order = await getOrderForNotification(orderId);
  if (!order) {
    return {
      success: false,
      error: 'Order not found',
    };
  }

  return await sendOrderStatusNotification(order, newStatus);
}

/**
 * Send ready for pickup notification
 */
export async function notifyReadyForPickup(orderId: string): Promise<SendMessageResult> {
  return await sendReadyForPickupNotification(orderId);
}

/**
 * Send picked up notification
 */
export async function notifyPickedUp(orderId: string): Promise<SendMessageResult> {
  return await sendPickedUpNotification(orderId);
}

/**
 * Send delivered notification
 */
export async function notifyDelivered(orderId: string): Promise<SendMessageResult> {
  return await sendDeliveredNotification(orderId);
}

/**
 * Send batch notifications
 */
export async function notifyBatchOrders(
  orderIds: string[],
  status: 'ready_for_pickup' | 'picked_up' | 'delivered'
): Promise<{ success: number; failed: number }> {
  const result = await sendBatchStatusNotifications(orderIds, status);
  return { success: result.success, failed: result.failed };
}

/**
 * Watch for status changes on a specific order
 */
export function watchOrderStatus(
  orderId: string,
  onStatusChange: (newStatus: OrderStatus) => void
): () => void {
  return listenForOrderStatusChanges(orderId, (order) => {
    onStatusChange(order.status);
  });
}

/**
 * Helper to map order status to retry notification status
 */
function mapOrderStatusForRetry(
  status: OrderStatus
): 'ready_for_pickup' | 'picked_up' | 'delivered' | null {
  switch (status) {
    case 'accepted':
      return 'ready_for_pickup';
    case 'completed':
      return 'delivered';
    default:
      return null;
  }
}

/**
 * Helper to get order for notification
 */
async function getOrderForNotification(orderId: string) {
  const { getOrder } = await import('@/lib/firebase/orders');
  return await getOrder(orderId);
}

// Export all notification functions
export {
  sendOrderStatusNotification,
  sendReadyForPickupNotification,
  sendPickedUpNotification,
  sendDeliveredNotification,
  sendNotificationWithRetry,
  sendBatchStatusNotifications,
  listenForSellerOrders,
  listenForAllOrders,
  listenForOrderStatusChanges,
};
