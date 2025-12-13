/**
 * Storage utility - Now using Cloudinary instead of Firebase Storage
 * This file maintains the same API for compatibility with existing code
 */

import {
  uploadImageToCloudinary,
  uploadMultipleImagesToCloudinary,
  deleteImageFromCloudinary,
  deleteMultipleImagesFromCloudinary,
} from "../cloudinary";

/**
 * Upload a file (now using Cloudinary)
 * @param path - Storage path (used as folder in Cloudinary)
 * @param file - File to upload
 * @returns Download URL of the uploaded file
 */
export async function uploadFile(path: string, file: File): Promise<string> {
  // Extract folder from path (e.g., 'products/product-id' -> 'products')
  const folder = path.split("/")[0] || "products";
  return uploadImageToCloudinary(file, folder);
}

/**
 * Upload multiple files (now using Cloudinary)
 * @param basePath - Base storage path (used as folder in Cloudinary)
 * @param files - Array of files to upload
 * @returns Array of download URLs
 */
export async function uploadMultipleFiles(
  basePath: string,
  files: File[]
): Promise<string[]> {
  // Extract folder from path
  const folder = basePath.split("/")[0] || "products";
  return uploadMultipleImagesToCloudinary(files, folder);
}

/**
 * Delete a file (now using Cloudinary)
 * @param path - Download URL or path of the file to delete
 */
export async function deleteFile(path: string): Promise<void> {
  return deleteImageFromCloudinary(path);
}

/**
 * Delete multiple files (now using Cloudinary)
 * @param paths - Array of download URLs or paths to delete
 */
export async function deleteMultipleFiles(paths: string[]): Promise<void> {
  return deleteMultipleImagesFromCloudinary(paths);
}

/**
 * Delete files by their download URLs (now using Cloudinary)
 * @param urls - Array of download URLs to delete
 */
export async function deleteFilesByURLs(urls: string[]): Promise<void> {
  return deleteMultipleImagesFromCloudinary(urls);
}

/**
 * Get download URL for a file (Cloudinary URLs are already download URLs)
 * @param path - Storage path of the file
 * @returns Download URL
 */
export async function getFileURL(path: string): Promise<string> {
  // For Cloudinary, the path IS the URL
  return path;
}

/**
 * Extract storage path from a URL (for Cloudinary compatibility)
 * @param url - Image URL
 * @returns URL itself (Cloudinary URLs are self-contained)
 */
export function extractStoragePathFromURL(url: string): string | null {
  return url;
}
