'use client';

interface QuickStatsBarProps {
  kitCount: number;
  productCount: number;
  totalUnits: number;
  createdAt: string;
}

/**
 * Quick stats bar showing project summary metrics
 * Displays kit count, product count, units, and creation date
 */
export function QuickStatsBar({
  kitCount,
  productCount,
  totalUnits,
  createdAt,
}: QuickStatsBarProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className='flex items-center gap-4 text-xs text-gray-600 flex-wrap'>
      <span className='flex items-center gap-1'>
        <span className='text-sm'>📦</span>
        <span className='font-medium'>{kitCount}</span> kit{kitCount > 1 ? 's' : ''}
      </span>
      <span className='text-gray-300'>•</span>
      <span className='flex items-center gap-1'>
        <span className='text-sm'>🔧</span>
        <span className='font-medium'>{productCount}</span> produit{productCount > 1 ? 's' : ''}
      </span>
      <span className='text-gray-300'>•</span>
      <span className='flex items-center gap-1'>
        <span className='text-sm'>📊</span>
        <span className='font-medium'>{totalUnits}</span> unité{totalUnits > 1 ? 's' : ''}
      </span>
      <span className='text-gray-300'>•</span>
      <span className='flex items-center gap-1'>
        <span className='text-sm'>📅</span>
        {formattedDate}
      </span>
    </div>
  );
}
