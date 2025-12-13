"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { Heart, ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    wishlistItems,
    loading: wishlistLoading,
    removeFromWishlist,
  } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleAddToCart = (product: any) => {
    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    addItem(product, 1);
    toast({
      title: "Added to Cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = async (
    productId: string,
    productTitle: string
  ) => {
    try {
      await removeFromWishlist(productId);
      toast({
        title: "Removed from Wishlist",
        description: `${productTitle} has been removed from your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || wishlistLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-amber-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2 flex items-center gap-3">
            <Heart className="w-10 h-10 text-rose-600 fill-rose-600" />
            My Wishlist
          </h1>
          <p className="text-amber-800/70">
            Your saved handcrafted treasures ({wishlistItems.length} items)
          </p>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <Heart className="w-24 h-24 text-amber-900/20 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-amber-800/70 mb-6">
                Start browsing and save your favorite handcrafted items!
              </p>
              <Link href="/">
                <Button className="bg-amber-900 hover:bg-amber-800 rounded-xl">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Discover Products
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
              const primaryImage =
                product.images[0] || "/placeholder-product.png";
              const isOutOfStock = product.stock === 0;

              return (
                <Card
                  key={product.id}
                  className="rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-300 group overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <Link href={`/product/${product.id}`}>
                        <div className="aspect-square overflow-hidden rounded-t-2xl bg-muted">
                          <Image
                            src={primaryImage}
                            alt={product.title}
                            width={300}
                            height={300}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
                        onClick={() =>
                          handleRemoveFromWishlist(product.id, product.title)
                        }
                      >
                        <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      </Button>

                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-2xl">
                          <Badge variant="destructive" className="text-sm">
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <Link href={`/product/${product.id}`}>
                          <h3 className="font-semibold text-amber-900 line-clamp-2 hover:text-primary transition-colors">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-amber-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {!isOutOfStock && (
                          <span className="text-xs text-emerald-600 font-medium">
                            {product.stock} in stock
                          </span>
                        )}
                      </div>

                      <Button
                        className="w-full rounded-xl bg-amber-900 hover:bg-amber-800"
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
