"use client";

import React, { ReactNode } from "react";
import ErrorBoundary from "./error-boundary";
import { logError } from "@/lib/error-logger";

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

export default function PageErrorBoundary({
  children,
  pageName,
}: PageErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logError({
      error,
      errorInfo,
      context: {
        page: pageName || "unknown",
      },
      level: "error",
    });
  };

  return (
    <ErrorBoundary onError={handleError} level="page">
      {children}
    </ErrorBoundary>
  );
}
