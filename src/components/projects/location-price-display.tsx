import { Badge } from '@/components/ui/badge'
import { formatPrice, annualToMonthly } from '@/lib/utils/product-helpers'
import { cn } from '@/lib/utils'

interface LocationPriceDisplayProps {
  annualPrice: number
  label?: string
  variant?: 'card' | 'inline' | 'table-cell'
  showAnnual?: boolean
  priceClassName?: string
  secondaryClassName?: string
  labelClassName?: string
  badgeClassName?: string
  secondaryBadgeClassName?: string
  className?: string
}

/**
 * Displays a location (rental) price with monthly as primary and annual as secondary.
 * All color/style classes are received via props to respect the host visual theme.
 *
 * @param props.annualPrice - The yearly price to convert and display
 * @param props.label - Optional text label rendered below the prices (e.g. "Prix Total")
 * @param props.variant - Layout variant: "card" (centered), "inline" (horizontal), "table-cell" (right-aligned)
 * @param props.showAnnual - Whether to show the annual price as secondary text (default: true)
 * @param props.priceClassName - Tailwind classes for the primary monthly price text
 * @param props.secondaryClassName - Tailwind classes for the secondary annual price text
 * @param props.labelClassName - Tailwind classes for the label text
 * @param props.badgeClassName - Tailwind classes for the /mois badge
 * @param props.secondaryBadgeClassName - Tailwind classes for the /an badge
 * @param props.className - Tailwind classes for the root container
 * @returns A React element rendering monthly + annual prices with /mois and /an badges
 */
export function LocationPriceDisplay({
  annualPrice,
  label,
  variant = 'card',
  showAnnual = true,
  priceClassName,
  secondaryClassName,
  labelClassName,
  badgeClassName,
  secondaryBadgeClassName,
  className,
}: LocationPriceDisplayProps) {
  const monthlyPrice = annualToMonthly(annualPrice)

  if (variant === 'table-cell') {
    return (
      <div className={cn('text-right', className)}>
        <div className="flex items-baseline justify-end gap-1.5">
          <span className={cn('font-semibold', priceClassName)}>
            {formatPrice(monthlyPrice)}
          </span>
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1.5 py-0', badgeClassName)}
          >
            /mois
          </Badge>
        </div>
        {showAnnual && (
          <div className={cn('text-xs mt-0.5', secondaryClassName)}>
            {formatPrice(annualPrice)}
            <span className={cn('ml-1 text-[10px]', secondaryBadgeClassName)}>
              /an
            </span>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
        <span className={cn('font-bold', priceClassName)}>
          {formatPrice(monthlyPrice)}
        </span>
        <Badge
          variant="outline"
          className={cn('text-[10px] px-1.5 py-0', badgeClassName)}
        >
          /mois
        </Badge>
        {showAnnual && (
          <span className={cn('text-sm', secondaryClassName)}>
            {formatPrice(annualPrice)}
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1.5 py-0 ml-1',
                secondaryBadgeClassName,
              )}
            >
              /an
            </Badge>
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('text-center', className)}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className={cn('text-3xl font-bold', priceClassName)}>
          {formatPrice(monthlyPrice)}
        </span>
        <Badge
          variant="outline"
          className={cn('text-xs px-2 py-0.5', badgeClassName)}
        >
          /mois
        </Badge>
      </div>
      {showAnnual && (
        <div
          className={cn(
            'flex items-center justify-center gap-1.5 text-sm',
            secondaryClassName,
          )}
        >
          <span>{formatPrice(annualPrice)}</span>
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1.5 py-0', secondaryBadgeClassName)}
          >
            /an
          </Badge>
        </div>
      )}
      {label && (
        <p className={cn('text-sm font-medium mt-1', labelClassName)}>
          {label}
        </p>
      )}
    </div>
  )
}
