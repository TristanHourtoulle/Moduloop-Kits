'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, Home } from 'lucide-react'
import type { PurchaseRentalMode } from '@/lib/schemas/product'

interface PurchaseRentalModeSelectorProps {
  mode: PurchaseRentalMode
  onModeChange: (mode: PurchaseRentalMode) => void
}

/**
 * Toggle selector between purchase (achat) and rental (location) modes.
 * @param props - Mode state and change handler
 * @returns Mode selector component
 */
export function PurchaseRentalModeSelector({
  mode,
  onModeChange,
}: PurchaseRentalModeSelectorProps) {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700">Mode :</span>
      <div className="flex space-x-1 rounded-2xl bg-gray-100 p-1">
        <Button
          variant={mode === 'achat' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('achat')}
          className={`flex items-center gap-2 transition-all duration-200 ${
            mode === 'achat'
              ? 'bg-[#30C1BD] text-white shadow-sm hover:bg-[#30C1BD]/90'
              : 'hover:bg-white/60'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Achat
        </Button>
        <Button
          variant={mode === 'location' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange('location')}
          className={`flex items-center gap-2 transition-all duration-200 ${
            mode === 'location'
              ? 'bg-[#30C1BD] text-white shadow-sm hover:bg-[#30C1BD]/90'
              : 'hover:bg-white/60'
          }`}
        >
          <Home className="h-4 w-4" />
          Location
        </Button>
      </div>
    </div>
  )
}
