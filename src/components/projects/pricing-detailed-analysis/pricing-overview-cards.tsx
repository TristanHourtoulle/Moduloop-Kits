'use client'

import { motion } from 'framer-motion'
import { Euro, Calculator, TrendingUp } from 'lucide-react'
import { LocationPriceDisplay } from '../location-price-display'
import { formatPrice as formatPriceHelper } from '@/lib/utils/product-helpers'
import type { PurchaseRentalMode } from '@/lib/schemas/product'
import type { ProjectCostBreakdown } from '@/lib/utils/project/calculations'

interface PricingOverviewCardsProps {
  currentData: ProjectCostBreakdown
  selectedMode: PurchaseRentalMode
  canViewCosts: boolean
}

/**
 * Overview cards showing total price, cost, and margin for the selected pricing mode.
 * Cost and margin cards are only visible to admin/dev users.
 * @param props - Current cost breakdown, selected mode, and cost visibility flag
 * @returns Grid of overview metric cards
 */
export function PricingOverviewCards({
  currentData,
  selectedMode,
  canViewCosts,
}: PricingOverviewCardsProps) {
  return (
    <>
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        className="hover:shadow-elegant group relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 text-center shadow-sm transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.02] to-emerald-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-sm transition-transform duration-300 group-hover:scale-110">
            <Euro className="h-8 w-8 text-green-600" />
          </div>
          {selectedMode === 'location' ? (
            <LocationPriceDisplay
              annualPrice={currentData.totalPrice}
              label={`Prix total location`}
              variant="card"
              priceClassName="text-green-900 text-4xl"
              secondaryClassName="text-green-600"
              labelClassName="text-green-700 text-base font-semibold"
              badgeClassName="border-green-500 text-green-600 bg-green-50"
              secondaryBadgeClassName="border-green-300 text-green-500 bg-green-50"
            />
          ) : (
            <>
              <div className="mb-2 text-4xl font-bold text-green-900">
                {formatPriceHelper(currentData.totalPrice)}
              </div>
              <div className="text-base font-semibold text-green-700">Prix total (Achat)</div>
            </>
          )}
        </div>
      </motion.div>

      {canViewCosts && (
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="hover:shadow-elegant group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center shadow-sm transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-indigo-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
            {selectedMode === 'location' ? (
              <LocationPriceDisplay
                annualPrice={currentData.totalCost}
                label="Coût total"
                variant="card"
                priceClassName="text-blue-900 text-4xl"
                secondaryClassName="text-blue-600"
                labelClassName="text-blue-700 text-base font-semibold"
                badgeClassName="border-blue-500 text-blue-600 bg-blue-50"
                secondaryBadgeClassName="border-blue-300 text-blue-500 bg-blue-50"
              />
            ) : (
              <>
                <div className="mb-2 text-4xl font-bold text-blue-900">
                  {formatPriceHelper(currentData.totalCost)}
                </div>
                <div className="text-base font-semibold text-blue-700">Coût total</div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {canViewCosts && (
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="hover:shadow-elegant group relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 p-8 text-center shadow-sm transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-violet-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            {selectedMode === 'location' ? (
              <LocationPriceDisplay
                annualPrice={currentData.totalMargin}
                label="Marge totale"
                variant="card"
                priceClassName="text-purple-900 text-4xl"
                secondaryClassName="text-purple-600"
                labelClassName="text-purple-700 text-base font-semibold"
                badgeClassName="border-purple-500 text-purple-600 bg-purple-50"
                secondaryBadgeClassName="border-purple-300 text-purple-500 bg-purple-50"
              />
            ) : (
              <>
                <div className="mb-2 text-4xl font-bold text-purple-900">
                  {formatPriceHelper(currentData.totalMargin)}
                </div>
                <div className="text-base font-semibold text-purple-700">Marge totale</div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </>
  )
}
