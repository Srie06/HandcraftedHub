/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";
import { useProducts } from "../use-products";
import * as firestoreModule from "@/lib/firebase/firestore";

// Mock the firestore module
jest.mock("@/lib/firebase/firestore", () => ({
  subscribeToQuery: jest.fn(),
  where: jest.fn((field, op, value) => ({ field, op, value })),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
}));

describe("useProducts - Real-time Synchronization", () => {
  let mockUnsubscribe: jest.Mock;
  let mockCallback: (documents: any[]) => void;

  beforeEach(() => {
    mockUnsubscribe = jest.fn();
    mockCallback = jest.fn();

    // Mock subscribeToQuery to capture the callback
    (firestoreModule.subscribeToQuery as jest.Mock).mockImplementation(
      (collectionName, callback, ...constraints) => {
        mockCallback = callback;
        return mockUnsubscribe;
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should set up real-time listener on mount", () => {
    renderHook(() => useProducts());

    expect(firestoreModule.subscribeToQuery).toHaveBeenCalledWith(
      "products",
      expect.any(Function),
      expect.objectContaining({ field: "createdAt" })
    );
  });

  it("should update products when Firestore data changes", async () => {
    const { result } = renderHook(() => useProducts());

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);

    // Simulate Firestore callback with initial data
    const initialProducts = [
      {
        id: "1",
        title: "Product 1",
        price: 10,
        sellerId: "seller1",
        category: "Art",
        description: "Test product 1",
        stock: 5,
        images: [],
        createdAt: { seconds: 1000, nanoseconds: 0 },
      },
    ];

    mockCallback(initialProducts);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].title).toBe("Product 1");
    });

    // Simulate real-time update - new product added
    const updatedProducts = [
      ...initialProducts,
      {
        id: "2",
        title: "Product 2",
        price: 20,
        sellerId: "seller1",
        category: "Jewelry",
        description: "Test product 2",
        stock: 3,
        images: [],
        createdAt: { seconds: 2000, nanoseconds: 0 },
      },
    ];

    mockCallback(updatedProducts);

    await waitFor(() => {
      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[1].title).toBe("Product 2");
    });
  });

  it("should update products when a product is deleted", async () => {
    const { result } = renderHook(() => useProducts());

    // Initial data with two products
    const initialProducts = [
      {
        id: "1",
        title: "Product 1",
        price: 10,
        sellerId: "seller1",
        category: "Art",
        description: "Test product 1",
        stock: 5,
        images: [],
        createdAt: { seconds: 1000, nanoseconds: 0 },
      },
      {
        id: "2",
        title: "Product 2",
        price: 20,
        sellerId: "seller1",
        category: "Jewelry",
        description: "Test product 2",
        stock: 3,
        images: [],
        createdAt: { seconds: 2000, nanoseconds: 0 },
      },
    ];

    mockCallback(initialProducts);

    await waitFor(() => {
      expect(result.current.products).toHaveLength(2);
    });

    // Simulate real-time update - product deleted
    const updatedProducts = [initialProducts[0]];

    mockCallback(updatedProducts);

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].id).toBe("1");
    });
  });

  it("should update products when a product is modified", async () => {
    const { result } = renderHook(() => useProducts());

    // Initial data
    const initialProducts = [
      {
        id: "1",
        title: "Product 1",
        price: 10,
        sellerId: "seller1",
        category: "Art",
        description: "Test product 1",
        stock: 5,
        images: [],
        createdAt: { seconds: 1000, nanoseconds: 0 },
      },
    ];

    mockCallback(initialProducts);

    await waitFor(() => {
      expect(result.current.products[0].price).toBe(10);
      expect(result.current.products[0].stock).toBe(5);
    });

    // Simulate real-time update - product modified
    const updatedProducts = [
      {
        ...initialProducts[0],
        price: 15,
        stock: 3,
      },
    ];

    mockCallback(updatedProducts);

    await waitFor(() => {
      expect(result.current.products[0].price).toBe(15);
      expect(result.current.products[0].stock).toBe(3);
    });
  });

  it("should filter products by sellerId in real-time", async () => {
    const { result } = renderHook(() => useProducts({ sellerId: "seller1" }));

    expect(firestoreModule.subscribeToQuery).toHaveBeenCalledWith(
      "products",
      expect.any(Function),
      expect.objectContaining({ field: "sellerId", value: "seller1" }),
      expect.objectContaining({ field: "createdAt" })
    );

    // Simulate Firestore callback with filtered data
    const sellerProducts = [
      {
        id: "1",
        title: "Seller 1 Product",
        price: 10,
        sellerId: "seller1",
        category: "Art",
        description: "Test product",
        stock: 5,
        images: [],
        createdAt: { seconds: 1000, nanoseconds: 0 },
      },
    ];

    mockCallback(sellerProducts);

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].sellerId).toBe("seller1");
    });
  });

  it("should filter products by category in real-time", async () => {
    const { result } = renderHook(() => useProducts({ category: "Jewelry" }));

    expect(firestoreModule.subscribeToQuery).toHaveBeenCalledWith(
      "products",
      expect.any(Function),
      expect.objectContaining({ field: "category", value: "Jewelry" }),
      expect.objectContaining({ field: "createdAt" })
    );

    // Simulate Firestore callback with filtered data
    const categoryProducts = [
      {
        id: "1",
        title: "Jewelry Product",
        price: 10,
        sellerId: "seller1",
        category: "Jewelry",
        description: "Test jewelry",
        stock: 5,
        images: [],
        createdAt: { seconds: 1000, nanoseconds: 0 },
      },
    ];

    mockCallback(categoryProducts);

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1);
      expect(result.current.products[0].category).toBe("Jewelry");
    });
  });

  it("should apply search filter on client-side in real-time", async () => {
    const { result } = renderHook(() =>
      useProducts({ searchQuery: "handmade" })
    );

    // Simulate Firestore callback with all products
    const allProducts = [
      {
        id: "1",
        title: "Handmade Jewelry",
        price: 10,
        sellerId: "seller1",
        category: "Jewelry",
        description: "Beautiful piece",
        stock: 5,
        images: [],
        createdAt: { seconds: 1000, nanoseconds: 0 },
      },
      {
        id: "2",
        title: "Pottery Bowl",
        price: 20,
        sellerId: "seller1",
        category: "Pottery",
        description: "Handmade ceramic bowl",
        stock: 3,
        images: [],
        createdAt: { seconds: 2000, nanoseconds: 0 },
      },
      {
        id: "3",
        title: "Wooden Chair",
        price: 100,
        sellerId: "seller2",
        category: "Woodwork",
        description: "Sturdy chair",
        stock: 2,
        images: [],
        createdAt: { seconds: 3000, nanoseconds: 0 },
      },
    ];

    mockCallback(allProducts);

    await waitFor(() => {
      // Should only show products matching "handmade" in title or description
      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[0].title).toBe("Handmade Jewelry");
      expect(result.current.products[1].description).toContain("Handmade");
    });
  });

  it("should cleanup listener on unmount", () => {
    const { unmount } = renderHook(() => useProducts());

    expect(mockUnsubscribe).not.toHaveBeenCalled();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should recreate listener when filters change", () => {
    const { rerender } = renderHook(({ filters }) => useProducts(filters), {
      initialProps: { filters: { category: "Art" } },
    });

    expect(firestoreModule.subscribeToQuery).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    // Change filters
    rerender({ filters: { category: "Jewelry" } });

    // Should unsubscribe from old listener and create new one
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    expect(firestoreModule.subscribeToQuery).toHaveBeenCalledTimes(2);
  });
});
