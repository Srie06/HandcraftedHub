"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader } from "./loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSeller?: boolean;
}

/**
 * ProtectedRoute component for authorization
 * Protects routes by checking authentication state and optionally seller role
 *
 * @param children - The content to render if authorized
 * @param requireSeller - If true, requires user to have seller role
 */
export default function ProtectedRoute({
  children,
  requireSeller = false,
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth state to be determined
    if (loading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login");
      return;
    }

    // If seller role is required, check user profile
    if (requireSeller) {
      // Wait for user profile to load
      if (!userProfile) {
        return;
      }

      // Redirect to home if user is not a seller
      if (userProfile.role !== "seller") {
        router.push("/");
        return;
      }
    }
  }, [user, userProfile, loading, requireSeller, router]);

  // Show loading state during verification
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  // If seller role is required, wait for profile and verify role
  if (requireSeller) {
    if (!userProfile) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      );
    }

    if (userProfile.role !== "seller") {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader />
        </div>
      );
    }
  }

  // User is authorized, render children
  return <>{children}</>;
}
