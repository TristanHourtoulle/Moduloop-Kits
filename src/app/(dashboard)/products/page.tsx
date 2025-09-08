'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleGuard } from '@/components/auth/role-guard';
import { UserRole } from '@/lib/types/user';
import { ProductsGrid } from '@/components/products/products-grid';
import { type Product } from '@/lib/types/project';
import { Plus, Search, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const productsPerPage = 12;

  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all products without pagination
      const response = await fetch('/api/products?all=true', {
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Vous devez être connecté pour voir les produits');
        } else if (response.status === 500) {
          throw new Error(
            'Erreur du serveur. Veuillez réessayer dans quelques instants.'
          );
        } else {
          throw new Error('Erreur lors du chargement des produits');
        }
      }

      const data: ProductsResponse = await response.json();
      const products = data.products || [];
      setAllProducts(products);
      setFilteredProducts(products);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue s'est produite"
      );
      setAllProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter products client-side based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(allProducts);
      setPage(1);
      return;
    }

    const searchTerm = search.toLowerCase();
    const filtered = allProducts.filter(product => 
      product.nom.toLowerCase().includes(searchTerm) ||
      product.reference.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
    
    setFilteredProducts(filtered);
    setPage(1);
  }, [search, allProducts]);

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleDelete = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression');
        }

        // Remove product from local state without refetch
        const updatedProducts = allProducts.filter(p => p.id !== productId);
        setAllProducts(updatedProducts);
        // Filtered products will update automatically via useEffect
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erreur lors de la suppression'
        );
      }
    },
    [allProducts]
  );

  // Client-side pagination helpers
  const getTotalPages = () => Math.ceil(filteredProducts.length / productsPerPage);
  
  const getCurrentPageProducts = () => {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className='container mx-auto p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-10 w-32' />
        </div>
        <Skeleton className='h-10 w-full max-w-md' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className='h-80'>
              <div className='p-6'>
                <Skeleton className='h-6 w-3/4 mb-2' />
                <Skeleton className='h-4 w-1/2 mb-4' />
                <Skeleton className='h-32 w-full mb-4' />
                <Skeleton className='h-4 w-full mb-2' />
                <Skeleton className='h-4 w-2/3' />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background w-full'>
      <div className='max-w-7xl mx-auto px-6 py-8 space-y-8'>
        {/* Header épuré */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20'>
              <Package className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-foreground'>
                Produits
              </h1>
              <p className='text-muted-foreground'>
                Gérez votre catalogue de produits
              </p>
            </div>
          </div>

          <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
            <Button asChild>
              <Link href='/products/nouveau'>
                <Plus className='h-4 w-4 mr-2' />
                Nouveau produit
              </Link>
            </Button>
          </RoleGuard>
        </div>

        {error && (
          <Alert className='border-red-200 bg-red-50'>
            <AlertTriangle className='h-4 w-4 text-red-600' />
            <AlertDescription className='text-red-800 flex items-center justify-between'>
              <span>{error}</span>
              <Button
                variant='outline'
                size='sm'
                onClick={fetchAllProducts}
                disabled={loading}
                className='ml-4 cursor-pointer border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white'
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Barre de recherche */}
        <div className='relative max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Rechercher un produit...'
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Liste des produits */}
        {getCurrentPageProducts().length === 0 ? (
          <Card className='p-12 text-center'>
            <div className='w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-2xl flex items-center justify-center'>
              <Package className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-semibold text-foreground mb-2'>
              Aucun produit trouvé
            </h3>
            <p className='text-muted-foreground mb-6'>
              {search
                ? 'Aucun produit ne correspond à votre recherche.'
                : 'Commencez par créer votre premier produit.'}
            </p>
            <RoleGuard requiredRole={UserRole.DEV} showAlert={false}>
              <Button asChild>
                <Link href='/products/nouveau'>
                  <Plus className='h-4 w-4 mr-2' />
                  Créer un produit
                </Link>
              </Button>
            </RoleGuard>
          </Card>
        ) : (
          <>
            <ProductsGrid products={getCurrentPageProducts()} onDelete={handleDelete} />

            {/* Pagination client-side */}
            {getTotalPages() > 1 && (
              <div className='flex justify-center items-center gap-2 mt-8'>
                <Button
                  variant='outline'
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                  className='cursor-pointer border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400'
                >
                  Précédent
                </Button>
                <span className='text-sm text-gray-600'>
                  Page {page} sur {getTotalPages()}
                </span>
                <Button
                  variant='outline'
                  onClick={() => setPage(page + 1)}
                  disabled={page >= getTotalPages()}
                  className='cursor-pointer border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:hover:text-gray-400'
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
