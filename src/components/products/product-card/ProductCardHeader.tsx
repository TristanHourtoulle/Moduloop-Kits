'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardHeaderProps {
  name: string;
  reference: string;
  className?: string;
}

export function ProductCardHeader({
  name,
  reference,
  className,
}: ProductCardHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Product Name */}
      <div>
        <h3 className='text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200'>
          {name}
        </h3>
      </div>

      {/* Reference Badge */}
      <div>
        <Badge
          variant='secondary'
          className='text-xs bg-primary/10 text-primary border border-primary/20 font-medium'
        >
          {reference}
        </Badge>
      </div>
    </div>
  );
}
