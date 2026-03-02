'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { LocationPriceDisplay } from '../location-price-display'
import { formatPrice as formatPriceHelper } from '@/lib/utils/product-helpers'
import type { PurchaseRentalMode, ProductPeriod } from '@/lib/schemas/product'
import type { KitBreakdownItem } from '@/lib/utils/project/calculations'

const PERIOD_LABELS: Record<ProductPeriod, string> = {
  '1an': '1 an',
  '2ans': '2 ans',
  '3ans': '3 ans',
}

interface KitBreakdownTableProps {
  kitBreakdown: readonly KitBreakdownItem[]
  selectedMode: PurchaseRentalMode
  selectedPeriod: ProductPeriod
  canViewCosts: boolean
}

/**
 * Detailed per-kit pricing breakdown showing price, cost, and margin for each kit.
 * Cost and margin columns are only visible to admin/dev users.
 * @param props - Kit breakdown data, selected mode/period, and cost visibility flag
 * @returns Card with kit-by-kit pricing details
 */
export function KitBreakdownTable({
  kitBreakdown,
  selectedMode,
  selectedPeriod,
  canViewCosts,
}: KitBreakdownTableProps) {
  return (
    <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-2">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <span>Détail des prix par kit</span>
          </div>
          <Badge variant="outline" className="bg-white text-xs">
            {selectedMode === 'achat' ? 'Mode Achat' : `Location ${PERIOD_LABELS[selectedPeriod]}`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {kitBreakdown.length > 0 ? (
          <div className="space-y-4">
            {kitBreakdown.map((kit, index) => (
              <motion.div
                key={`${kit.kitName}-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
                className="rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-md"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{kit.kitName}</h4>
                      <p className="text-sm text-gray-500">Quantité: {kit.quantity}</p>
                    </div>
                  </div>
                  {canViewCosts && (
                    <Badge
                      variant="outline"
                      className={`text-sm font-medium ${
                        kit.marginPercentage > 30
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : kit.marginPercentage > 20
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                      }`}
                    >
                      {kit.marginPercentage.toFixed(1)}% marge
                    </Badge>
                  )}
                </div>

                <div className={`grid gap-4 ${canViewCosts ? 'grid-cols-3' : 'grid-cols-1'}`}>
                  <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center">
                    {selectedMode === 'location' ? (
                      <LocationPriceDisplay
                        annualPrice={kit.totalPrice}
                        label="Prix total"
                        variant="card"
                        priceClassName="text-green-900 text-lg"
                        secondaryClassName="text-green-600 text-xs"
                        labelClassName="text-green-700 text-xs"
                        badgeClassName="border-green-500 text-green-600 bg-green-50 text-[10px] px-1 py-0"
                        secondaryBadgeClassName="border-green-300 text-green-500 bg-green-50"
                      />
                    ) : (
                      <>
                        <div className="mb-1 text-lg font-bold text-green-900">
                          {formatPriceHelper(kit.totalPrice)}
                        </div>
                        <div className="text-xs font-medium text-green-700">Prix total</div>
                      </>
                    )}
                  </div>
                  {canViewCosts && (
                    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-center">
                      {selectedMode === 'location' ? (
                        <LocationPriceDisplay
                          annualPrice={kit.totalCost}
                          label="Coût total"
                          variant="card"
                          priceClassName="text-blue-900 text-lg"
                          secondaryClassName="text-blue-600 text-xs"
                          labelClassName="text-blue-700 text-xs"
                          badgeClassName="border-blue-500 text-blue-600 bg-blue-50 text-[10px] px-1 py-0"
                          secondaryBadgeClassName="border-blue-300 text-blue-500 bg-blue-50"
                        />
                      ) : (
                        <>
                          <div className="mb-1 text-lg font-bold text-blue-900">
                            {formatPriceHelper(kit.totalCost)}
                          </div>
                          <div className="text-xs font-medium text-blue-700">Coût total</div>
                        </>
                      )}
                    </div>
                  )}
                  {canViewCosts && (
                    <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 p-4 text-center">
                      {selectedMode === 'location' ? (
                        <LocationPriceDisplay
                          annualPrice={kit.totalMargin}
                          label="Marge"
                          variant="card"
                          priceClassName="text-purple-900 text-lg"
                          secondaryClassName="text-purple-600 text-xs"
                          labelClassName="text-purple-700 text-xs"
                          badgeClassName="border-purple-500 text-purple-600 bg-purple-50 text-[10px] px-1 py-0"
                          secondaryBadgeClassName="border-purple-300 text-purple-500 bg-purple-50"
                        />
                      ) : (
                        <>
                          <div className="mb-1 text-lg font-bold text-purple-900">
                            {formatPriceHelper(kit.totalMargin)}
                          </div>
                          <div className="text-xs font-medium text-purple-700">Marge</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <Package className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p>Aucun kit configuré pour ce projet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
