import { useState, useEffect } from "react";
import { useProducts } from "./use-products";
import { Product } from "@/types";

interface SheetProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  source: string;
  sellerId: string;
  createdAt: string;
}

/**
 * Custom hook to fetch products from both Firebase and Google Sheets
 */
export function useAllProducts() {
  const { products: firebaseProducts, loading: firebaseLoading } = useProducts({});
  const [sheetProducts, setSheetProducts] = useState<SheetProduct[]>([]);
  const [sheetLoading, setSheetLoading] = useState(true);

  // Fetch Google Sheets products
  useEffect(() => {
    async function fetchSheetProducts() {
      try {
        const response = await fetch('/api/products/sheets');
        const data = await response.json();
        setSheetProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching sheet products:', error);
        setSheetProducts([]);
      } finally {
        setSheetLoading(false);
      }
    }

    fetchSheetProducts();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchSheetProducts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Combine both sources
  const allProducts = [
    ...firebaseProducts,
    ...sheetProducts as any[], // Cast to Product type
  ];

  const loading = firebaseLoading || sheetLoading;

  return {
    products: allProducts,
    loading,
    firebaseCount: firebaseProducts.length,
    sheetCount: sheetProducts.length,
  };
}
