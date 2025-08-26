"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProductsGrid } from "@/components/products/products-grid";
import { useDebounce } from "@/hooks/use-debounce";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  nom: string;
  reference: string;
  description?: string;
  prixVente1An: number;
  quantite: number;
  surfaceM2: number;
  rechauffementClimatique: number;
  image?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<
    ProductsResponse["pagination"] | null
  >(null);

  // Debounce de la recherche pour éviter trop d'appels API
  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(debouncedSearch && { search: debouncedSearch }),
      });

      const response = await fetch(`/api/products?${params}`, {
        cache: "no-store", // Force pas de cache pour éviter les problèmes de refresh
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Vous devez être connecté pour voir les produits");
        } else if (response.status === 500) {
          throw new Error(
            "Erreur du serveur. Veuillez réessayer dans quelques instants."
          );
        } else {
          throw new Error("Erreur lors du chargement des produits");
        }
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Erreur lors du chargement des produits:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue s'est produite"
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1); // Reset à la page 1 lors d'une nouvelle recherche
  }, []);

  const handleDelete = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression");
        }

        // Recharger les produits après suppression
        await fetchProducts();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors de la suppression"
        );
      }
    },
    [fetchProducts]
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-80">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-[#30C1BD]" />
            Gestion des produits
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez votre catalogue de produits Moduloop
          </p>
        </div>

        <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
          <Link
            href="/products/nouveau"
            className="cursor-pointer bg-[#30C1BD] hover:bg-[#30C1BD]/80 text-white flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un produit
          </Link>
        </RoleGuard>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={loading}
              className="ml-4 cursor-pointer border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white"
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Barre de recherche */}
      <form onSubmit={(e) => e.preventDefault()} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="pl-10 focus:border-[#30C1BD] focus:ring-[#30C1BD]"
        />
      </form>

      {/* Liste des produits */}
      {products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            {search
              ? "Aucun produit ne correspond à votre recherche."
              : "Commencez par créer votre premier produit."}
          </p>
          <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
            <Link
              href="/dashboard/products/nouveau"
              className="cursor-pointer bg-[#30C1BD] hover:bg-[#30C1BD]/80 text-white flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un produit
            </Link>
          </RoleGuard>
        </Card>
      ) : (
        <>
          <ProductsGrid products={products} onDelete={handleDelete} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!pagination.hasPrev}
                className="cursor-pointer border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!pagination.hasNext}
                className="cursor-pointer border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400"
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
