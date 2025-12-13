"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDocument } from "@/lib/firebase/firestore";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { Product, UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductDetailsSkeleton } from "@/components/skeleton-loader";
import { ShoppingCart, User, ArrowLeft, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProductAndSeller() {
      try {
        setLoading(true);

        // Fetch product data
        const productData = await getDocument("products", productId);

        if (!productData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProduct(productData as Product);

        // Fetch seller profile
        const sellerData = await getDocument("users", productData.sellerId);
        if (sellerData) {
          setSeller(sellerData as UserProfile);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setNotFound(true);
        setLoading(false);
      }
    }

    if (productId) {
      fetchProductAndSeller();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    // Optimistic UI update
    setIsAddingToCart(true);

    // Simulate async operation for smooth UX
    setTimeout(() => {
      addItem(product, 1);
      toast({
        title: "Added to Cart",
        description: `${product.title} has been added to your cart.`,
      });
      setIsAddingToCart(false);
    }, 300);
  };

  const handleWishlistToggle = async () => {
    if (!product || isTogglingWishlist) return;

    setIsTogglingWishlist(true);

    try {
      const isCurrentlyWishlisted = isInWishlist(product.id);

      if (isCurrentlyWishlisted) {
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
      setIsTogglingWishlist(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cultural">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-10 w-24 bg-muted/50 rounded-xl animate-pulse" />
          </div>
          <ProductDetailsSkeleton />
        </div>
      </div>
    );
  }

  // 404 Not Found
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
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

  const isOutOfStock = product.stock === 0;
  const currentImage =
    product.images[selectedImageIndex] || "/placeholder-product.png";
  const isWishlisted = product ? isInWishlist(product.id) : false;

  return (
    <div className="min-h-screen bg-gradient-cultural">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 rounded-xl hover:bg-primary/10 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-soft-lg">
              <Image
                src={currentImage}
                alt={product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-soft hover:shadow-soft-lg ${
                      selectedImageIndex === index
                        ? "border-primary scale-105"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Category Badge */}
            <Badge variant="secondary" className="text-sm">
              {product.category}
            </Badge>

            {/* Title */}
            <h1 className="text-4xl font-bold">{product.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
              {!isOutOfStock && (
                <span className="text-muted-foreground">
                  {product.stock} in stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
              >
                {isAddingToCart ? (
                  <>
                    <div className="h-5 w-5 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className={`rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 ${
                  isWishlisted
                    ? "bg-rose-50 border-rose-200 hover:bg-rose-100"
                    : "hover:bg-primary/5"
                }`}
                onClick={handleWishlistToggle}
                disabled={isTogglingWishlist}
              >
                <Heart
                  className={`h-5 w-5 transition-colors duration-300 ${
                    isWishlisted
                      ? "text-rose-600 fill-rose-600"
                      : "text-gray-600 hover:text-rose-600"
                  } ${isTogglingWishlist ? "animate-pulse" : ""}`}
                />
              </Button>
            </div>

            {/* Seller Information */}
            {seller && (
              <Card className="rounded-xl shadow-cultural artisan-card">
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2 text-terracotta">
                    <User className="h-5 w-5" />
                    Artisan Information
                  </h3>
                  <div className="space-y-2">
                    <Link
                      href={`/seller/${seller.uid}`}
                      className="text-lg font-medium hover:text-terracotta transition-colors"
                    >
                      {seller.displayName}
                    </Link>
                    {seller.bio && (
                      <p className="text-sm text-muted-foreground">
                        {seller.bio}
                      </p>
                    )}
                    <Link href={`/seller/${seller.uid}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white"
                      >
                        View Artisan Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Cultural Elements Section */}
        <div className="mt-12 space-y-8">
          <div className="divider-cultural"></div>

          {/* Artisan Story Section */}
          <Card className="rounded-xl shadow-cultural artisan-card texture-handcrafted">
            <CardContent className="p-8">
              <div className="mandala-decoration">
                <h2 className="font-display text-3xl font-semibold mb-6 text-terracotta text-center">
                  Artisan&apos;s Story
                </h2>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {seller?.bio ||
                    `Each piece from ${
                      seller?.displayName || "our artisan"
                    } carries the legacy of traditional craftsmanship passed down through generations. With skilled hands and a deep connection to cultural heritage, every creation tells a unique story of dedication, artistry, and the timeless beauty of handmade crafts.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Regional Context & Craft Technique */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regional Context */}
            <Card className="rounded-xl shadow-cultural artisan-card bg-gradient-cultural">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold mb-4 text-indigo flex items-center gap-2">
                  <span className="text-2xl">🗺️</span>
                  Regional Heritage
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  This {product.category.toLowerCase()} represents the rich
                  artistic traditions of India&apos;s diverse regions. Each area
                  brings its unique style, techniques, and cultural influences,
                  creating pieces that are both beautiful and meaningful.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className="bg-indigo text-white">
                    Traditional Craft
                  </Badge>
                  <Badge className="bg-terracotta text-white">Handmade</Badge>
                  <Badge className="bg-gold text-foreground">Authentic</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Craft Technique */}
            <Card className="rounded-xl shadow-cultural artisan-card bg-gradient-cultural-alt">
              <CardContent className="p-6">
                <h3 className="font-display text-xl font-semibold mb-4 text-terracotta flex items-center gap-2">
                  <span className="text-2xl">✋</span>
                  Craft Technique
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Created using time-honored techniques that have been refined
                  over centuries. The artisan&apos;s expertise ensures each
                  piece meets the highest standards of quality while preserving
                  traditional methods that make these crafts truly special.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-terracotta"></span>
                    <span>Hand-crafted with care</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-indigo"></span>
                    <span>Traditional methods</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-gold"></span>
                    <span>Unique artisan touch</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cultural Significance */}
          <Card className="rounded-xl shadow-cultural-lg artisan-card corner-accent bg-paisley">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-semibold mb-6 text-center text-gold">
                Cultural Significance
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-muted-foreground leading-relaxed text-center mb-6">
                  Handcrafted items are more than just products—they are
                  carriers of culture, tradition, and identity. By choosing
                  handmade, you support artisans who keep ancient crafts alive,
                  preserve cultural heritage, and sustain communities that have
                  practiced these arts for generations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-card/50">
                    <div className="text-3xl mb-2">🎨</div>
                    <h4 className="font-semibold text-sm mb-1">
                      Preserving Heritage
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Keeping traditions alive
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-card/50">
                    <div className="text-3xl mb-2">🤝</div>
                    <h4 className="font-semibold text-sm mb-1">
                      Supporting Artisans
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Empowering communities
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-card/50">
                    <div className="text-3xl mb-2">♻️</div>
                    <h4 className="font-semibold text-sm mb-1">
                      Sustainable Choice
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Eco-friendly crafts
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
