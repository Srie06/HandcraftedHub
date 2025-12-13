/**
 * WhatsApp Message Sender
 * Sends messages to artisans via WhatsApp Business API
 */

const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_API_VERSION = 'v18.0';

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 80; // WhatsApp allows ~80 messages per second, we'll be conservative

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limiting (in production, use Redis)
const rateLimitMap = new Map<string, RateLimitEntry>();

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a text message to a WhatsApp user
 */
export async function sendTextMessage(
  to: string,
  message: string
): Promise<SendMessageResult> {
  console.log('[Message Sender] Sending text message to:', to);

  // Check rate limit
  if (!checkRateLimit(to)) {
    console.warn('[Message Sender] Rate limit exceeded for:', to);
    return {
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
    };
  }

  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Message Sender] Failed to send message:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Failed to send message',
      };
    }

    const data = await response.json();
    console.log('[Message Sender] Message sent successfully:', data.messages?.[0]?.id);

    // Update rate limit
    updateRateLimit(to);

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('[Message Sender] Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send an order notification to an artisan
 */
export async function sendOrderNotification(
  artisanPhone: string,
  orderDetails: {
    orderId: string;
    productName: string;
    quantity: number;
    buyerLocation: string;
    totalAmount: number;
  }
): Promise<SendMessageResult> {
  console.log('[Message Sender] Sending order notification:', {
    artisanPhone,
    orderId: orderDetails.orderId,
  });

  const message = formatOrderNotification(orderDetails);
  return sendTextMessage(artisanPhone, message);
}

/**
 * Format order notification message
 */
function formatOrderNotification(orderDetails: {
  orderId: string;
  productName: string;
  quantity: number;
  buyerLocation: string;
  totalAmount: number;
}): string {
  return `🎉 *New Order Received!*

📦 *Product:* ${orderDetails.productName}
🔢 *Quantity:* ${orderDetails.quantity}
📍 *Buyer Location:* ${orderDetails.buyerLocation}
💰 *Amount:* ₹${orderDetails.totalAmount}

🆔 *Order ID:* ${orderDetails.orderId}

Please prepare the product for pickup. You'll receive another notification when the logistics partner picks it up.

Thank you for being part of HandcraftedHub! 🙏`;
}

/**
 * Send a status update notification
 */
export async function sendStatusUpdate(
  artisanPhone: string,
  status: 'ready_for_pickup' | 'picked_up' | 'delivered',
  orderDetails: {
    orderId: string;
    productName: string;
  }
): Promise<SendMessageResult> {
  console.log('[Message Sender] Sending status update:', {
    artisanPhone,
    status,
    orderId: orderDetails.orderId,
  });

  const message = formatStatusUpdate(status, orderDetails);
  return sendTextMessage(artisanPhone, message);
}

/**
 * Format status update message
 */
function formatStatusUpdate(
  status: 'ready_for_pickup' | 'picked_up' | 'delivered',
  orderDetails: {
    orderId: string;
    productName: string;
  }
): string {
  const messages = {
    ready_for_pickup: `✅ *Order Ready for Pickup*

📦 *Product:* ${orderDetails.productName}
🆔 *Order ID:* ${orderDetails.orderId}

Your product is ready for pickup. The logistics partner will collect it soon.`,

    picked_up: `🚚 *Order Picked Up*

📦 *Product:* ${orderDetails.productName}
🆔 *Order ID:* ${orderDetails.orderId}

The logistics partner has picked up your product. It's on its way to the buyer!`,

    delivered: `🎊 *Order Delivered Successfully!*

📦 *Product:* ${orderDetails.productName}
🆔 *Order ID:* ${orderDetails.orderId}

Your product has been delivered to the buyer. Payment will be processed soon.

Thank you for your craftsmanship! 🙏`,
  };

  return messages[status];
}

/**
 * Send product approval notification
 */
export async function sendProductApprovalNotification(
  artisanPhone: string,
  productName: string,
  productUrl: string
): Promise<SendMessageResult> {
  console.log('[Message Sender] Sending product approval notification:', {
    artisanPhone,
    productName,
  });

  const message = `✅ *Product Approved!*

🎨 *Product:* ${productName}

Your product has been approved and is now live on HandcraftedHub! Buyers can now see and purchase it.

🔗 View your product: ${productUrl}

Keep creating beautiful crafts! 🙏`;

  return sendTextMessage(artisanPhone, message);
}

/**
 * Send product rejection notification
 */
export async function sendProductRejectionNotification(
  artisanPhone: string,
  productName: string,
  feedback: string
): Promise<SendMessageResult> {
  console.log('[Message Sender] Sending product rejection notification:', {
    artisanPhone,
    productName,
  });

  const message = `❌ *Product Needs Revision*

🎨 *Product:* ${productName}

Your product submission needs some changes before it can go live.

📝 *Feedback:* ${feedback}

Please make the necessary changes and submit again. We're here to help! 🙏`;

  return sendTextMessage(artisanPhone, message);
}

/**
 * Send welcome message to new artisan
 */
export async function sendWelcomeMessage(
  artisanPhone: string,
  artisanName?: string
): Promise<SendMessageResult> {
  console.log('[Message Sender] Sending welcome message:', artisanPhone);

  const greeting = artisanName ? `Hello ${artisanName}! 👋` : 'Hello! 👋';

  const message = `${greeting}

Welcome to *HandcraftedHub* - India's marketplace for authentic handcrafted products! 🎨

You can list your products by simply sending:
📸 1-3 photos of your product
🎤 A voice message describing it (in your language)
📹 Or a video showing your craft

I'll help you create a beautiful product listing!

Ready to start? Send me your first product photos! 📸`;

  return sendTextMessage(artisanPhone, message);
}

/**
 * Send onboarding confirmation
 */
export async function sendOnboardingConfirmation(
  artisanPhone: string,
  artisanName: string,
  sellerDashboardUrl: string
): Promise<SendMessageResult> {
  console.log('[Message Sender] Sending onboarding confirmation:', artisanPhone);

  const message = `✅ *Account Created Successfully!*

Welcome aboard, ${artisanName}! 🎉

Your seller account is now active. You can:
📸 List products via WhatsApp (just send photos + voice)
💰 Track your earnings
📦 Manage orders

🔗 Seller Dashboard: ${sellerDashboardUrl}

*Quick Commands:*
• Send photos to list a product
• Reply "ORDERS" to see your orders
• Reply "HELP" for assistance

Let's start selling! Send your first product photos 📸`;

  return sendTextMessage(artisanPhone, message);
}

/**
 * Check rate limit for a phone number
 */
function checkRateLimit(phoneNumber: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(phoneNumber);

  if (!entry) {
    return true; // No entry, allow
  }

  if (now > entry.resetAt) {
    // Window expired, reset
    rateLimitMap.delete(phoneNumber);
    return true;
  }

  // Check if under limit
  return entry.count < MAX_MESSAGES_PER_WINDOW;
}

/**
 * Update rate limit counter
 */
function updateRateLimit(phoneNumber: string): void {
  const now = Date.now();
  const entry = rateLimitMap.get(phoneNumber);

  if (!entry || now > entry.resetAt) {
    // Create new entry
    rateLimitMap.set(phoneNumber, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  } else {
    // Increment counter
    entry.count++;
  }
}

/**
 * Send a template message (for marketing/notifications)
 * Template messages must be pre-approved by WhatsApp
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components?: any[]
): Promise<SendMessageResult> {
  console.log('[Message Sender] Sending template message:', {
    to,
    templateName,
    languageCode,
  });

  try {
    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components: components || [],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Message Sender] Failed to send template:', errorData);
      return {
        success: false,
        error: errorData.error?.message || 'Failed to send template',
      };
    }

    const data = await response.json();
    console.log('[Message Sender] Template sent successfully:', data.messages?.[0]?.id);

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    console.error('[Message Sender] Error sending template:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  let cleaned = 0;

  const entries = Array.from(rateLimitMap.entries());
  for (const [phoneNumber, entry] of entries) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(phoneNumber);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Message Sender] Cleaned up ${cleaned} expired rate limit entries`);
  }
}

// Clean up rate limits every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
