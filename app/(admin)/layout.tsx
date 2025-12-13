"use client";

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Allow access without authentication for testing/demo purposes
  // In production, you would add authentication checks here

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-orange-600">
                HandcraftedHub Admin
              </h1>
              <p className="text-sm text-gray-500">
                Manage product drafts and test WhatsApp integration
              </p>
            </div>
            <nav className="flex gap-6">
              <Link
                href="/product-drafts"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                Product Drafts
              </Link>
              <Link
                href="/whatsapp-simulator"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                WhatsApp Simulator
              </Link>
              <Link
                href="/home"
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
              >
                Back to Site
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
