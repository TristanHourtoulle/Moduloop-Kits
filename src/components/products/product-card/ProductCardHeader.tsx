'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProductCardHeaderProps {
  name: string
  reference: string
  className?: string
}

export function ProductCardHeader({ name, reference, className }: ProductCardHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Product Name */}
      <div>
        <h3 className="text-foreground group-hover:text-primary line-clamp-1 text-lg font-semibold transition-colors duration-200">
          {name}
        </h3>
      </div>

      {/* Reference Badge */}
      <div>
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20 border text-xs font-medium"
        >
          {reference}
        </Badge>
      </div>
    </div>
  )
}
