"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  craftTypes: string[];
  occasions: string[];
  regions: string[];
  selectedCategory: string;
  selectedCraftType: string;
  selectedOccasion: string;
  selectedRegion: string;
  sortBy: string;
  onCategoryChange: (value: string) => void;
  onCraftTypeChange: (value: string) => void;
  onOccasionChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  isOpen,
  onClose,
  categories,
  craftTypes,
  occasions,
  regions,
  selectedCategory,
  selectedCraftType,
  selectedOccasion,
  selectedRegion,
  sortBy,
  onCategoryChange,
  onCraftTypeChange,
  onOccasionChange,
  onRegionChange,
  onSortChange,
  onClearFilters,
}: FilterSidebarProps) {
  const hasActiveFilters =
    selectedCategory || selectedCraftType || selectedOccasion || selectedRegion;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto
          w-80 lg:w-64 bg-white/95 backdrop-blur-sm
          border-r border-stone-200 shadow-lg lg:shadow-none
          z-50 lg:z-0 transition-transform duration-300
          overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-900">
              Category
            </label>
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Craft Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-900">
              Craft Type
            </label>
            <Select value={selectedCraftType} onValueChange={onCraftTypeChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="All Craft Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Craft Types</SelectItem>
                {craftTypes.map((craft) => (
                  <SelectItem key={craft} value={craft}>
                    {craft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Occasion Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-900">
              Occasion
            </label>
            <Select value={selectedOccasion} onValueChange={onOccasionChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="All Occasions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Occasions</SelectItem>
                {occasions.map((occasion) => (
                  <SelectItem key={occasion} value={occasion}>
                    {occasion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region Filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-900">
              Region
            </label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-amber-900">
              Sort By
            </label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-semibold text-amber-900">
                Active Filters:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary" className="rounded-full">
                    {selectedCategory}
                  </Badge>
                )}
                {selectedCraftType && (
                  <Badge variant="secondary" className="rounded-full">
                    {selectedCraftType}
                  </Badge>
                )}
                {selectedOccasion && (
                  <Badge variant="secondary" className="rounded-full">
                    {selectedOccasion}
                  </Badge>
                )}
                {selectedRegion && (
                  <Badge variant="secondary" className="rounded-full">
                    {selectedRegion}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
