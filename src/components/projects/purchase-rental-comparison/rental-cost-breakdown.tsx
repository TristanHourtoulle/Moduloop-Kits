'use client'

import { Badge } from '@/components/ui/badge'
import { formatPrice as formatPriceHelper } from '@/lib/utils/product-helpers'

interface RentalCostBreakdownProps {
  selectedTimeHorizon: number
  monthly3ans: number
  postThreeYearMonthly: number
  annualRentalPrice: number
}

/**
 * Two-tier monthly cost display for rental pricing.
 * Shows a single rate for horizons <= 3 years and a breakdown for longer horizons.
 * @param props - Monthly rates and time horizon for display logic
 * @returns Rental cost breakdown with tier-specific formatting
 */
export function RentalCostBreakdown({
  selectedTimeHorizon,
  monthly3ans,
  postThreeYearMonthly,
  annualRentalPrice,
}: Readonly<RentalCostBreakdownProps>) {
  if (selectedTimeHorizon <= 3) {
    return (
      <>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">Coût mensuel</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-blue-900">{formatPriceHelper(monthly3ans)}</span>
            <Badge
              variant="outline"
              className="border-blue-400 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-600"
            >
              /mois
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-blue-600">
          <span>Coût annuel</span>
          <span>{formatPriceHelper(annualRentalPrice)} /an</span>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">Tarif 3 premières années</span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-blue-900">{formatPriceHelper(monthly3ans)}</span>
          <Badge
            variant="outline"
            className="border-blue-400 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-600"
          >
            /mois
          </Badge>
        </div>
      </div>
      <div className="h-px bg-blue-200/50"></div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">Tarif au-delà de 3 ans</span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-blue-900">{formatPriceHelper(postThreeYearMonthly)}</span>
          <Badge
            variant="outline"
            className="border-blue-400 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-600"
          >
            /mois
          </Badge>
        </div>
      </div>
      <div className="text-center text-xs text-blue-500">20% du tarif initial après 3 ans</div>
    </>
  )
}
