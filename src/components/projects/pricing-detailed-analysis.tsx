'use client'

import { useState, useCallback } from 'react'
import { useCanViewCosts } from '@/hooks/use-can-view-costs'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Euro, Percent, Calendar, ShoppingCart, Home } from 'lucide-react'
import type { Project } from '@/lib/types/project'
import type { PurchaseRentalMode, ProductPeriod } from '@/lib/schemas/product'
import { LocationPriceDisplay } from './location-price-display'
import { ExtendedRentalHorizon } from './pricing-detailed-analysis/extended-rental-horizon'
import { PricingOverviewCards } from './pricing-detailed-analysis/pricing-overview-cards'
import { KitBreakdownTable } from './pricing-detailed-analysis/kit-breakdown-table'
import { PeriodComparisonTable } from './pricing-detailed-analysis/period-comparison-table'
import { InsightsPanel } from './pricing-detailed-analysis/insights-panel'
import { formatPrice as formatPriceHelper, annualToMonthly } from '@/lib/utils/product-helpers'
import {
  calculateProjectPurchaseCosts,
  calculateProjectRentalCosts,
  getProjectKitBreakdown,
} from '@/lib/utils/project/calculations'

const PERIOD_LABELS: Record<ProductPeriod, string> = {
  '1an': '1 an',
  '2ans': '2 ans',
  '3ans': '3 ans',
}

interface PricingDetailedAnalysisProps {
  project: Project
}

/**
 * Detailed pricing analysis panel for a project.
 * Displays mode/period selectors, overview cards, profitability analysis,
 * kit breakdown, period comparison, and insights/recommendations.
 * @param props - The component props containing the project data
 * @returns The rendered detailed analysis view
 */
export function PricingDetailedAnalysis({ project }: PricingDetailedAnalysisProps) {
  const canViewCosts = useCanViewCosts()
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat')
  const [selectedPeriod, setSelectedPeriod] = useState<ProductPeriod>('1an')
  const [selectedHorizon, setSelectedHorizon] = useState(5)

  const handleHorizonChange = useCallback((years: number) => {
    setSelectedHorizon(years)
  }, [])

  const currentData =
    selectedMode === 'achat'
      ? calculateProjectPurchaseCosts(project)
      : calculateProjectRentalCosts(project, selectedPeriod)

  const marginPercentage =
    currentData.totalPrice > 0 ? (currentData.totalMargin / currentData.totalPrice) * 100 : 0

  const kitBreakdown = getProjectKitBreakdown(project, selectedMode, selectedPeriod)

  const averagePricePerKit =
    kitBreakdown.length > 0 ? currentData.totalPrice / kitBreakdown.length : 0

  return (
    <div className="space-y-6">
      {/* Mode & period selector */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-2">
              <Euro className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-base font-semibold text-gray-900">Mode de commercialisation</span>
          </div>
          <div className="flex space-x-3 rounded-2xl bg-gray-100 p-1">
            <Button
              variant={selectedMode === 'achat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('achat')}
              className={`flex items-center gap-2 ${
                selectedMode === 'achat' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Achat
            </Button>
            <Button
              variant={selectedMode === 'location' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('location')}
              className={`flex items-center gap-2 ${
                selectedMode === 'location' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
              }`}
            >
              <Home className="h-4 w-4" />
              Location
            </Button>
          </div>
        </div>

        {selectedMode === 'location' && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 p-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-base font-semibold text-gray-900">Période de location</span>
              </div>
              <div className="flex space-x-3 rounded-2xl bg-gray-100 p-1">
                {(['1an', '2ans', '3ans'] as ProductPeriod[]).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={
                      selectedPeriod === period ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
                    }
                  >
                    {PERIOD_LABELS[period]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overview cards */}
      <motion.div
        key={`overview-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`grid grid-cols-1 gap-6 ${canViewCosts ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}
      >
        <PricingOverviewCards
          currentData={currentData}
          selectedMode={selectedMode}
          canViewCosts={canViewCosts}
        />
      </motion.div>

      {/* Profitability breakdown */}
      <motion.div
        key={`profitability-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ProfitabilityBreakdown
          currentData={currentData}
          marginPercentage={marginPercentage}
          averagePricePerKit={averagePricePerKit}
          kitCount={kitBreakdown.length}
          selectedMode={selectedMode}
          selectedPeriod={selectedPeriod}
          canViewCosts={canViewCosts}
        />
      </motion.div>

      {/* Kit breakdown */}
      <motion.div
        key={`kits-detail-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <KitBreakdownTable
          kitBreakdown={kitBreakdown}
          selectedMode={selectedMode}
          selectedPeriod={selectedPeriod}
          canViewCosts={canViewCosts}
        />
      </motion.div>

      {/* Period comparison (location mode only) */}
      {selectedMode === 'location' && (
        <motion.div
          key="location-comparison"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <PeriodComparisonTable
            project={project}
            selectedPeriod={selectedPeriod}
            canViewCosts={canViewCosts}
          />
        </motion.div>
      )}

      {/* Extended rental horizon (location mode only) */}
      {selectedMode === 'location' && (
        <ExtendedRentalHorizon
          project={project}
          selectedHorizon={selectedHorizon}
          onHorizonChange={handleHorizonChange}
        />
      )}

      {/* Insights */}
      <motion.div
        key={`insights-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <InsightsPanel
          currentData={currentData}
          kitBreakdown={kitBreakdown}
          marginPercentage={marginPercentage}
          averagePricePerKit={averagePricePerKit}
          selectedMode={selectedMode}
          selectedPeriod={selectedPeriod}
          canViewCosts={canViewCosts}
        />
      </motion.div>
    </div>
  )
}

interface ProfitabilityBreakdownProps {
  currentData: { totalPrice: number; totalCost: number; totalMargin: number }
  marginPercentage: number
  averagePricePerKit: number
  kitCount: number
  selectedMode: PurchaseRentalMode
  selectedPeriod: ProductPeriod
  canViewCosts: boolean
}

function ProfitabilityBreakdown({
  currentData,
  marginPercentage,
  averagePricePerKit,
  kitCount,
  selectedMode,
  selectedPeriod,
  canViewCosts,
}: ProfitabilityBreakdownProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm">
              <Percent className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900">Rentabilité du projet</h3>
              <p className="text-sm font-medium text-amber-700">
                {selectedMode === 'achat'
                  ? "Analyse pour l'achat de produits neufs"
                  : `Analyse pour la location ${PERIOD_LABELS[selectedPeriod].toLowerCase()}`}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800"
          >
            {selectedMode === 'achat' ? 'Achat unique' : PERIOD_LABELS[selectedPeriod]}
          </Badge>
        </div>

        <div className={`grid grid-cols-1 gap-8 ${canViewCosts ? 'md:grid-cols-2' : ''}`}>
          {canViewCosts && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
                <span className="text-sm font-medium text-amber-800">Marge brute</span>
                <span className="text-xl font-bold text-amber-900">
                  {marginPercentage.toFixed(1)}%
                </span>
              </div>

              <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
                <Progress value={Math.min(marginPercentage, 100)} className="h-4 bg-amber-100" />
              </div>

              <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
                <div className="space-y-3 text-sm text-amber-700">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Coût</span>
                    <div className="text-right">
                      <span className="font-semibold text-amber-900">
                        {formatPriceHelper(
                          selectedMode === 'location'
                            ? annualToMonthly(currentData.totalCost)
                            : currentData.totalCost,
                        )}
                      </span>
                      {selectedMode === 'location' && (
                        <span className="ml-1 text-xs text-amber-600">/mois</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Marge</span>
                    <div className="text-right">
                      <span className="font-semibold text-amber-900">
                        {formatPriceHelper(
                          selectedMode === 'location'
                            ? annualToMonthly(currentData.totalMargin)
                            : currentData.totalMargin,
                        )}
                      </span>
                      {selectedMode === 'location' && (
                        <span className="ml-1 text-xs text-amber-600">/mois</span>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-amber-200"></div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Prix de vente</span>
                    <div className="text-right">
                      <span className="font-bold text-amber-900">
                        {formatPriceHelper(
                          selectedMode === 'location'
                            ? annualToMonthly(currentData.totalPrice)
                            : currentData.totalPrice,
                        )}
                      </span>
                      {selectedMode === 'location' && (
                        <span className="ml-1 text-xs text-amber-600">/mois</span>
                      )}
                    </div>
                  </div>
                  {selectedMode === 'location' && (
                    <div className="pt-1 text-right text-xs text-amber-500">
                      {formatPriceHelper(currentData.totalPrice)} /an
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 text-center shadow-sm">
              {selectedMode === 'location' ? (
                <LocationPriceDisplay
                  annualPrice={averagePricePerKit}
                  label="Prix moyen par kit"
                  variant="card"
                  priceClassName="text-amber-900 text-3xl"
                  secondaryClassName="text-amber-600"
                  labelClassName="text-amber-700"
                  badgeClassName="border-amber-500 text-amber-600 bg-amber-50"
                  secondaryBadgeClassName="border-amber-300 text-amber-500 bg-amber-50"
                />
              ) : (
                <>
                  <div className="mb-2 text-3xl font-bold text-amber-900">
                    {formatPriceHelper(averagePricePerKit)}
                  </div>
                  <div className="text-sm font-medium text-amber-700">Prix moyen par kit</div>
                </>
              )}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 text-center shadow-sm">
              <div className="mb-2 text-3xl font-bold text-amber-900">{kitCount}</div>
              <div className="text-sm font-medium text-amber-700">Nombre de kits</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
