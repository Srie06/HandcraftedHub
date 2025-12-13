import { useState, useEffect } from "react";
import { Product, ProductFilters } from "@/types";
import { subscribeToQuery, where, orderBy } from "@/lib/firebase/firestore";
import { QueryConstraint } from "firebase/firestore";

/**
 * Custom hook for fetching products with real-time updates
 * Supports filtering by category, search query, and sellerId
 * 
 * @param filters - Optional filters to apply to the products query
 * @returns Object containing products array and loading state
 */
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Build query constraints based on filters
    const constraints: QueryConstraint[] = [];

    // Add sellerId filter if provided
    if (filters?.sellerId) {
      constraints.push(where("sellerId", "==", filters.sellerId));
    }

    // Add category filter if provided
    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }

    // Add ordering by creation date (newest first)
    constraints.push(orderBy("createdAt", "desc"));

    // Subscribe to real-time updates
    const unsubscribe = subscribeToQuery(
      "products",
      (documents) => {
        // Convert documents to Product type
        let filteredProducts = documents as Product[];

        // Apply client-side search filter if provided
        // (Firestore doesn't support full-text search, so we filter on the client)
        if (filters?.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.title.toLowerCase().includes(query) ||
              product.description.toLowerCase().includes(query)
          );
        }

        setProducts(filteredProducts);
        setLoading(false);
      },
      ...constraints
    );

    // Cleanup listener on unmount or when filters change
    return () => {
      unsubscribe();
    };
  }, [filters?.category, filters?.searchQuery, filters?.sellerId]);

  return { products, loading };
}
