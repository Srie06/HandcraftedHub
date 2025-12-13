"use client";

import React, { ReactNode } from "react";
import ErrorBoundary from "./error-boundary";
import { logError } from "@/lib/error-logger";

interface RootErrorBoundaryProps {
  children: ReactNode;
}

export default function RootErrorBoundary({
  children,
}: RootErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logError({
      error,
      errorInfo,
      context: {
        boundary: "root",
        critical: true,
      },
      level: "error",
    });
  };

  return (
    <ErrorBoundary onError={handleError} level="root">
      {children}
    </ErrorBoundary>
  );
}
