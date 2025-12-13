/**
 * WhatsApp Message Parser
 * Parses different types of WhatsApp messages and extracts relevant data
 */

export interface ParsedMessage {
  messageId: string;
  from: string;
  timestamp: number;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'unknown';
  content: TextContent | MediaContent | null;
  metadata: MessageMetadata;
}

export interface TextContent {
  body: string;
}

export interface MediaContent {
  id: string;
  mimeType: string;
  sha256: string;
  caption?: string;
  filename?: string;
  // For audio/video
  duration?: number;
  // For images
  width?: number;
  height?: number;
}

export interface MessageMetadata {
  phoneNumberId: string;
  displayPhoneNumber: string;
  profileName?: string;
}

/**
 * Parse an incoming WhatsApp message
 */
export function parseMessage(rawMessage: any, metadata: any): ParsedMessage {
  const messageId = rawMessage.id;
  const from = rawMessage.from;
  const timestamp = parseInt(rawMessage.timestamp);
  const type = rawMessage.type;

  console.log('[Message Parser] Parsing message:', {
    messageId,
    from,
    type,
    timestamp,
  });

  let content: TextContent | MediaContent | null = null;

  try {
    switch (type) {
      case 'text':
        content = parseTextMessage(rawMessage);
        break;
      case 'image':
        content = parseImageMessage(rawMessage);
        break;
      case 'audio':
        content = parseAudioMessage(rawMessage);
        break;
      case 'video':
        content = parseVideoMessage(rawMessage);
        break;
      case 'document':
        content = parseDocumentMessage(rawMessage);
        break;
      default:
        console.warn('[Message Parser] Unknown message type:', type);
        content = null;
    }
  } catch (error) {
    console.error('[Message Parser] Error parsing message content:', error);
    content = null;
  }

  const parsedMetadata: MessageMetadata = {
    phoneNumberId: metadata?.phone_number_id || '',
    displayPhoneNumber: metadata?.display_phone_number || '',
    profileName: rawMessage.from_name || undefined,
  };

  return {
    messageId,
    from,
    timestamp,
    type: isValidMessageType(type) ? type : 'unknown',
    content,
    metadata: parsedMetadata,
  };
}

/**
 * Parse a text message
 */
function parseTextMessage(message: any): TextContent {
  const body = message.text?.body || '';
  
  console.log('[Message Parser] Parsed text message:', {
    bodyLength: body.length,
  });

  return { body };
}

/**
 * Parse an image message
 */
function parseImageMessage(message: any): MediaContent {
  const image = message.image;
  
  if (!image || !image.id) {
    throw new Error('Invalid image message structure');
  }

  console.log('[Message Parser] Parsed image message:', {
    id: image.id,
    mimeType: image.mime_type,
    caption: image.caption ? 'present' : 'none',
  });

  return {
    id: image.id,
    mimeType: image.mime_type || 'image/jpeg',
    sha256: image.sha256 || '',
    caption: image.caption,
  };
}

/**
 * Parse an audio message
 */
function parseAudioMessage(message: any): MediaContent {
  const audio = message.audio;
  
  if (!audio || !audio.id) {
    throw new Error('Invalid audio message structure');
  }

  console.log('[Message Parser] Parsed audio message:', {
    id: audio.id,
    mimeType: audio.mime_type,
    duration: audio.duration,
  });

  return {
    id: audio.id,
    mimeType: audio.mime_type || 'audio/ogg',
    sha256: audio.sha256 || '',
    duration: audio.duration,
  };
}

/**
 * Parse a video message
 */
function parseVideoMessage(message: any): MediaContent {
  const video = message.video;
  
  if (!video || !video.id) {
    throw new Error('Invalid video message structure');
  }

  console.log('[Message Parser] Parsed video message:', {
    id: video.id,
    mimeType: video.mime_type,
    caption: video.caption ? 'present' : 'none',
  });

  return {
    id: video.id,
    mimeType: video.mime_type || 'video/mp4',
    sha256: video.sha256 || '',
    caption: video.caption,
  };
}

/**
 * Parse a document message
 */
function parseDocumentMessage(message: any): MediaContent {
  const document = message.document;
  
  if (!document || !document.id) {
    throw new Error('Invalid document message structure');
  }

  console.log('[Message Parser] Parsed document message:', {
    id: document.id,
    mimeType: document.mime_type,
    filename: document.filename,
  });

  return {
    id: document.id,
    mimeType: document.mime_type || 'application/octet-stream',
    sha256: document.sha256 || '',
    filename: document.filename,
    caption: document.caption,
  };
}

/**
 * Type guard for valid message types
 */
function isValidMessageType(type: string): type is 'text' | 'image' | 'audio' | 'video' | 'document' {
  return ['text', 'image', 'audio', 'video', 'document'].includes(type);
}

/**
 * Extract phone number from WhatsApp format
 * Removes country code prefix if needed
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // WhatsApp phone numbers are in international format
  // Keep as is for now
  return digits;
}

/**
 * Validate message structure
 */
export function isValidMessage(message: any): boolean {
  if (!message) return false;
  if (!message.id) return false;
  if (!message.from) return false;
  if (!message.timestamp) return false;
  if (!message.type) return false;
  
  return true;
}
