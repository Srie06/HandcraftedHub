/**
 * Cloudinary Image Upload Utility
 * Handles image uploads to Cloudinary for product images
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload a single image to Cloudinary
 * @param file - The image file to upload
 * @param folder - Optional folder path in Cloudinary
 * @returns Promise with the uploaded image URL
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = "products"
): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary cloud name is not configured");
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary upload preset is not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(error.message || "Failed to upload image to Cloudinary");
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @param folder - Optional folder path in Cloudinary
 * @returns Promise with array of uploaded image URLs
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  folder: string = "products"
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadImageToCloudinary(file, folder)
  );

  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error: any) {
    console.error("Error uploading multiple images:", error);
    throw new Error("Failed to upload one or more images");
  }
}

/**
 * Delete an image from Cloudinary by URL
 * @param imageUrl - The Cloudinary image URL to delete
 * @returns Promise<void>
 */
export async function deleteImageFromCloudinary(
  imageUrl: string
): Promise<void> {
  // Extract public_id from Cloudinary URL
  // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
  try {
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex === -1) {
      throw new Error("Invalid Cloudinary URL");
    }

    // Get everything after 'upload/v{version}/'
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExtension.substring(
      0,
      publicIdWithExtension.lastIndexOf(".")
    );

    console.log("Deleting image with public_id:", publicId);
    // Note: Deletion requires server-side API call with API secret
    // For now, we'll just log it. Images can be managed in Cloudinary dashboard
    // To implement deletion, you'd need a server-side API route
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Don't throw error - deletion is not critical
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param imageUrls - Array of Cloudinary image URLs to delete
 * @returns Promise<void>
 */
export async function deleteMultipleImagesFromCloudinary(
  imageUrls: string[]
): Promise<void> {
  const deletePromises = imageUrls.map((url) =>
    deleteImageFromCloudinary(url)
  );

  try {
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting multiple images:", error);
    // Don't throw error - deletion is not critical
  }
}

/**
 * Get optimized image URL from Cloudinary
 * @param imageUrl - Original Cloudinary image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!imageUrl.includes("cloudinary.com")) {
    return imageUrl;
  }

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push("f_auto"); // Auto format

  const transformation = transformations.join(",");

  // Insert transformation into URL
  return imageUrl.replace("/upload/", `/upload/${transformation}/`);
}
