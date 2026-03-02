'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice as formatPriceHelper } from '@/lib/utils/product-helpers'
import { formatBreakEvenDuration, type BreakEvenPhase } from '@/lib/utils/project/calculations'
import { PHASE_LABELS, PHASE_ORDER } from './constants'
import type { ProjectedCosts } from './types'

interface BreakEvenAnalysisCardProps {
  breakEvenYears: number
  breakEvenMonths: number
  breakEvenPhase: BreakEvenPhase
  projectedCosts: ProjectedCosts
  selectedTimeHorizon: number
  monthly3ans: number
  postThreeYearMonthly: number
  annualRentalPrice: number
  dynamicMax: number
}

/**
 * Break-even analysis card with visual timeline and tiered cost display.
 * @param props - Break-even data, projected costs, and rental pricing
 * @returns Animated card with timeline, savings summary, and monthly cost breakdown
 */
export function BreakEvenAnalysisCard({
  breakEvenYears,
  breakEvenMonths,
  breakEvenPhase,
  projectedCosts,
  selectedTimeHorizon,
  monthly3ans,
  postThreeYearMonthly,
  annualRentalPrice,
  dynamicMax,
}: Readonly<BreakEvenAnalysisCardProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            Analyse de rentabilité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-3xl font-bold text-amber-900">
              {formatBreakEvenDuration(breakEvenMonths)}
            </div>
            <div className="text-sm text-amber-700">
              Point d&apos;équilibre entre achat et location
            </div>
            <div className="text-xs text-amber-600">
              Phase : {PHASE_LABELS[breakEvenPhase] ?? breakEvenPhase}
            </div>
          </div>

          {/* Visual Timeline */}
          <div className="space-y-2">
            <div className="flex h-8 overflow-hidden rounded-lg">
              {PHASE_ORDER.map((phase) => {
                const isActive = phase === breakEvenPhase
                const widthClass = phase === '3ans+' ? 'flex-[2]' : 'flex-1'

                return (
                  <div
                    key={phase}
                    className={cn(
                      'flex items-center justify-center text-[10px] font-medium transition-all',
                      isActive
                        ? 'bg-amber-400 text-amber-900 ring-2 ring-amber-500 ring-offset-1'
                        : 'bg-amber-100 text-amber-600',
                      widthClass,
                    )}
                  >
                    {PHASE_LABELS[phase]}
                  </div>
                )
              })}
            </div>
            <div className="relative h-2">
              <div
                className="absolute top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-600 shadow-sm"
                style={{
                  left: `${Math.min((breakEvenYears / Math.max(dynamicMax, breakEvenYears)) * 100, 100)}%`,
                }}
              />
              <div className="h-px w-full bg-amber-200" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-amber-900">
                {formatPriceHelper(Math.abs(projectedCosts.savings))}
              </div>
              <div className="text-sm text-amber-700">
                {projectedCosts.savings >= 0 ? 'Économies' : 'Surcoût'} sur {selectedTimeHorizon} an
                {selectedTimeHorizon > 1 ? 's' : ''}
              </div>
            </div>
            <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-amber-900">
                {projectedCosts.purchase > 0
                  ? ((Math.abs(projectedCosts.savings) / projectedCosts.purchase) * 100).toFixed(1)
                  : '0.0'}
                %
              </div>
              <div className="text-sm text-amber-700">
                {projectedCosts.savings >= 0 ? 'Économie' : 'Surcoût'} relatif
              </div>
            </div>
            <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
              {breakEvenPhase === '3ans+' ? (
                <TieredMonthlyCost
                  monthly3ans={monthly3ans}
                  postThreeYearMonthly={postThreeYearMonthly}
                />
              ) : (
                <SingleMonthlyCost
                  monthly3ans={monthly3ans}
                  annualRentalPrice={annualRentalPrice}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface TieredMonthlyCostProps {
  monthly3ans: number
  postThreeYearMonthly: number
}

function TieredMonthlyCost({
  monthly3ans,
  postThreeYearMonthly,
}: Readonly<TieredMonthlyCostProps>) {
  return (
    <>
      <div className="mb-1 flex items-center justify-center gap-1.5">
        <span className="text-lg font-bold text-amber-900">{formatPriceHelper(monthly3ans)}</span>
        <Badge
          variant="outline"
          className="border-amber-400 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-600"
        >
          /mois
        </Badge>
      </div>
      <div className="text-xs text-amber-700">3 premières années</div>
      <div className="my-1 h-px bg-amber-200/50" />
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-lg font-bold text-amber-900">
          {formatPriceHelper(postThreeYearMonthly)}
        </span>
        <Badge
          variant="outline"
          className="border-amber-400 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-600"
        >
          /mois
        </Badge>
      </div>
      <div className="text-xs text-amber-600">au-delà de 3 ans (20%)</div>
    </>
  )
}

interface SingleMonthlyCostProps {
  monthly3ans: number
  annualRentalPrice: number
}

function SingleMonthlyCost({ monthly3ans, annualRentalPrice }: Readonly<SingleMonthlyCostProps>) {
  return (
    <>
      <div className="mb-1 flex items-center justify-center gap-1.5">
        <span className="text-2xl font-bold text-amber-900">{formatPriceHelper(monthly3ans)}</span>
        <Badge
          variant="outline"
          className="border-amber-400 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-600"
        >
          /mois
        </Badge>
      </div>
      <div className="text-sm text-amber-700">Coût mensuel location</div>
      <div className="mt-0.5 text-xs text-amber-500">
        {formatPriceHelper(annualRentalPrice)} /an
      </div>
    </>
  )
}
