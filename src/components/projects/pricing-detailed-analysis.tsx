'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Euro,
  Package,
  TrendingUp,
  Calculator,
  Percent,
  Calendar,
  BarChart3,
  ShoppingCart,
  Home,
} from 'lucide-react'
import type { Project } from '@/lib/types/project'
import type { PurchaseRentalMode, ProductPeriod } from '@/lib/schemas/product'
import { LocationPriceDisplay } from './location-price-display'
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
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat')
  const [selectedPeriod, setSelectedPeriod] = useState<ProductPeriod>('1an')

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

      <motion.div
        key={`overview-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
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
      </motion.div>

      <motion.div
        key={`profitability-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
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

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                  <div className="mb-2 text-3xl font-bold text-amber-900">
                    {kitBreakdown.length}
                  </div>
                  <div className="text-sm font-medium text-amber-700">Nombre de kits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        key={`kits-detail-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
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
                {selectedMode === 'achat'
                  ? 'Mode Achat'
                  : `Location ${PERIOD_LABELS[selectedPeriod]}`}
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
                    </div>

                    <div className="grid grid-cols-3 gap-4">
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
      </motion.div>

      {selectedMode === 'location' && (
        <motion.div
          key="location-comparison"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 p-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>Comparaison des périodes de location</span>
                </div>
                <Badge variant="outline" className="bg-white text-xs">
                  Mode Location
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Période</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">
                        Prix /mois
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">
                        Coût /mois
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">
                        Marge /mois
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Marge %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['1an', '2ans', '3ans'] as ProductPeriod[]).map((period) => {
                      const prices = calculateProjectRentalCosts(project, period)
                      const marginPercent =
                        prices.totalPrice > 0 ? (prices.totalMargin / prices.totalPrice) * 100 : 0

                      return (
                        <tr
                          key={period}
                          className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                            selectedPeriod === period ? 'bg-[#30C1BD]/5' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              {selectedPeriod === period && (
                                <div className="h-2 w-2 rounded-full bg-[#30C1BD]"></div>
                              )}
                              <span className="font-medium">{PERIOD_LABELS[period]}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="font-semibold">
                              {formatPriceHelper(annualToMonthly(prices.totalPrice))}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatPriceHelper(prices.totalPrice)} /an
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="text-gray-600">
                              {formatPriceHelper(annualToMonthly(prices.totalCost))}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatPriceHelper(prices.totalCost)} /an
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="font-medium text-green-600">
                              {formatPriceHelper(annualToMonthly(prices.totalMargin))}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatPriceHelper(prices.totalMargin)} /an
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Badge
                              variant="outline"
                              className={`font-medium ${
                                marginPercent > 30
                                  ? 'border-green-500 bg-green-50 text-green-700'
                                  : marginPercent > 20
                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                    : 'border-red-500 bg-red-50 text-red-700'
                              }`}
                            >
                              {marginPercent.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        key={`insights-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="rounded-2xl border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-4 text-xl font-bold text-indigo-900">
                  Analyse et recommandations
                </h3>
                <div className="space-y-3 text-sm text-indigo-800">
                  {marginPercentage > 30 ? (
                    <div className="flex items-center space-x-3 rounded-xl border border-white/50 bg-white/60 p-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
                      <span className="font-medium">
                        Excellente rentabilité ! Votre marge de {marginPercentage.toFixed(1)}% est
                        très bonne.
                      </span>
                    </div>
                  ) : marginPercentage > 20 ? (
                    <div className="flex items-center space-x-3 rounded-xl border border-white/50 bg-white/60 p-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500"></div>
                      <span className="font-medium">
                        Rentabilité correcte. Considérez optimiser les coûts pour améliorer la
                        marge.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 rounded-xl border border-white/50 bg-white/60 p-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500"></div>
                      <span className="font-medium">
                        Marge faible. Analysez les coûts et considérez ajuster les prix.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 rounded-xl border border-white/50 bg-white/60 p-3">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                    <span className="font-medium">
                      Prix moyen par kit : {formatPriceHelper(averagePricePerKit)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 rounded-xl border border-white/50 bg-white/60 p-3">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-purple-500"></div>
                    <span className="font-medium">
                      {selectedMode === 'achat'
                        ? `Coût total pour l'achat : ${formatPriceHelper(currentData.totalCost)}`
                        : `Coût total pour la location ${PERIOD_LABELS[selectedPeriod].toLowerCase()} : ${formatPriceHelper(currentData.totalCost)}`}
                    </span>
                  </div>

                  {kitBreakdown.length > 0 && (
                    <div className="flex items-center space-x-3 rounded-xl border border-white/50 bg-white/60 p-3">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500"></div>
                      <span className="font-medium">
                        Kit le plus rentable :{' '}
                        {kitBreakdown.reduce((max, kit) =>
                          kit.marginPercentage > max.marginPercentage ? kit : max,
                        )?.kitName || 'N/A'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 rounded-xl border border-white/50 bg-white/60 p-3">
                    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-500"></div>
                    <span className="font-medium">
                      {selectedMode === 'achat'
                        ? 'Achat de produits neufs avec impact environnemental complet'
                        : "Location d'équipements existants avec impact environnemental réduit"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
