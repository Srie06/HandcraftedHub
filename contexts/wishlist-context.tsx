"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { Product } from "@/types";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface WishlistContextType {
  wishlistItems: Product[];
  wishlistIds: string[];
  loading: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const WISHLIST_STORAGE_KEY = "handcrafted-hub-wishlist";

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist from localStorage for unauthenticated users
  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsedIds = JSON.parse(stored);
        setWishlistIds(parsedIds);
        return parsedIds;
      }
    } catch (error) {
      console.error("Error loading wishlist from localStorage:", error);
    }
    return [];
  };

  // Save wishlist to localStorage
  const saveToLocalStorage = (ids: string[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error("Error saving wishlist to localStorage:", error);
    }
  };

  // Fetch product details for wishlist items
  const fetchWishlistProducts = async (productIds: string[]) => {
    if (productIds.length === 0) {
      setWishlistItems([]);
      return;
    }

    try {
      const productsQuery = query(
        collection(db, "products"),
        where("__name__", "in", productIds)
      );

      const querySnapshot = await getDocs(productsQuery);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });

      setWishlistItems(products);
    } catch (error) {
      console.error("Error fetching wishlist products:", error);
      setWishlistItems([]);
    }
  };

  // Load wishlist from Firestore for authenticated users
  const loadFromFirestore = async (userId: string) => {
    try {
      const wishlistDoc = await getDoc(doc(db, "wishlists", userId));

      if (wishlistDoc.exists()) {
        const data = wishlistDoc.data();
        const ids = data.productIds || [];
        setWishlistIds(ids);
        await fetchWishlistProducts(ids);
      } else {
        setWishlistIds([]);
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error loading wishlist from Firestore:", error);
      setWishlistIds([]);
      setWishlistItems([]);
    }
  };

  // Merge localStorage wishlist with Firestore when user signs in
  const mergeWishlists = async (userId: string, localIds: string[]) => {
    try {
      const wishlistDocRef = doc(db, "wishlists", userId);
      const wishlistDoc = await getDoc(wishlistDocRef);

      let firestoreIds: string[] = [];
      if (wishlistDoc.exists()) {
        firestoreIds = wishlistDoc.data().productIds || [];
      }

      // Merge and deduplicate
      const mergedIds = Array.from(new Set([...firestoreIds, ...localIds]));

      // Update Firestore
      await setDoc(wishlistDocRef, {
        productIds: mergedIds,
        updatedAt: new Date(),
      });

      // Clear localStorage
      localStorage.removeItem(WISHLIST_STORAGE_KEY);

      // Update state
      setWishlistIds(mergedIds);
      await fetchWishlistProducts(mergedIds);
    } catch (error) {
      console.error("Error merging wishlists:", error);
    }
  };

  // Initialize wishlist based on auth state
  useEffect(() => {
    const initializeWishlist = async () => {
      setLoading(true);

      if (user) {
        // User is authenticated
        const localIds = loadFromLocalStorage();

        if (localIds.length > 0) {
          // Merge localStorage with Firestore
          await mergeWishlists(user.uid, localIds);
        } else {
          // Load from Firestore only
          await loadFromFirestore(user.uid);
        }
      } else {
        // User is not authenticated, use localStorage
        const localIds = loadFromLocalStorage();
        setWishlistIds(localIds);
        await fetchWishlistProducts(localIds);
      }

      setLoading(false);
    };

    initializeWishlist();
  }, [user]);

  // Add product to wishlist
  const addToWishlist = async (product: Product) => {
    const newIds = [...wishlistIds, product.id];
    setWishlistIds(newIds);
    setWishlistItems((prev) => [...prev, product]);

    if (user) {
      // Update Firestore
      try {
        const wishlistDocRef = doc(db, "wishlists", user.uid);
        await updateDoc(wishlistDocRef, {
          productIds: arrayUnion(product.id),
          updatedAt: new Date(),
        }).catch(async (error) => {
          // Document might not exist, create it
          if (error.code === "not-found") {
            await setDoc(wishlistDocRef, {
              productIds: [product.id],
              updatedAt: new Date(),
            });
          } else {
            throw error;
          }
        });
      } catch (error) {
        console.error("Error adding to wishlist in Firestore:", error);
        // Revert optimistic update
        setWishlistIds(wishlistIds);
        setWishlistItems((prev) =>
          prev.filter((item) => item.id !== product.id)
        );
        throw error;
      }
    } else {
      // Update localStorage
      saveToLocalStorage(newIds);
    }
  };

  // Remove product from wishlist
  const removeFromWishlist = async (productId: string) => {
    const newIds = wishlistIds.filter((id) => id !== productId);
    setWishlistIds(newIds);
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));

    if (user) {
      // Update Firestore
      try {
        const wishlistDocRef = doc(db, "wishlists", user.uid);
        await updateDoc(wishlistDocRef, {
          productIds: arrayRemove(productId),
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Error removing from wishlist in Firestore:", error);
        // Revert optimistic update
        setWishlistIds(wishlistIds);
        const removedProduct = wishlistItems.find(
          (item) => item.id === productId
        );
        if (removedProduct) {
          setWishlistItems((prev) => [...prev, removedProduct]);
        }
        throw error;
      }
    } else {
      // Update localStorage
      saveToLocalStorage(newIds);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  // Clear wishlist
  const clearWishlist = () => {
    setWishlistIds([]);
    setWishlistItems([]);

    if (user) {
      // Clear Firestore
      const wishlistDocRef = doc(db, "wishlists", user.uid);
      setDoc(wishlistDocRef, {
        productIds: [],
        updatedAt: new Date(),
      }).catch((error) => {
        console.error("Error clearing wishlist in Firestore:", error);
      });
    } else {
      // Clear localStorage
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    }
  };

  const value: WishlistContextType = {
    wishlistItems,
    wishlistIds,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
