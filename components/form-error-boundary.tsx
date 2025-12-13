"use client";

import React, { ReactNode } from "react";
import ErrorBoundary from "./error-boundary";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/error-logger";

interface FormErrorBoundaryProps {
  children: ReactNode;
  formName?: string;
}

export default function FormErrorBoundary({
  children,
  formName = "form",
}: FormErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logError({
      error,
      errorInfo,
      context: {
        component: "form",
        formName,
      },
      level: "error",
    });
  };

  const fallback = (error: Error, reset: () => void) => (
    <div className="border border-red-200 bg-red-50 rounded-lg p-6 my-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-red-800">Form Error</h3>
          <p className="text-sm text-red-700 mt-1">
            The {formName} encountered an error and couldn&apos;t be displayed.
          </p>
          <p className="text-xs text-red-600 mt-2 font-mono bg-red-100 p-2 rounded">
            {error.message}
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={reset} size="sm">
              Reload Form
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError} level="component">
      {children}
    </ErrorBoundary>
  );
}
