"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package2, Search, X, Image, ImageOff } from "lucide-react";
import { type Product } from "@/lib/types/project";
import { useDebounce } from "@/hooks/use-debounce";

interface ProductsListWrapperProps {
  initialProducts: Product[];
}

type SortOption = "nom-asc" | "nom-desc" | "reference-asc" | "reference-desc" | "date-desc" | "date-asc";
type ImageFilter = "all" | "with-image" | "without-image";

function ProductsListContent({ initialProducts }: ProductsListWrapperProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("date-desc");
  const [imageFilter, setImageFilter] = useState<ImageFilter>("all");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update products when initialProducts prop changes (server-side data refresh)
  useEffect(() => {
    console.log("[ProductsListWrapper] Initial products updated:", initialProducts.length);
    setProducts(initialProducts);
  }, [initialProducts]);

  // Detect when returning from edit page with updated param
  useEffect(() => {
    const updatedParam = searchParams.get("updated");
    if (updatedParam) {
      console.log("[ProductsListWrapper] Detected update param, data already fresh from server");
      // Data is already fresh from server-side fetch, no need to refetch
    }
  }, [searchParams]);

  const handleDelete = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du produit");
        }

        // Remove product from local state without refetch
        const updatedProducts = products.filter((p) => p.id !== productId);
        setProducts(updatedProducts);
      } catch (err) {
        console.error("[ProductsListWrapper] Error deleting product:", err);
      }
    },
    [products],
  );

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter (nom and reference)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.nom.toLowerCase().includes(searchLower) ||
          product.reference?.toLowerCase().includes(searchLower)
      );
    }

    // Image filter
    if (imageFilter === "with-image") {
      result = result.filter((product) => product.image);
    } else if (imageFilter === "without-image") {
      result = result.filter((product) => !product.image);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "nom-asc":
          return a.nom.localeCompare(b.nom);
        case "nom-desc":
          return b.nom.localeCompare(a.nom);
        case "reference-asc":
          return (a.reference || "").localeCompare(b.reference || "");
        case "reference-desc":
          return (b.reference || "").localeCompare(a.reference || "");
        case "date-asc":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "date-desc":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [products, debouncedSearchTerm, sortOption, imageFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setSortOption("date-desc");
    setImageFilter("all");
  };

  const hasActiveFilters = searchTerm || sortOption !== "date-desc" || imageFilter !== "all";

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-2xl flex items-center justify-center">
          <Package2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucun produit trouvé
        </h3>
        <p className="text-muted-foreground">
          Commencez par créer votre premier produit
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Select */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[160px]"
            >
              <option value="date-desc">Plus récents</option>
              <option value="date-asc">Plus anciens</option>
              <option value="nom-asc">Nom (A-Z)</option>
              <option value="nom-desc">Nom (Z-A)</option>
              <option value="reference-asc">Référence (A-Z)</option>
              <option value="reference-desc">Référence (Z-A)</option>
            </select>

            {/* Image Filter */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <Button
                variant={imageFilter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setImageFilter("all")}
                className={`text-xs px-3 ${
                  imageFilter === "all"
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "hover:bg-white/60"
                }`}
              >
                Tous
              </Button>
              <Button
                variant={imageFilter === "with-image" ? "default" : "ghost"}
                size="sm"
                onClick={() => setImageFilter("with-image")}
                className={`text-xs px-3 ${
                  imageFilter === "with-image"
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "hover:bg-white/60"
                }`}
              >
                <Image className="w-3 h-3 mr-1" />
                Avec image
              </Button>
              <Button
                variant={imageFilter === "without-image" ? "default" : "ghost"}
                size="sm"
                onClick={() => setImageFilter("without-image")}
                className={`text-xs px-3 ${
                  imageFilter === "without-image"
                    ? "bg-primary hover:bg-primary/90 text-white"
                    : "hover:bg-white/60"
                }`}
              >
                <ImageOff className="w-3 h-3 mr-1" />
                Sans image
              </Button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <span>
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""}
            {debouncedSearchTerm && ` pour "${debouncedSearchTerm}"`}
          </span>
          {filteredProducts.length !== products.length && (
            <span className="text-gray-400">
              sur {products.length} au total
            </span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-2xl flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-muted-foreground mb-4">
            Aucun produit ne correspond à vos critères de recherche
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Wrapper component with Suspense boundary
export function ProductsListWrapper(props: ProductsListWrapperProps) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Loading skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[300px] bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    }>
      <ProductsListContent {...props} />
    </Suspense>
  );
}