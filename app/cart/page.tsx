"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CartErrorBoundary from "@/components/cart-error-boundary";

function CartContent() {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleIncrement = (
    productId: string,
    currentQuantity: number,
    stock: number
  ) => {
    if (currentQuantity >= stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${stock} items available in stock.`,
        variant: "destructive",
      });
      return;
    }

    // Optimistic UI update
    setUpdatingItems((prev) => new Set(prev).add(productId));
    updateQuantity(productId, currentQuantity + 1);

    // Remove loading state after animation
    setTimeout(() => {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 300);
  };

  const handleDecrement = (productId: string, currentQuantity: number) => {
    // Optimistic UI update
    setUpdatingItems((prev) => new Set(prev).add(productId));
    updateQuantity(productId, currentQuantity - 1);

    // Remove loading state after animation
    setTimeout(() => {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 300);
  };

  const handleRemove = (productId: string, productTitle: string) => {
    // Optimistic UI update
    setUpdatingItems((prev) => new Set(prev).add(productId));

    setTimeout(() => {
      removeItem(productId);
      toast({
        title: "Item Removed",
        description: `${productTitle} has been removed from your cart.`,
      });
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 200);
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-pastel">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="text-6xl sm:text-8xl mb-6 animate-bounce">🛒</div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven&apos;t added any handcrafted items to your
              cart yet. Start browsing to discover unique products!
            </p>
            <Link href="/">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-pastel">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="mb-4 rounded-xl hover:bg-primary/10 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const subtotal = item.product.price * item.quantity;
              const isUpdating = updatingItems.has(item.product.id);

              return (
                <Card
                  key={item.product.id}
                  className={`rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-300 ${
                    isUpdating ? "opacity-70" : ""
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={
                            item.product.images[0] || "/placeholder-product.png"
                          }
                          alt={item.product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 128px"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <Link
                              href={`/product/${item.product.id}`}
                              className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                              {item.product.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {item.product.category}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleRemove(item.product.id, item.product.title)
                            }
                            disabled={isUpdating}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground mr-2">
                              Quantity:
                            </span>
                            <div className="flex items-center border rounded-lg shadow-soft">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-r-none"
                                onClick={() =>
                                  handleDecrement(
                                    item.product.id,
                                    item.quantity
                                  )
                                }
                                disabled={isUpdating}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-4 py-1 text-sm font-medium min-w-[3rem] text-center">
                                {isUpdating ? (
                                  <div className="h-3 w-3 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-l-none"
                                onClick={() =>
                                  handleIncrement(
                                    item.product.id,
                                    item.quantity,
                                    item.product.stock
                                  )
                                }
                                disabled={isUpdating}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              ({item.product.stock} available)
                            </span>
                          </div>

                          {/* Price and Subtotal */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                ${item.product.price.toFixed(2)} each
                              </p>
                              <p className="text-lg font-semibold">
                                ${subtotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 rounded-xl shadow-soft-lg">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>

                <div className="space-y-2 py-4 border-t border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                <Button size="lg" className="w-full" disabled>
                  Proceed to Checkout
                  <span className="ml-2 text-xs">(Coming Soon)</span>
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Taxes and shipping calculated at checkout
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <CartErrorBoundary>
      <CartContent />
    </CartErrorBoundary>
  );
}
