import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * WhatsApp Webhook Endpoint
 * Handles incoming messages from WhatsApp Business API
 */

// Environment variables for WhatsApp
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'handcrafted_hub_verify_token';
const WHATSAPP_APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';

/**
 * GET handler - Webhook verification
 * WhatsApp will call this endpoint to verify the webhook URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    console.log('[WhatsApp Webhook] Verification request received', {
      mode,
      token: token ? '***' : 'missing',
      challenge: challenge ? 'present' : 'missing',
    });

    // Check if mode and token are present
    if (!mode || !token) {
      console.error('[WhatsApp Webhook] Missing mode or token');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Verify the mode and token
    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook] Verification successful');
      
      // Respond with the challenge token from the request
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.error('[WhatsApp Webhook] Verification failed - invalid token');
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 403 }
    );
  } catch (error) {
    console.error('[WhatsApp Webhook] Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify WhatsApp signature
 * Ensures the request is actually from WhatsApp
 */
function verifySignature(payload: string, signature: string): boolean {
  if (!WHATSAPP_APP_SECRET) {
    console.warn('[WhatsApp Webhook] No app secret configured, skipping signature verification');
    return true; // Allow in development without secret
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', WHATSAPP_APP_SECRET)
      .update(payload)
      .digest('hex');

    const signatureHash = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signatureHash)
    );
  } catch (error) {
    console.error('[WhatsApp Webhook] Signature verification error:', error);
    return false;
  }
}

/**
 * POST handler - Receive messages
 * Processes incoming WhatsApp messages
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256') || '';

    console.log('[WhatsApp Webhook] Message received', {
      signature: signature ? 'present' : 'missing',
      bodyLength: body.length,
    });

    // Verify signature
    if (!verifySignature(body, signature)) {
      console.error('[WhatsApp Webhook] Invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Parse the JSON body
    const data = JSON.parse(body);

    // Log the incoming webhook data
    console.log('[WhatsApp Webhook] Parsed data:', JSON.stringify(data, null, 2));

    // Check if this is a message event
    if (data.object === 'whatsapp_business_account') {
      // Process each entry
      for (const entry of data.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value;
            
            // Process messages
            if (value.messages && value.messages.length > 0) {
              for (const message of value.messages) {
                await processMessage(message, value.metadata);
              }
            }

            // Process statuses (delivery receipts, read receipts, etc.)
            if (value.statuses && value.statuses.length > 0) {
              for (const status of value.statuses) {
                await processStatus(status);
              }
            }
          }
        }
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`[WhatsApp Webhook] Processing completed in ${processingTime}ms`);

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('[WhatsApp Webhook] Error processing message:', error);
    console.error(`[WhatsApp Webhook] Failed after ${processingTime}ms`);

    // Still return 200 to prevent WhatsApp from retrying
    // Log the error for manual investigation
    return NextResponse.json(
      { success: false, error: 'Processing error' },
      { status: 200 }
    );
  }
}

/**
 * Process an incoming message
 */
async function processMessage(message: any, metadata: any) {
  try {
    console.log('[WhatsApp Webhook] Processing message:', {
      id: message.id,
      from: message.from,
      type: message.type,
      timestamp: message.timestamp,
    });

    // Import message handler dynamically to avoid circular dependencies
    const { handleIncomingMessage } = await import('@/lib/whatsapp/message-handler');
    
    await handleIncomingMessage({
      messageId: message.id,
      from: message.from,
      type: message.type,
      timestamp: parseInt(message.timestamp),
      content: message,
      metadata,
    });

    console.log('[WhatsApp Webhook] Message processed successfully:', message.id);
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing message:', error);
    throw error;
  }
}

/**
 * Process a status update (delivery receipt, read receipt, etc.)
 */
async function processStatus(status: any) {
  try {
    console.log('[WhatsApp Webhook] Processing status:', {
      id: status.id,
      status: status.status,
      timestamp: status.timestamp,
    });

    // TODO: Implement status tracking
    // This could update message delivery status in the database
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing status:', error);
  }
}
