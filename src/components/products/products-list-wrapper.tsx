"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/products/product-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package2, AlertTriangle } from "lucide-react";
import { type Product } from "@/lib/types/project";

interface ProductsListWrapperProps {
  initialProducts: Product[];
}

export function ProductsListWrapper({ initialProducts }: ProductsListWrapperProps) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}