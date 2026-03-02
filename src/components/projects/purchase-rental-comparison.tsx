'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Home, CheckCircle, XCircle, BarChart3 } from 'lucide-react'
import type { Project } from '@/lib/types/project'
import {
  formatPrice as formatPriceHelper,
  annualToMonthly,
  ceilPrice,
} from '@/lib/utils/product-helpers'
import {
  calculateProjectPurchaseCosts,
  calculateProjectRentalCosts,
  calculateBreakEvenPoint,
  calculateExtendedRentalCost,
  calculatePostThreeYearMonthly,
} from '@/lib/utils/project/calculations'
import {
  DEFAULT_MAX_HORIZON,
  ABSOLUTE_MAX_HORIZON,
  PURCHASE_ADVANTAGES,
  PURCHASE_DISADVANTAGES,
  RENTAL_ADVANTAGES,
  RENTAL_DISADVANTAGES,
} from './purchase-rental-comparison/constants'
import { TimeHorizonSelector } from './purchase-rental-comparison/time-horizon-selector'
import { RentalCostBreakdown } from './purchase-rental-comparison/rental-cost-breakdown'
import { BreakEvenAnalysisCard } from './purchase-rental-comparison/break-even-analysis-card'
import { RecommendationSection } from './purchase-rental-comparison/recommendation-section'
import { AdvantageList } from './purchase-rental-comparison/advantage-list'

interface PurchaseRentalComparisonProps {
  project: Project
}

/**
 * Side-by-side comparison of purchase vs rental options with tiered pricing model.
 * Integrates break-even analysis, dynamic time horizon, and two-tier monthly cost display
 * (full rate for first 3 years, 20% beyond).
 * @param props - Project data for cost calculations
 * @returns Interactive comparison view with time horizon selector and recommendation
 */
export function PurchaseRentalComparison({ project }: Readonly<PurchaseRentalComparisonProps>) {
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState(3)

  const purchaseData = calculateProjectPurchaseCosts(project)
  const rental3Years = calculateProjectRentalCosts(project, '3ans')

  const breakEvenResult = calculateBreakEvenPoint(project)
  const breakEvenYears = breakEvenResult?.breakEvenYears ?? null
  const breakEvenMonths = breakEvenResult?.breakEvenMonths ?? null
  const breakEvenPhase = breakEvenResult?.phase ?? null

  const monthly3ans = annualToMonthly(rental3Years.totalPrice)
  const postThreeYearMonthly = calculatePostThreeYearMonthly(monthly3ans)

  const dynamicMax = breakEvenYears
    ? Math.min(Math.max(Math.ceil(breakEvenYears) + 2, DEFAULT_MAX_HORIZON), ABSOLUTE_MAX_HORIZON)
    : DEFAULT_MAX_HORIZON
  const timeHorizons = useMemo(
    () => Array.from({ length: dynamicMax }, (_, i) => i + 1),
    [dynamicMax],
  )
  const isBreakEvenBeyondMax = breakEvenYears !== null && breakEvenYears > ABSOLUTE_MAX_HORIZON

  const projectedCosts = useMemo(() => {
    const purchaseCostTotal = purchaseData.totalPrice
    const rentalCostTotal = calculateExtendedRentalCost(monthly3ans, selectedTimeHorizon)
    return {
      purchase: purchaseCostTotal,
      rental: rentalCostTotal,
      savings: purchaseCostTotal - rentalCostTotal,
    }
  }, [purchaseData.totalPrice, monthly3ans, selectedTimeHorizon])

  const isRentalBetter = projectedCosts.savings > 0
  const recommendsRental =
    isRentalBetter && breakEvenYears !== null && selectedTimeHorizon < breakEvenYears

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 p-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Comparaison Achat vs Location</h2>
        </div>
        <p className="mx-auto max-w-2xl text-gray-600">
          Analysez les deux options pour faire le meilleur choix selon vos besoins et votre
          situation financière
        </p>
      </div>

      <TimeHorizonSelector
        timeHorizons={timeHorizons}
        selectedTimeHorizon={selectedTimeHorizon}
        onSelect={setSelectedTimeHorizon}
        isBreakEvenBeyondMax={isBreakEvenBeyondMax}
        breakEvenYears={breakEvenYears}
      />

      {/* Main Comparison Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Purchase Option */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-3">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-green-900">Achat</CardTitle>
                </div>
                {!isRentalBetter && breakEvenYears && selectedTimeHorizon > breakEvenYears && (
                  <Badge className="bg-green-500 text-white">Recommandé</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="mb-2 text-4xl font-bold text-green-900">
                  {formatPriceHelper(projectedCosts.purchase)}
                </div>
                <div className="text-sm font-medium text-green-700">
                  Coût total sur {selectedTimeHorizon} an
                  {selectedTimeHorizon > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/50 bg-white/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Coût d&apos;acquisition (unique)
                    </span>
                    <span className="font-bold text-green-900">
                      {formatPriceHelper(purchaseData.totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Coût sur {selectedTimeHorizon} an
                      {selectedTimeHorizon > 1 ? 's' : ''}
                    </span>
                    <span className="font-bold text-green-900">
                      {formatPriceHelper(projectedCosts.purchase)}
                    </span>
                  </div>
                </div>

                <AdvantageList
                  title="Avantages"
                  items={PURCHASE_ADVANTAGES}
                  colorScheme="green"
                  icon={<CheckCircle className="h-4 w-4" />}
                />

                <AdvantageList
                  title="Inconvénients"
                  items={PURCHASE_DISADVANTAGES}
                  colorScheme="green"
                  variant="muted"
                  icon={<XCircle className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rental Option */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-blue-900">Location</CardTitle>
                </div>
                {recommendsRental && <Badge className="bg-blue-500 text-white">Recommandé</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-blue-900">
                    {formatPriceHelper(
                      ceilPrice(projectedCosts.rental / (selectedTimeHorizon * 12)),
                    )}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-blue-400 bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                  >
                    /mois moy.
                  </Badge>
                </div>
                <div className="mb-2 text-sm text-blue-500">
                  {formatPriceHelper(projectedCosts.rental)} total sur {selectedTimeHorizon} an
                  {selectedTimeHorizon > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-white/50 bg-white/60 p-4">
                  <RentalCostBreakdown
                    selectedTimeHorizon={selectedTimeHorizon}
                    monthly3ans={monthly3ans}
                    postThreeYearMonthly={postThreeYearMonthly}
                    annualRentalPrice={rental3Years.totalPrice}
                  />
                  <div className="h-px bg-blue-200/50"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                      Coût sur {selectedTimeHorizon} an
                      {selectedTimeHorizon > 1 ? 's' : ''}
                    </span>
                    <span className="font-bold text-blue-900">
                      {formatPriceHelper(projectedCosts.rental)}
                    </span>
                  </div>
                </div>

                <AdvantageList
                  title="Avantages"
                  items={RENTAL_ADVANTAGES}
                  colorScheme="blue"
                  icon={<CheckCircle className="h-4 w-4" />}
                />

                <AdvantageList
                  title="Inconvénients"
                  items={RENTAL_DISADVANTAGES}
                  colorScheme="blue"
                  variant="muted"
                  icon={<XCircle className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {breakEvenResult && breakEvenYears && breakEvenMonths && breakEvenPhase && (
        <BreakEvenAnalysisCard
          breakEvenYears={breakEvenYears}
          breakEvenMonths={breakEvenMonths}
          breakEvenPhase={breakEvenPhase}
          projectedCosts={projectedCosts}
          selectedTimeHorizon={selectedTimeHorizon}
          monthly3ans={monthly3ans}
          postThreeYearMonthly={postThreeYearMonthly}
          annualRentalPrice={rental3Years.totalPrice}
          dynamicMax={dynamicMax}
        />
      )}

      <RecommendationSection
        recommendsRental={recommendsRental}
        selectedTimeHorizon={selectedTimeHorizon}
        projectedCosts={projectedCosts}
        breakEvenPhase={breakEvenPhase}
        postThreeYearMonthly={postThreeYearMonthly}
        breakEvenYears={breakEvenYears}
        breakEvenMonths={breakEvenMonths}
        projectKitCount={project.projectKits?.length || 0}
      />
    </div>
  )
}
