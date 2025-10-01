'use client';

import { Product } from '@/lib/types/project';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/utils/product-helpers';
import { cn } from '@/lib/utils';

interface ProductSelectionCardProps {
  product: Product;
  currentQuantity: number;
  onQuantityChange: (productId: string, quantity: number) => void;
}

export function ProductSelectionCard({
  product,
  currentQuantity,
  onQuantityChange,
}: ProductSelectionCardProps) {
  const incrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuantityChange(product.id, currentQuantity + 1);
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentQuantity > 0) {
      onQuantityChange(product.id, currentQuantity - 1);
    }
  };

  const isSelected = currentQuantity > 0;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-500 pt-0',
        'rounded-xl border border-border/60',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
        'hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.06)]',
        'hover:border-primary/40 hover:-translate-y-1.5 hover:scale-[1.02]',
        isSelected && 'border-primary border-2 shadow-[0_8px_24px_rgba(0,0,0,0.1)] bg-primary/5 scale-[1.01]'
      )}
    >
      {/* Selected indicator with quantity */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 min-w-7 h-7 px-2 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <span className="text-sm font-bold text-white">{currentQuantity}</span>
        </div>
      )}

      {/* Product Image - Responsive height */}
      <div className="relative h-32 sm:h-40 md:h-[160px] w-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            product.image && 'hidden'
          )}
        >
          <Package className="h-14 w-14 text-muted-foreground/40" />
        </div>
        {/* Gradient overlay on hover for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Product Info - Improved spacing and typography */}
      <CardContent className="px-5 pb-5 pt-4 space-y-3">
        <div className="space-y-2">
          <h3
            className={cn(
              'font-semibold text-base line-clamp-2 leading-tight transition-colors duration-300',
              isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
            )}
          >
            {product.nom}
          </h3>
          <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {product.reference}
          </Badge>
        </div>

        {/* Price indication */}
        {product.prixVente1An && (
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground">À partir de</span>
            <span className="font-bold text-base text-primary">
              {formatPrice(product.prixVente1An)}
            </span>
          </div>
        )}

        {/* Quantity controls - always visible */}
        <div className="flex items-center justify-between border border-border rounded-lg px-2 py-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 w-7 p-0 transition-opacity",
              currentQuantity === 0 && "opacity-30"
            )}
            onClick={decrementQuantity}
            disabled={currentQuantity === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium min-w-6 text-center">{currentQuantity}</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={incrementQuantity}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
