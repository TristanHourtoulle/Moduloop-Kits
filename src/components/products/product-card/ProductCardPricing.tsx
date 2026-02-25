'use client'

import { Euro, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Product } from '@/lib/types/project'
import { type PurchaseRentalMode } from '@/lib/schemas/product'
import { getProductPricing, formatPrice } from '@/lib/utils/product-helpers'

interface ProductCardPricingProps {
  product: Product
  selectedMode: PurchaseRentalMode
  onModeChange: (mode: PurchaseRentalMode) => void
  className?: string
}

export function ProductCardPricing({ product, className }: ProductCardPricingProps) {
  // Prix d'achat principal (mode achat, 1 an)
  const purchasePrice = getProductPricing(product, 'achat', '1an')

  // Prix de location pour 1, 2 et 3 ans
  const rental1Year = getProductPricing(product, 'location', '1an')
  const rental2Years = getProductPricing(product, 'location', '2ans')
  const rental3Years = getProductPricing(product, 'location', '3ans')

  return (
    <div className={cn('space-y-4', className)}>
      {/* Prix d'achat principal */}
      <div className="bg-primary/5 border-primary/10 rounded-lg border p-4">
        <div className="mb-2 flex items-center gap-2">
          <ShoppingCart className="text-primary h-4 w-4" />
          <span className="text-primary text-sm font-medium">Prix d&apos;achat</span>
        </div>
        <div className="flex items-center gap-2">
          <Euro className="text-primary h-5 w-5" />
          {purchasePrice.prixVente && purchasePrice.prixVente > 0 ? (
            <span className="text-primary text-2xl font-bold">
              {formatPrice(purchasePrice.prixVente)}
            </span>
          ) : (
            <span className="text-sm text-orange-600 italic">Non renseigné</span>
          )}
        </div>
      </div>

      {/* Prix de location */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-foreground text-sm font-medium">Prix de location</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* 1 an */}
          <div className="rounded-lg border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3">
            <div className="mb-1 text-xs font-medium text-emerald-700">1 an</div>
            <div className="text-sm font-semibold text-emerald-800">
              {rental1Year.prixVente && rental1Year.prixVente > 0 ? (
                formatPrice(rental1Year.prixVente)
              ) : (
                <span className="text-xs text-orange-600 italic">Non rens.</span>
              )}
            </div>
          </div>

          {/* 2 ans */}
          <div className="rounded-lg border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3">
            <div className="mb-1 text-xs font-medium text-emerald-700">2 ans</div>
            <div className="text-sm font-semibold text-emerald-800">
              {rental2Years.prixVente && rental2Years.prixVente > 0 ? (
                formatPrice(rental2Years.prixVente)
              ) : (
                <span className="text-xs text-orange-600 italic">Non rens.</span>
              )}
            </div>
          </div>

          {/* 3 ans */}
          <div className="rounded-lg border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3">
            <div className="mb-1 text-xs font-medium text-emerald-700">3 ans</div>
            <div className="text-sm font-semibold text-emerald-800">
              {rental3Years.prixVente && rental3Years.prixVente > 0 ? (
                formatPrice(rental3Years.prixVente)
              ) : (
                <span className="text-xs text-orange-600 italic">Non rens.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
