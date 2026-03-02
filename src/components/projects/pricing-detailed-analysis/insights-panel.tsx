'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { formatPrice as formatPriceHelper } from '@/lib/utils/product-helpers'
import type { PurchaseRentalMode, ProductPeriod } from '@/lib/schemas/product'
import type { ProjectCostBreakdown, KitBreakdownItem } from '@/lib/utils/project/calculations'

const PERIOD_LABELS: Record<ProductPeriod, string> = {
  '1an': '1 an',
  '2ans': '2 ans',
  '3ans': '3 ans',
}

interface InsightsPanelProps {
  currentData: ProjectCostBreakdown
  kitBreakdown: readonly KitBreakdownItem[]
  marginPercentage: number
  averagePricePerKit: number
  selectedMode: PurchaseRentalMode
  selectedPeriod: ProductPeriod
  canViewCosts: boolean
}

/**
 * Analysis and recommendations panel showing profitability insights and pricing tips.
 * Margin-related insights are only visible to admin/dev users.
 * @param props - Calculated pricing data, mode/period selection, and cost visibility flag
 * @returns Card with contextual insights and recommendations
 */
export function InsightsPanel({
  currentData,
  kitBreakdown,
  marginPercentage,
  averagePricePerKit,
  selectedMode,
  selectedPeriod,
  canViewCosts,
}: InsightsPanelProps) {
  return (
    <Card className="rounded-2xl border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-start space-x-4">
          <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 p-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="mb-4 text-xl font-bold text-indigo-900">Analyse et recommandations</h3>
            <div className="space-y-3 text-sm text-indigo-800">
              {canViewCosts &&
                (marginPercentage > 30 ? (
                  <InsightRow color="green">
                    Excellente rentabilité ! Votre marge de {marginPercentage.toFixed(1)}% est très
                    bonne.
                  </InsightRow>
                ) : marginPercentage > 20 ? (
                  <InsightRow color="yellow">
                    Rentabilité correcte. Considérez optimiser les coûts pour améliorer la marge.
                  </InsightRow>
                ) : (
                  <InsightRow color="red">
                    Marge faible. Analysez les coûts et considérez ajuster les prix.
                  </InsightRow>
                ))}

              <InsightRow color="blue">
                Prix moyen par kit : {formatPriceHelper(averagePricePerKit)}
              </InsightRow>

              {canViewCosts && (
                <InsightRow color="purple">
                  {selectedMode === 'achat'
                    ? `Coût total pour l'achat : ${formatPriceHelper(currentData.totalCost)}`
                    : `Coût total pour la location ${PERIOD_LABELS[selectedPeriod].toLowerCase()} : ${formatPriceHelper(currentData.totalCost)}`}
                </InsightRow>
              )}

              {canViewCosts && kitBreakdown.length > 0 && (
                <InsightRow color="emerald">
                  Kit le plus rentable :{' '}
                  {kitBreakdown.reduce((max, kit) =>
                    kit.marginPercentage > max.marginPercentage ? kit : max,
                  )?.kitName || 'N/A'}
                </InsightRow>
              )}

              <InsightRow color="amber">
                {selectedMode === 'achat'
                  ? 'Achat de produits neufs avec impact environnemental complet'
                  : "Location d'équipements existants avec impact environnemental réduit"}
              </InsightRow>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const DOT_COLORS = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
} as const

type DotColor = keyof typeof DOT_COLORS

function InsightRow({ color, children }: { color: DotColor; children: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-3 rounded-xl border border-white/50 bg-white/60 p-3">
      <div className={`h-2 w-2 flex-shrink-0 rounded-full ${DOT_COLORS[color]}`}></div>
      <span className="font-medium">{children}</span>
    </div>
  )
}
