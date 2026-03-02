'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3 } from 'lucide-react'
import { formatPrice as formatPriceHelper, annualToMonthly } from '@/lib/utils/product-helpers'
import { calculateProjectRentalCosts } from '@/lib/utils/project/calculations'
import type { Project } from '@/lib/types/project'
import type { ProductPeriod } from '@/lib/schemas/product'

const PERIOD_LABELS: Record<ProductPeriod, string> = {
  '1an': '1 an',
  '2ans': '2 ans',
  '3ans': '3 ans',
}

const PERIODS: readonly ProductPeriod[] = ['1an', '2ans', '3ans'] as const

interface PeriodComparisonTableProps {
  project: Project
  selectedPeriod: ProductPeriod
  canViewCosts: boolean
}

/**
 * Comparison table showing pricing across all rental periods (1, 2, 3 years).
 * Memoizes rental cost calculations to avoid redundant computation on re-renders.
 * Cost/margin columns are only visible to admin/dev users.
 * @param props - Project data, currently selected period, and cost visibility flag
 * @returns Card with period comparison table
 */
export function PeriodComparisonTable({
  project,
  selectedPeriod,
  canViewCosts,
}: PeriodComparisonTableProps) {
  const periodData = useMemo(
    () =>
      PERIODS.map((period) => {
        const prices = calculateProjectRentalCosts(project, period)
        const marginPercent =
          prices.totalPrice > 0 ? (prices.totalMargin / prices.totalPrice) * 100 : 0
        return { period, prices, marginPercent }
      }),
    [project],
  )

  return (
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
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Prix /mois</th>
                {canViewCosts && (
                  <>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Coût /mois</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Marge /mois
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Marge %</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {periodData.map(({ period, prices, marginPercent }) => (
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
                  {canViewCosts && (
                    <>
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
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
