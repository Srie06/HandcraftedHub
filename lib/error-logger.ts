/**
 * Error logging utility for HandcraftedHub
 * 
 * This module provides centralized error logging functionality.
 * In production, you would integrate with services like:
 * - Sentry
 * - LogRocket
 * - Datadog
 * - Custom logging endpoint
 */

export interface ErrorLogData {
  error: Error;
  errorInfo?: React.ErrorInfo;
  context?: {
    page?: string;
    component?: string;
    userId?: string;
    url?: string;
    userAgent?: string;
    timestamp?: string;
    [key: string]: any;
  };
  level?: "error" | "warning" | "info";
}

/**
 * Log an error to the console and external services
 */
export function logError(data: ErrorLogData): void {
  const {
    error,
    errorInfo,
    context = {},
    level = "error",
  } = data;

  // Add timestamp if not provided
  const timestamp = context.timestamp || new Date().toISOString();

  // Add browser context
  const enrichedContext = {
    ...context,
    timestamp,
    url: typeof window !== "undefined" ? window.location.href : context.url,
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : context.userAgent,
  };

  // Console logging (always in development, configurable in production)
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 ${level.toUpperCase()}: ${error.message}`);
    console.error("Error:", error);
    if (errorInfo) {
      console.error("Component Stack:", errorInfo.componentStack);
    }
    console.error("Context:", enrichedContext);
    console.groupEnd();
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === "production") {
    // Example: Sentry integration
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     level,
    //     extra: {
    //       ...enrichedContext,
    //       componentStack: errorInfo?.componentStack,
    //     },
    //   });
    // }

    // Example: Custom logging endpoint
    // fetch("/api/log-error", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     message: error.message,
    //     stack: error.stack,
    //     componentStack: errorInfo?.componentStack,
    //     context: enrichedContext,
    //     level,
    //   }),
    // }).catch((err) => {
    //   console.error("Failed to log error to server:", err);
    // });
  }
}

/**
 * Log a warning (non-critical error)
 */
export function logWarning(error: Error, context?: ErrorLogData["context"]): void {
  logError({ error, context, level: "warning" });
}

/**
 * Log info (for tracking non-error events)
 */
export function logInfo(message: string, context?: ErrorLogData["context"]): void {
  const error = new Error(message);
  logError({ error, context, level: "info" });
}

/**
 * Create a user-friendly error message from an error object
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  // Firebase Auth errors
  if (error.message.includes("auth/")) {
    const authErrors: Record<string, string> = {
      "auth/email-already-in-use": "This email is already registered. Please try logging in instead.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/weak-password": "Password should be at least 6 characters long.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/too-many-requests": "Too many failed attempts. Please try again later.",
      "auth/network-request-failed": "Network error. Please check your connection.",
    };

    for (const [code, message] of Object.entries(authErrors)) {
      if (error.message.includes(code)) {
        return message;
      }
    }
  }

  // Firestore errors
  if (error.message.includes("firestore/")) {
    if (error.message.includes("permission-denied")) {
      return "You don't have permission to perform this action.";
    }
    if (error.message.includes("not-found")) {
      return "The requested item could not be found.";
    }
    if (error.message.includes("unavailable")) {
      return "Service temporarily unavailable. Please try again.";
    }
  }

  // Storage errors
  if (error.message.includes("storage/")) {
    if (error.message.includes("unauthorized")) {
      return "You don't have permission to upload files.";
    }
    if (error.message.includes("canceled")) {
      return "Upload was canceled.";
    }
    if (error.message.includes("unknown")) {
      return "Upload failed. Please try again.";
    }
  }

  // Network errors
  if (error.message.includes("network") || error.message.includes("fetch")) {
    return "Network error. Please check your internet connection.";
  }

  // Default fallback
  return "An unexpected error occurred. Please try again.";
}
