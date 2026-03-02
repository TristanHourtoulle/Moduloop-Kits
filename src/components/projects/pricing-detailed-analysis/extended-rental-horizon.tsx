'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Calendar, TrendingUp } from 'lucide-react'
import type { Project } from '@/lib/types/project'
import { formatPrice, annualToMonthly, ceilPrice } from '@/lib/utils/product-helpers'
import {
  calculateProjectRentalCosts,
  calculatePostThreeYearMonthly,
  calculateExtendedRentalCost,
} from '@/lib/utils/project/calculations'

interface ExtendedRentalHorizonProps {
  project: Project
  selectedHorizon: number
  onHorizonChange: (years: number) => void
}

const MIN_HORIZON = 1
const MAX_HORIZON = 15

/**
 * Extended rental horizon projection with slider and tiered cost breakdown table.
 * Shows a single tier for horizons <= 3 years and a two-tier breakdown beyond.
 */
export function ExtendedRentalHorizon({
  project,
  selectedHorizon,
  onHorizonChange,
}: Readonly<ExtendedRentalHorizonProps>) {
  const rental3Years = calculateProjectRentalCosts(project, '3ans')
  const monthly3ans = annualToMonthly(rental3Years.totalPrice)
  const postThreeYearMonthly = calculatePostThreeYearMonthly(monthly3ans)

  const breakdown = useMemo(() => {
    if (monthly3ans <= 0) return null

    const totalCost = calculateExtendedRentalCost(monthly3ans, selectedHorizon)

    if (selectedHorizon <= 3) {
      const months = selectedHorizon * 12
      const subtotal = ceilPrice(monthly3ans * months)
      return {
        tiers: [
          {
            label: `Ann${selectedHorizon === 1 ? 'ée' : 'ées'} 1-${selectedHorizon}`,
            months,
            monthlyRate: monthly3ans,
            subtotal,
          },
        ],
        total: totalCost,
      }
    }

    const tier1Months = 36
    const tier1Subtotal = ceilPrice(monthly3ans * tier1Months)
    const tier2Months = (selectedHorizon - 3) * 12
    const tier2Subtotal = ceilPrice(postThreeYearMonthly * tier2Months)

    return {
      tiers: [
        {
          label: 'Années 1-3',
          months: tier1Months,
          monthlyRate: monthly3ans,
          subtotal: tier1Subtotal,
        },
        {
          label: `Années 4-${selectedHorizon}`,
          months: tier2Months,
          monthlyRate: postThreeYearMonthly,
          subtotal: tier2Subtotal,
        },
      ],
      total: totalCost,
    }
  }, [monthly3ans, postThreeYearMonthly, selectedHorizon])

  if (monthly3ans <= 0) {
    return null
  }

  return (
    <motion.div
      key="extended-rental-horizon"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
    >
      <Card className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 p-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
              <span>Projection sur l&apos;horizon</span>
            </div>
            <Badge variant="outline" className="bg-white text-xs">
              {selectedHorizon} an{selectedHorizon > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Horizon temporel</span>
              </div>
              <span className="font-semibold text-gray-900">
                {selectedHorizon} an{selectedHorizon > 1 ? 's' : ''}
              </span>
            </div>
            <Slider
              value={[selectedHorizon]}
              onValueChange={(values) => {
                if (values[0] !== undefined) onHorizonChange(values[0])
              }}
              min={MIN_HORIZON}
              max={MAX_HORIZON}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{MIN_HORIZON} an</span>
              <span>{MAX_HORIZON} ans</span>
            </div>
          </div>

          {breakdown && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Phase</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Durée</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Prix /mois</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.tiers.map((tier) => (
                    <tr
                      key={tier.label}
                      className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <span className="font-medium">{tier.label}</span>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-600">{tier.months} mois</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-semibold">{formatPrice(tier.monthlyRate)}</span>
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            /mois
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold">
                        {formatPrice(tier.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gradient-to-r from-teal-50 to-cyan-50">
                    <td className="px-4 py-4" colSpan={2}>
                      <span className="text-base font-bold text-gray-900">
                        TOTAL {selectedHorizon} an{selectedHorizon > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right" />
                    <td className="px-4 py-4 text-right">
                      <span className="text-base font-bold text-teal-700">
                        {formatPrice(breakdown.total)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {selectedHorizon > 3 && (
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 text-center text-xs text-teal-700">
              Au-delà de 3 ans, le tarif mensuel passe à 20% du tarif initial (base 3 ans)
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
