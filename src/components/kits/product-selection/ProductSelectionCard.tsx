'use client';

import { Product } from '@/lib/types/project';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils/product-helpers';
import { cn } from '@/lib/utils';

interface ProductSelectionCardProps {
  product: Product;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function ProductSelectionCard({
  product,
  isSelected,
  isDisabled,
  onClick,
}: ProductSelectionCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:border-primary/30 hover:-translate-y-1',
        isSelected && 'border-primary border-2 shadow-md bg-primary/5',
        isDisabled && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
      )}
      onClick={() => !isDisabled && onClick()}
    >
      {/* Selected Checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Product Image */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
          <Package className="h-12 w-12 text-muted-foreground/40" />
        </div>
      </div>

      {/* Product Info */}
      <CardContent className="p-4 space-y-2">
        <div className="space-y-1">
          <h3
            className={cn(
              'font-semibold text-sm line-clamp-1 transition-colors',
              isSelected ? 'text-primary' : 'text-foreground'
            )}
          >
            {product.nom}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {product.reference}
          </Badge>
        </div>

        {/* Price indication */}
        {product.prixVente1An && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>À partir de</span>
            <span className="font-semibold text-primary">
              {formatPrice(product.prixVente1An)}
            </span>
          </div>
        )}

        {/* Surface if available */}
        {product.surfaceM2 && (
          <div className="text-xs text-muted-foreground">
            {product.surfaceM2}m²
          </div>
        )}
      </CardContent>

      {/* Disabled overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
          <Badge variant="outline" className="bg-background/80">
            Déjà ajouté
          </Badge>
        </div>
      )}
    </Card>
  );
}
