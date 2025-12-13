/**
 * Validation utilities for form inputs
 * Provides reusable validation functions with user-friendly error messages
 */

/**
 * Email validation
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "Email is required";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  return null;
}

/**
 * Password validation
 */
export function validatePassword(password: string, minLength: number = 6): string | null {
  if (!password) {
    return "Password is required";
  }
  
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  
  return null;
}

/**
 * Required field validation
 */
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Minimum length validation
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}

/**
 * Positive number validation
 */
export function validatePositiveNumber(value: string, fieldName: string): string | null {
  if (!value) {
    return `${fieldName} is required`;
  }
  
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a positive number`;
  }
  
  return null;
}

/**
 * Non-negative number validation
 */
export function validateNonNegativeNumber(value: string, fieldName: string): string | null {
  if (!value) {
    return `${fieldName} is required`;
  }
  
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a non-negative number`;
  }
  
  return null;
}

/**
 * Image file validation
 */
export interface ImageValidationOptions {
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(
  file: File,
  options: ImageValidationOptions = {}
): ImageValidationResult {
  const {
    maxSizeInMB = 10,
    allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Please upload an image file (${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')})`,
    };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeInMB}MB. Please choose a smaller image.`,
    };
  }

  return { valid: true };
}

/**
 * Validate multiple image files
 */
export function validateImageFiles(
  files: File[],
  options: ImageValidationOptions = {}
): { validFiles: File[]; invalidFiles: Array<{ file: File; error: string }> } {
  const validFiles: File[] = [];
  const invalidFiles: Array<{ file: File; error: string }> = [];

  files.forEach((file) => {
    const result = validateImageFile(file, options);
    if (result.valid) {
      validFiles.push(file);
    } else {
      invalidFiles.push({ file, error: result.error || "Invalid file" });
    }
  });

  return { validFiles, invalidFiles };
}

/**
 * Firebase Auth error code to user-friendly message mapping
 */
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists",
    "auth/weak-password": "Password is too weak. Please use a stronger password with at least 6 characters",
    "auth/invalid-email": "Invalid email address",
    "auth/user-not-found": "Invalid email or password",
    "auth/wrong-password": "Invalid email or password",
    "auth/invalid-credential": "Invalid email or password",
    "auth/too-many-requests": "Too many failed attempts. Please try again later",
    "auth/user-disabled": "This account has been disabled",
    "auth/operation-not-allowed": "This operation is not allowed",
    "auth/network-request-failed": "Network error. Please check your connection and try again",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again";
}

/**
 * Firebase Storage error code to user-friendly message mapping
 */
export function getFirebaseStorageErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "storage/unauthorized": "You don't have permission to upload files",
    "storage/canceled": "Upload was canceled",
    "storage/unknown": "An unknown error occurred during upload",
    "storage/object-not-found": "File not found",
    "storage/bucket-not-found": "Storage bucket not found",
    "storage/quota-exceeded": "Storage quota exceeded",
    "storage/unauthenticated": "Please log in to upload files",
    "storage/retry-limit-exceeded": "Upload failed after multiple retries. Please try again",
  };

  return errorMessages[errorCode] || "Failed to upload file. Please try again";
}

/**
 * Firebase Firestore error code to user-friendly message mapping
 */
export function getFirebaseFirestoreErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "permission-denied": "You don't have permission to perform this action",
    "not-found": "The requested data was not found",
    "already-exists": "This item already exists",
    "failed-precondition": "Operation failed. Please try again",
    "aborted": "Operation was aborted. Please try again",
    "out-of-range": "Invalid value provided",
    "unimplemented": "This feature is not yet implemented",
    "internal": "An internal error occurred. Please try again",
    "unavailable": "Service is temporarily unavailable. Please try again later",
    "data-loss": "Data loss occurred. Please contact support",
    "unauthenticated": "Please log in to continue",
  };

  return errorMessages[errorCode] || "An error occurred. Please try again";
}

/**
 * Generic Firebase error handler
 */
export function getFirebaseErrorMessage(error: any): string {
  if (!error) {
    return "An unknown error occurred";
  }

  // Check for error code
  if (error.code) {
    // Try auth errors first
    if (error.code.startsWith("auth/")) {
      return getFirebaseAuthErrorMessage(error.code);
    }
    // Try storage errors
    if (error.code.startsWith("storage/")) {
      return getFirebaseStorageErrorMessage(error.code);
    }
    // Try firestore errors
    return getFirebaseFirestoreErrorMessage(error.code);
  }

  // Fallback to error message if available
  if (error.message) {
    return error.message;
  }

  return "An error occurred. Please try again";
}
