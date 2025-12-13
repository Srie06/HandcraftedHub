"use client";

import React, { ReactNode } from "react";
import ErrorBoundary from "./error-boundary";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logError } from "@/lib/error-logger";

interface CartErrorBoundaryProps {
  children: ReactNode;
}

export default function CartErrorBoundary({
  children,
}: CartErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logError({
      error,
      errorInfo,
      context: {
        component: "cart",
      },
      level: "error",
    });
  };

  const fallback = (error: Error, reset: () => void) => (
    <CartErrorFallback error={error} reset={reset} />
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError} level="component">
      {children}
    </ErrorBoundary>
  );
}

function CartErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
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
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-red-800">Cart Error</h3>
          <p className="text-sm text-red-700 mt-1">
            Your shopping cart encountered an error. Your items may not be
            displayed correctly.
          </p>
          <p className="text-xs text-red-600 mt-2 font-mono bg-red-100 p-2 rounded">
            {error.message}
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={reset} size="sm">
              Reload Cart
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
