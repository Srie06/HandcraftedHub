"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/contexts/wishlist-context";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0] || "/placeholder-product.png";
  const isOutOfStock = product.stock === 0;
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const { toast } = useToast();

  const isWishlisted = isInWishlist(product.id);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();

    if (isToggling) return;

    setIsToggling(true);

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast({
          title: "Removed from Wishlist",
          description: `${product.title} has been removed from your wishlist.`,
        });
      } else {
        await addToWishlist(product);
        toast({
          title: "Added to Wishlist",
          description: `${product.title} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <Card className="artisan-card overflow-hidden transition-all duration-300 hover:shadow-cultural-lg hover:-translate-y-1 h-full flex flex-col rounded-xl border-2">
        <div className="relative aspect-square overflow-hidden bg-muted rounded-t-xl">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Wishlist Heart Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 w-10 h-10 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
              isWishlisted
                ? "bg-rose-100 hover:bg-rose-200"
                : "bg-white/80 hover:bg-white"
            }`}
            onClick={handleWishlistToggle}
            disabled={isToggling}
          >
            <Heart
              className={`w-5 h-5 transition-colors duration-300 ${
                isWishlisted
                  ? "text-rose-600 fill-rose-600"
                  : "text-gray-600 hover:text-rose-600"
              } ${isToggling ? "animate-pulse" : ""}`}
            />
          </Button>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-display font-semibold text-lg line-clamp-2 mb-2 transition-colors duration-300 group-hover:text-terracotta">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
            {product.category}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto">
          <span className="text-xl font-bold text-terracotta">
            ${product.price.toFixed(2)}
          </span>
          {!isOutOfStock && (
            <span className="text-xs text-muted-foreground">
              {product.stock} in stock
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
