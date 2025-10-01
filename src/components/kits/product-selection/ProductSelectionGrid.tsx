'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/lib/types/project';
import { ProductSelectionCard } from './ProductSelectionCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package } from 'lucide-react';

interface ProductSelectionGridProps {
  products: Product[];
  productQuantities: Record<string, number>;
  onQuantityChange: (productId: string, quantity: number) => void;
}

export function ProductSelectionGrid({
  products,
  productQuantities,
  onQuantityChange,
}: ProductSelectionGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.nom.toLowerCase().includes(query) ||
        product.reference.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const availableCount = filteredProducts.length;
  const selectedCount = Object.values(productQuantities).filter(q => q > 0).length;

  return (
    <div className="space-y-4">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            Sélectionner des produits
          </h3>
          <Badge variant="secondary">
            {availableCount} disponible{availableCount > 1 ? 's' : ''}
          </Badge>
          {selectedCount > 0 && (
            <Badge variant="default" className="bg-primary">
              {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductSelectionCard
              key={product.id}
              product={product}
              currentQuantity={productQuantities[product.id] || 0}
              onQuantityChange={onQuantityChange}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {searchQuery
              ? `Aucun produit ne correspond à "${searchQuery}"`
              : 'Aucun produit disponible pour le moment'}
          </p>
        </div>
      )}
    </div>
  );
}
