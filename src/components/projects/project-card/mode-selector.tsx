'use client';

import { ShoppingCart, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCardPricingMode } from '@/lib/types/project-card';

interface ModeSelectorProps {
  mode: ProjectCardPricingMode;
  onModeChange: (mode: ProjectCardPricingMode) => void;
}

/**
 * Mode selector for project card pricing
 * Allows switching between Achat and Location (3 ans) modes
 */
export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className='flex gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200'>
      <Button
        type='button'
        variant={mode === 'achat' ? 'default' : 'outline'}
        size='sm'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onModeChange('achat');
        }}
        className={`flex-1 h-8 text-xs font-medium transition-all cursor-pointer ${
          mode === 'achat'
            ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white shadow-sm'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      >
        <ShoppingCart className='h-3 w-3 mr-1.5' />
        Achat
      </Button>
      <Button
        type='button'
        variant={mode === 'location' ? 'default' : 'outline'}
        size='sm'
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onModeChange('location');
        }}
        className={`flex-1 h-8 text-xs font-medium transition-all cursor-pointer ${
          mode === 'location'
            ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white shadow-sm'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      >
        <Home className='h-3 w-3 mr-1.5' />
        Location 3 ans
      </Button>
    </div>
  );
}
