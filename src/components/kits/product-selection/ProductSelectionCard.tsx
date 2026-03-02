'use client'

import { Product } from '@/lib/types/project'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Plus, Minus } from 'lucide-react'
import { formatPrice } from '@/lib/utils/product-helpers'
import { cn } from '@/lib/utils'

interface ProductSelectionCardProps {
  product: Product
  currentQuantity: number
  onQuantityChange: (productId: string, quantity: number) => void
}

export function ProductSelectionCard({
  product,
  currentQuantity,
  onQuantityChange,
}: ProductSelectionCardProps) {
  const incrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation()
    onQuantityChange(product.id, currentQuantity + 1)
  }

  const decrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentQuantity > 0) {
      onQuantityChange(product.id, currentQuantity - 1)
    }
  }

  const isSelected = currentQuantity > 0

  return (
    <Card
      className={cn(
        'group relative overflow-hidden pt-0 transition-all duration-500',
        'border-border/60 rounded-xl border',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
        'hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.06)]',
        'hover:border-primary/40 hover:-translate-y-1.5 hover:scale-[1.02]',
        isSelected &&
          'border-primary bg-primary/5 scale-[1.01] border-2 shadow-[0_8px_24px_rgba(0,0,0,0.1)]',
      )}
    >
      {/* Selected indicator with quantity */}
      {isSelected && (
        <div className="bg-primary absolute top-3 right-3 z-10 flex h-7 min-w-7 items-center justify-center rounded-full px-2 shadow-lg">
          <span className="text-sm font-bold text-white">{currentQuantity}</span>
        </div>
      )}

      {/* Product Image - Responsive height */}
      <div className="from-muted/30 to-muted/50 relative h-32 w-full overflow-hidden bg-gradient-to-br sm:h-40 md:h-[160px]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.nom}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            product.image && 'hidden',
          )}
        >
          <Package className="text-muted-foreground/40 h-14 w-14" />
        </div>
        {/* Gradient overlay on hover for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Product Info - Improved spacing and typography */}
      <CardContent className="space-y-3 px-5 pt-4 pb-5">
        <div className="space-y-2">
          <h3
            className={cn(
              'line-clamp-2 text-base leading-tight font-semibold transition-colors duration-300',
              isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary',
            )}
          >
            {product.nom}
          </h3>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 border text-xs font-medium"
          >
            {product.reference}
          </Badge>
        </div>

        {/* Price indication */}
        {product.prixVente1An && (
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-muted-foreground text-xs">À partir de</span>
            <span className="text-primary text-base font-bold">
              {formatPrice(product.prixVente1An)}
            </span>
          </div>
        )}

        {/* Quantity controls - always visible */}
        <div className="border-border flex items-center justify-between rounded-lg border px-2 py-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={cn('h-7 w-7 p-0 transition-opacity', currentQuantity === 0 && 'opacity-30')}
            onClick={decrementQuantity}
            disabled={currentQuantity === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="min-w-6 text-center text-sm font-medium">{currentQuantity}</span>
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
  )
}
