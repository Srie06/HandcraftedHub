"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDocument } from "@/lib/firebase/firestore";
import { useProducts } from "@/hooks/use-products";
import { UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeleton-loader";
import { User, ArrowLeft, Package } from "lucide-react";

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Fetch seller's products using the useProducts hook with sellerId filter
  const { products, loading: productsLoading } = useProducts({
    sellerId: sellerId,
  });

  useEffect(() => {
    async function fetchSeller() {
      try {
        setLoading(true);

        // Fetch seller profile data
        const sellerData = await getDocument("users", sellerId);

        if (!sellerData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setSeller(sellerData as UserProfile);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching seller profile:", error);
        setNotFound(true);
        setLoading(false);
      }
    }

    if (sellerId) {
      fetchSeller();
    }
  }, [sellerId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="h-10 w-24 bg-muted/50 rounded animate-pulse mb-6" />
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-muted/50 animate-pulse" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted/50 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="h-8 w-64 bg-muted/50 rounded animate-pulse mb-6" />
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    );
  }

  // 404 Not Found
  if (notFound || !seller) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-4xl font-bold mb-4">Seller Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The seller profile you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push("/")} size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Seller Information Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              </div>

              {/* Seller Details */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {seller.displayName}
                </h1>
                <p className="text-muted-foreground mb-4">{seller.email}</p>
                {seller.bio && (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {seller.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Package className="h-6 w-6" />
            Products by {seller.displayName}
          </h2>

          {/* Loading State */}
          {productsLoading && <ProductGridSkeleton count={4} />}

          {/* Empty State */}
          {!productsLoading && !hasProducts && (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold mb-2">
                    No Products Yet
                  </h3>
                  <p className="text-muted-foreground">
                    {seller.displayName} hasn&apos;t listed any products yet.
                    Check back later!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Grid */}
          {!productsLoading && hasProducts && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
