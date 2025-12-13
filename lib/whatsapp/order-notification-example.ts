/**
 * WhatsApp Order Notification System - Usage Examples
 * 
 * This file demonstrates how to use the order notification system
 * in different scenarios.
 */

import {
  initializeSellerOrderNotifications,
  initializeAllOrderNotifications,
  notifyOrderStatusChange,
  notifyReadyForPickup,
  notifyPickedUp,
  notifyDelivered,
  notifyBatchOrders,
  watchOrderStatus,
} from './order-notifications';

/**
 * Example 1: Initialize notifications for a seller dashboard
 * 
 * Use this in your seller dashboard component to automatically
 * send notifications when new orders arrive.
 */
export function exampleSellerDashboardSetup(sellerId: string) {
  console.log('Setting up order notifications for seller:', sellerId);

  // Start listening for new orders
  const unsubscribe = initializeSellerOrderNotifications(sellerId);

  // Return cleanup function
  return () => {
    console.log('Cleaning up order notifications');
    unsubscribe();
  };
}

/**
 * Example 2: Initialize notifications for admin panel
 * 
 * Use this in your admin panel to monitor all orders across
 * all sellers.
 */
export function exampleAdminPanelSetup() {
  console.log('Setting up order notifications for admin');

  // Start listening for all orders
  const unsubscribe = initializeAllOrderNotifications();

  return unsubscribe;
}

/**
 * Example 3: Send notification when manually updating order status
 * 
 * Use this when you need to manually trigger a notification
 * after updating an order status.
 */
export async function exampleManualStatusUpdate(orderId: string) {
  console.log('Manually updating order status:', orderId);

  // Update order status in Firestore
  const { updateOrderStatus } = await import('@/lib/firebase/orders');
  await updateOrderStatus(orderId, 'accepted', 'Product is ready for pickup');

  // Notification is sent automatically by updateOrderStatus
  // But you can also send manually if needed:
  // await notifyReadyForPickup(orderId);
}

/**
 * Example 4: Send specific status notifications
 * 
 * Use these functions to send specific notifications at any time.
 */
export async function exampleSpecificNotifications(orderId: string) {
  console.log('Sending specific notifications for order:', orderId);

  // Send ready for pickup notification
  const result1 = await notifyReadyForPickup(orderId);
  console.log('Ready for pickup notification:', result1);

  // Wait a bit (in real scenario, this would be when logistics picks up)
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Send picked up notification
  const result2 = await notifyPickedUp(orderId);
  console.log('Picked up notification:', result2);

  // Wait a bit (in real scenario, this would be when delivered)
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Send delivered notification
  const result3 = await notifyDelivered(orderId);
  console.log('Delivered notification:', result3);
}

/**
 * Example 5: Batch notifications for multiple orders
 * 
 * Use this when you need to send the same notification to
 * multiple orders at once (e.g., bulk pickup).
 */
export async function exampleBatchNotifications() {
  console.log('Sending batch notifications');

  const orderIds = ['order-1', 'order-2', 'order-3', 'order-4', 'order-5'];

  // Send picked up notification to all orders
  const result = await notifyBatchOrders(orderIds, 'picked_up');

  console.log(`Batch complete: ${result.success} succeeded, ${result.failed} failed`);
}

/**
 * Example 6: Watch for status changes on a specific order
 * 
 * Use this to react to status changes in real-time.
 */
export function exampleWatchOrderStatus(orderId: string) {
  console.log('Watching order status:', orderId);

  const unsubscribe = watchOrderStatus(orderId, (newStatus) => {
    console.log('Order status changed to:', newStatus);

    // React to status changes
    switch (newStatus) {
      case 'accepted':
        console.log('Order accepted! Product is ready for pickup.');
        break;
      case 'completed':
        console.log('Order completed! Product delivered.');
        break;
      case 'cancelled':
        console.log('Order cancelled.');
        break;
    }
  });

  return unsubscribe;
}

/**
 * Example 7: React component integration
 * 
 * Example of how to use in a React component.
 */
export function exampleReactComponent() {
  // This is pseudo-code showing the pattern
  const code = `
import { useEffect } from 'react';
import { initializeSellerOrderNotifications } from '@/lib/whatsapp/order-notifications';
import { useAuth } from '@/contexts/auth-context';

export function SellerDashboard() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'seller') {
      // Initialize order notifications
      const unsubscribe = initializeSellerOrderNotifications(user.uid);

      // Cleanup on unmount
      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  return (
    <div>
      <h1>Seller Dashboard</h1>
      <p>You'll receive WhatsApp notifications for new orders!</p>
    </div>
  );
}
  `;

  return code;
}

/**
 * Example 8: Error handling
 * 
 * Example of proper error handling when sending notifications.
 */
export async function exampleErrorHandling(orderId: string) {
  console.log('Sending notification with error handling:', orderId);

  try {
    const result = await notifyDelivered(orderId);

    if (result.success) {
      console.log('Notification sent successfully:', result.messageId);
    } else {
      console.error('Notification failed:', result.error);
      
      // Handle specific errors
      if (result.error?.includes('Rate limit')) {
        console.log('Rate limit hit, will retry later');
        // Queue for retry
      } else if (result.error?.includes('Phone number')) {
        console.log('Invalid phone number, update seller profile');
        // Notify admin
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    // Log to error tracking service
  }
}

/**
 * Example 9: Testing notifications locally
 * 
 * Example of how to test notifications in development.
 */
export async function exampleLocalTesting() {
  console.log('Testing notifications locally');

  // Create a test order
  const { createOrder } = await import('@/lib/firebase/orders');

  const orderId = await createOrder({
    sellerId: 'test-seller-id', // Use your test seller ID
    buyerId: 'test-buyer-id',
    productId: 'test-product-id',
    productTitle: 'Handwoven Basket',
    productImage: 'https://example.com/image.jpg',
    quantity: 1,
    price: 500,
    totalAmount: 500,
    status: 'pending',
    buyerInfo: {
      name: 'Test Buyer',
      email: 'buyer@test.com',
      phone: '+919876543210',
      address: 'Mumbai, Maharashtra',
    },
  });

  console.log('Test order created:', orderId);
  console.log('Check WhatsApp for notification!');

  // Update status to trigger more notifications
  setTimeout(async () => {
    await notifyReadyForPickup(orderId);
    console.log('Ready for pickup notification sent');
  }, 5000);

  setTimeout(async () => {
    await notifyPickedUp(orderId);
    console.log('Picked up notification sent');
  }, 10000);

  setTimeout(async () => {
    await notifyDelivered(orderId);
    console.log('Delivered notification sent');
  }, 15000);
}

/**
 * Example 10: Custom notification flow
 * 
 * Example of building a custom notification flow.
 */
export async function exampleCustomFlow(orderId: string) {
  console.log('Starting custom notification flow:', orderId);

  // Step 1: Order placed (automatic)
  console.log('Step 1: Order placed - notification sent automatically');

  // Step 2: Artisan confirms (manual)
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('Step 2: Artisan confirms preparation');
  await notifyReadyForPickup(orderId);

  // Step 3: Logistics picks up (manual)
  await new Promise(resolve => setTimeout(resolve, 5000));
  console.log('Step 3: Logistics picks up product');
  await notifyPickedUp(orderId);

  // Step 4: Delivered (manual)
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('Step 4: Product delivered');
  await notifyDelivered(orderId);

  console.log('Custom flow complete!');
}

// Export all examples
export const examples = {
  sellerDashboardSetup: exampleSellerDashboardSetup,
  adminPanelSetup: exampleAdminPanelSetup,
  manualStatusUpdate: exampleManualStatusUpdate,
  specificNotifications: exampleSpecificNotifications,
  batchNotifications: exampleBatchNotifications,
  watchOrderStatus: exampleWatchOrderStatus,
  reactComponent: exampleReactComponent,
  errorHandling: exampleErrorHandling,
  localTesting: exampleLocalTesting,
  customFlow: exampleCustomFlow,
};
