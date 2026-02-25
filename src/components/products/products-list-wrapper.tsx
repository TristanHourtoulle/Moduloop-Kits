'use client'

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { ProductCard } from '@/components/products/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Package2, Search, X, Image, ImageOff } from 'lucide-react'
import { type Product } from '@/lib/types/project'
import { useDebounce } from '@/hooks/use-debounce'
import { logger } from '@/lib/logger'

interface ProductsListWrapperProps {
  initialProducts: Product[]
}

type SortOption =
  | 'nom-asc'
  | 'nom-desc'
  | 'reference-asc'
  | 'reference-desc'
  | 'date-desc'
  | 'date-asc'
type ImageFilter = 'all' | 'with-image' | 'without-image'

function ProductsListContent({ initialProducts }: ProductsListWrapperProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('date-desc')
  const [imageFilter, setImageFilter] = useState<ImageFilter>('all')

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const handleDelete = useCallback(
    async (productId: string) => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du produit')
        }

        // Remove product from local state without refetch
        const updatedProducts = products.filter((p) => p.id !== productId)
        setProducts(updatedProducts)
      } catch (err) {
        logger.error('[ProductsListWrapper] Error deleting product', { error: err })
      }
    },
    [products],
  )

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search filter (nom and reference)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      result = result.filter(
        (product) =>
          product.nom.toLowerCase().includes(searchLower) ||
          product.reference?.toLowerCase().includes(searchLower),
      )
    }

    // Image filter
    if (imageFilter === 'with-image') {
      result = result.filter((product) => product.image)
    } else if (imageFilter === 'without-image') {
      result = result.filter((product) => !product.image)
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'nom-asc':
          return a.nom.localeCompare(b.nom)
        case 'nom-desc':
          return b.nom.localeCompare(a.nom)
        case 'reference-asc':
          return (a.reference || '').localeCompare(b.reference || '')
        case 'reference-desc':
          return (b.reference || '').localeCompare(a.reference || '')
        case 'date-asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        case 'date-desc':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      }
    })

    return result
  }, [products, debouncedSearchTerm, sortOption, imageFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setSortOption('date-desc')
    setImageFilter('all')
  }

  const hasActiveFilters = searchTerm || sortOption !== 'date-desc' || imageFilter !== 'all'

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-muted/30 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Package2 className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">Aucun produit trouvé</h3>
        <p className="text-muted-foreground">Commencez par créer votre premier produit</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou référence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:border-primary focus:ring-primary border-gray-300 bg-white pl-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Select */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="focus:ring-primary min-w-[160px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="date-desc">Plus récents</option>
              <option value="date-asc">Plus anciens</option>
              <option value="nom-asc">Nom (A-Z)</option>
              <option value="nom-desc">Nom (Z-A)</option>
              <option value="reference-asc">Référence (A-Z)</option>
              <option value="reference-desc">Référence (Z-A)</option>
            </select>

            {/* Image Filter */}
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
              <Button
                variant={imageFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setImageFilter('all')}
                className={`px-3 text-xs ${
                  imageFilter === 'all'
                    ? 'bg-primary hover:bg-primary/90 text-white'
                    : 'hover:bg-white/60'
                }`}
              >
                Tous
              </Button>
              <Button
                variant={imageFilter === 'with-image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setImageFilter('with-image')}
                className={`px-3 text-xs ${
                  imageFilter === 'with-image'
                    ? 'bg-primary hover:bg-primary/90 text-white'
                    : 'hover:bg-white/60'
                }`}
              >
                <Image className="mr-1 h-3 w-3" />
                Avec image
              </Button>
              <Button
                variant={imageFilter === 'without-image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setImageFilter('without-image')}
                className={`px-3 text-xs ${
                  imageFilter === 'without-image'
                    ? 'bg-primary hover:bg-primary/90 text-white'
                    : 'hover:bg-white/60'
                }`}
              >
                <ImageOff className="mr-1 h-3 w-3" />
                Sans image
              </Button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                <X className="mr-1 h-3 w-3" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-600">
          <span>
            {filteredProducts.length} produit
            {filteredProducts.length > 1 ? 's' : ''} trouvé
            {filteredProducts.length > 1 ? 's' : ''}
            {debouncedSearchTerm && ` pour "${debouncedSearchTerm}"`}
          </span>
          {filteredProducts.length !== products.length && (
            <span className="text-gray-400">sur {products.length} au total</span>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-12 text-center">
          <div className="bg-muted/30 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Search className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">Aucun produit trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Aucun produit ne correspond à vos critères de recherche
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

// Wrapper component with Suspense boundary
export function ProductsListWrapper(props: ProductsListWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Loading skeletons */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-muted/30 h-[300px] animate-pulse rounded-lg" />
          ))}
        </div>
      }
    >
      <ProductsListContent {...props} />
    </Suspense>
  )
}
