"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useAllProducts } from "@/hooks/use-all-products";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeleton-loader";
import { FilterSidebar } from "@/components/filter-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

// Cultural search dimensions
const CRAFT_TYPES = [
  "Madhubani Painting",
  "Terracotta Pottery",
  "Bidriware",
  "Warli Art",
  "Phulkari Embroidery",
  "Blue Pottery",
  "Dhokra Metal Craft",
];

const OCCASIONS = [
  "Wedding Gifts",
  "Festive Decor",
  "Housewarming",
  "Birthday Gifts",
  "Anniversary",
  "Diwali Special",
  "Home Decor",
];

const REGIONS = [
  "Rajasthani",
  "Kashmiri",
  "Tamil Traditional",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Kerala Traditional",
];

const CATEGORIES = [
  "Pottery",
  "Textiles",
  "Jewelry",
  "Home Decor",
  "Art",
  "Accessories",
];

export default function HomePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCraftType, setSelectedCraftType] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Fetch products from both Firebase and Google Sheets
  const { products, loading, firebaseCount, sheetCount } = useAllProducts();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-cultural flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-terracotta font-display">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter((product) => {
    // Search query filter
    if (
      searchQuery &&
      !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Category filter
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }

    // Note: For craft type, occasion, and region filters to work,
    // you'll need to add these fields to your Product type and Firestore documents
    // For now, they're placeholders

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "newest":
        // Handle both Firebase Timestamp and string dates
        const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return bTime - aTime;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCraftType("");
    setSelectedOccasion("");
    setSelectedRegion("");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedCraftType ||
    selectedOccasion ||
    selectedRegion;

  return (
    <main className="min-h-screen bg-gradient-cultural">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Search */}
        <div className="mb-6">
          <h1 className="text-4xl font-display font-bold mb-4 text-terracotta">
            Discover Handcrafted Treasures
          </h1>

          {/* Search Bar */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden rounded-xl"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products, crafts, or artisans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 rounded-xl text-lg"
              />
            </div>
          </div>
        </div>

        {/* Sidebar + Products Layout */}
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            categories={CATEGORIES}
            craftTypes={CRAFT_TYPES}
            occasions={OCCASIONS}
            regions={REGIONS}
            selectedCategory={selectedCategory}
            selectedCraftType={selectedCraftType}
            selectedOccasion={selectedOccasion}
            selectedRegion={selectedRegion}
            sortBy={sortBy}
            onCategoryChange={setSelectedCategory}
            onCraftTypeChange={setSelectedCraftType}
            onOccasionChange={setSelectedOccasion}
            onRegionChange={setSelectedRegion}
            onSortChange={setSortBy}
            onClearFilters={clearFilters}
          />

          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading products..."
                  : `${sortedProducts.length} ${
                      sortedProducts.length === 1 ? "product" : "products"
                    } found`}
              </p>
            </div>

            {/* Products Grid */}
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
