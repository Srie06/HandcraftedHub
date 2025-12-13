/**
 * WhatsApp Media Download Handler
 * Downloads media from WhatsApp and uploads to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface DownloadedMedia {
  whatsappMediaId: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mimeType: string;
  size: number;
  downloadedAt: number;
}

/**
 * Download media from WhatsApp and upload to Cloudinary
 */
export async function downloadAndUploadMedia(
  mediaId: string,
  mimeType: string,
  folder: string = 'whatsapp-media'
): Promise<DownloadedMedia> {
  console.log('[Media Handler] Starting download for media:', mediaId);

  let lastError: Error | null = null;

  // Retry logic
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Media Handler] Download attempt ${attempt}/${MAX_RETRIES}`);

      // Step 1: Get media URL from WhatsApp
      const mediaUrl = await getMediaUrl(mediaId);

      // Step 2: Download media from WhatsApp
      const mediaBuffer = await downloadMediaFromUrl(mediaUrl);

      // Step 3: Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(
        mediaBuffer,
        mimeType,
        folder,
        mediaId
      );

      console.log('[Media Handler] Successfully processed media:', {
        mediaId,
        cloudinaryUrl: cloudinaryResult.secure_url,
        size: mediaBuffer.length,
      });

      return {
        whatsappMediaId: mediaId,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        mimeType,
        size: mediaBuffer.length,
        downloadedAt: Date.now(),
      };
    } catch (error) {
      lastError = error as Error;
      console.error(`[Media Handler] Attempt ${attempt} failed:`, error);

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`[Media Handler] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  // All retries failed
  console.error('[Media Handler] All download attempts failed for media:', mediaId);
  throw new Error(
    `Failed to download media after ${MAX_RETRIES} attempts: ${lastError?.message}`
  );
}

/**
 * Get media URL from WhatsApp API
 */
async function getMediaUrl(mediaId: string): Promise<string> {
  const url = `https://graph.facebook.com/v18.0/${mediaId}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get media URL: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.url) {
    throw new Error('Media URL not found in response');
  }

  return data.url;
}

/**
 * Download media from WhatsApp URL
 */
async function downloadMediaFromUrl(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download media: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upload media to Cloudinary
 */
async function uploadToCloudinary(
  buffer: Buffer,
  mimeType: string,
  folder: string,
  mediaId: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const resourceType = getCloudinaryResourceType(mimeType);
    
    // Convert buffer to base64 data URI
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        resource_type: resourceType,
        public_id: `whatsapp_${mediaId}_${Date.now()}`,
        // Optimize images
        ...(resourceType === 'image' && {
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
          ],
        }),
      },
      (error, result) => {
        if (error) {
          console.error('[Media Handler] Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
}

/**
 * Determine Cloudinary resource type from MIME type
 */
function getCloudinaryResourceType(mimeType: string): 'image' | 'video' | 'raw' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else {
    return 'raw'; // For audio and other files
  }
}

/**
 * Download multiple media files in parallel
 */
export async function downloadMultipleMedia(
  mediaItems: Array<{ id: string; mimeType: string }>
): Promise<DownloadedMedia[]> {
  console.log('[Media Handler] Downloading multiple media files:', mediaItems.length);

  const downloadPromises = mediaItems.map((item) =>
    downloadAndUploadMedia(item.id, item.mimeType)
  );

  const results = await Promise.allSettled(downloadPromises);

  const successful: DownloadedMedia[] = [];
  const failed: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      failed.push(mediaItems[index].id);
      console.error(
        `[Media Handler] Failed to download media ${mediaItems[index].id}:`,
        result.reason
      );
    }
  });

  console.log('[Media Handler] Download summary:', {
    total: mediaItems.length,
    successful: successful.length,
    failed: failed.length,
  });

  if (failed.length > 0) {
    console.warn('[Media Handler] Some media downloads failed:', failed);
  }

  return successful;
}

/**
 * Extract audio from video file
 * Returns the Cloudinary URL of the extracted audio
 */
export async function extractAudioFromVideo(
  videoCloudinaryUrl: string
): Promise<string> {
  // Cloudinary can extract audio using transformations
  // Replace the file extension with .mp3 and add audio transformation
  const publicId = extractPublicIdFromUrl(videoCloudinaryUrl);
  
  const audioUrl = cloudinary.url(publicId, {
    resource_type: 'video',
    format: 'mp3',
    flags: 'attachment',
  });

  console.log('[Media Handler] Extracted audio URL from video:', audioUrl);
  
  return audioUrl;
}

/**
 * Extract public ID from Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string {
  // Extract public ID from Cloudinary URL
  // Example: https://res.cloudinary.com/cloud/image/upload/v123/folder/file.jpg
  const parts = url.split('/upload/');
  if (parts.length < 2) {
    throw new Error('Invalid Cloudinary URL');
  }
  
  const pathParts = parts[1].split('/');
  // Remove version if present (v123456)
  const startIndex = pathParts[0].startsWith('v') ? 1 : 0;
  
  // Join remaining parts and remove extension
  const publicIdWithExt = pathParts.slice(startIndex).join('/');
  const publicId = publicIdWithExt.replace(/\.[^.]+$/, '');
  
  return publicId;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate media file size
 */
export function isValidMediaSize(size: number, type: 'image' | 'audio' | 'video'): boolean {
  const MAX_SIZES = {
    image: 5 * 1024 * 1024, // 5MB
    audio: 16 * 1024 * 1024, // 16MB
    video: 16 * 1024 * 1024, // 16MB
  };

  return size <= MAX_SIZES[type];
}
