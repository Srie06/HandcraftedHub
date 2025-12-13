"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartContextType, CartItem, Product } from "@/types";
import { useAuth } from "./auth-context";

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY_PREFIX = "handcrafted-hub-cart";

/**
 * Serialize cart items for localStorage
 * Converts Firestore Timestamps to ISO strings for JSON compatibility
 */
function serializeCart(items: CartItem[]): string {
  const serializable = items.map((item) => ({
    product: {
      ...item.product,
      createdAt: item.product.createdAt.toDate().toISOString(),
      updatedAt: item.product.updatedAt?.toDate().toISOString(),
    },
    quantity: item.quantity,
  }));
  return JSON.stringify(serializable);
}

/**
 * Deserialize cart items from localStorage
 * Converts ISO strings back to Firestore Timestamp objects
 */
function deserializeCart(data: string): CartItem[] {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      product: {
        ...item.product,
        createdAt: {
          toDate: () => new Date(item.product.createdAt),
          seconds: Math.floor(
            new Date(item.product.createdAt).getTime() / 1000
          ),
          nanoseconds: 0,
        },
        updatedAt: item.product.updatedAt
          ? {
              toDate: () => new Date(item.product.updatedAt),
              seconds: Math.floor(
                new Date(item.product.updatedAt).getTime() / 1000
              ),
              nanoseconds: 0,
            }
          : undefined,
      },
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error("Failed to deserialize cart:", error);
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get user-specific storage key
  const getStorageKey = () => {
    if (!user) return null;
    return `${CART_STORAGE_KEY_PREFIX}-${user.uid}`;
  };

  // Restore cart from localStorage when user changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = getStorageKey();

      if (storageKey) {
        // User is logged in - load their cart
        const storedCart = localStorage.getItem(storageKey);
        if (storedCart) {
          const restoredItems = deserializeCart(storedCart);
          setItems(restoredItems);
        } else {
          setItems([]);
        }
      } else {
        // No user - clear cart
        setItems([]);
      }

      setIsInitialized(true);
    }
  }, [user?.uid]); // Re-run when user changes

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const storageKey = getStorageKey();

      if (storageKey) {
        if (items.length > 0) {
          const serialized = serializeCart(items);
          localStorage.setItem(storageKey, serialized);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    }
  }, [items, isInitialized, user?.uid]);

  // Calculate derived values
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  /**
   * Add item to cart with duplicate detection
   * If product already exists, increment quantity instead
   */
  const addItem = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product.id === product.id
      );

      if (existingItemIndex >= 0) {
        // Product already in cart - increment quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // New product - add to cart
        return [...currentItems, { product, quantity }];
      }
    });
  };

  /**
   * Remove item from cart by product ID
   */
  const removeItem = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  };

  /**
   * Update quantity of cart item with stock validation
   * If quantity is 0 or less, remove the item
   * If quantity exceeds stock, prevent the update
   */
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      removeItem(productId);
      return;
    }

    setItems((currentItems) => {
      const itemIndex = currentItems.findIndex(
        (item) => item.product.id === productId
      );

      if (itemIndex === -1) {
        return currentItems;
      }

      const item = currentItems[itemIndex];

      // Validate against available stock
      if (quantity > item.product.stock) {
        console.warn(
          `Cannot update quantity to ${quantity}. Only ${item.product.stock} items in stock.`
        );
        return currentItems;
      }

      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = {
        ...item,
        quantity,
      };
      return updatedItems;
    });
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setItems([]);
  };

  const value: CartContextType = {
    items,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Custom hook to access cart context
 * Must be used within CartProvider
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
