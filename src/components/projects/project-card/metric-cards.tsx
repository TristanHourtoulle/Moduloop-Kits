'use client';

import { motion } from 'framer-motion';
import { Euro, Square, Leaf, Package2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/product-helpers';
import { ProjectCardPricingMode, SurfaceMode } from '@/lib/types/project-card';

interface BaseMetricCardProps {
  className?: string;
}

interface PriceMetricCardProps extends BaseMetricCardProps {
  totalPrice: number;
  pricePerM2: number | null;
  mode: ProjectCardPricingMode;
}

interface SurfaceMetricCardProps extends BaseMetricCardProps {
  totalSurface: number;
  surfaceMode: SurfaceMode;
}

interface CO2MetricCardProps extends BaseMetricCardProps {
  totalCO2: number;
  mode: ProjectCardPricingMode;
}

interface KitSummaryCardProps extends BaseMetricCardProps {
  kitCount: number;
  totalUnits: number;
}

/**
 * Price metric card with mode-aware display
 * Shows total price and price per m² if surface is available
 */
export function PriceMetricCard({
  totalPrice,
  pricePerM2,
  mode,
  className = '',
}: PriceMetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`group relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-green-500/[0.02] to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl'></div>
      <div className='relative z-10'>
        <div className='flex items-center gap-2 mb-2'>
          <Euro className='h-4 w-4 text-green-600' />
          <span className='text-xs font-semibold text-green-600 uppercase tracking-wide'>
            Prix
          </span>
        </div>
        <p className='text-2xl font-bold text-green-900 mb-1'>
          {formatPrice(totalPrice)}
        </p>
        {pricePerM2 && (
          <p className='text-sm font-medium text-green-700'>
            {pricePerM2.toLocaleString('fr-FR')}€/m²
          </p>
        )}
        <p className='text-xs text-green-600 mt-1.5 font-medium'>
          {mode === 'achat' ? 'Achat' : 'Location 3 ans'}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Surface metric card with manual/auto indicator
 * Shows total surface and mode badge
 */
export function SurfaceMetricCard({
  totalSurface,
  surfaceMode,
  className = '',
}: SurfaceMetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`group relative bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl'></div>
      <div className='relative z-10'>
        <div className='flex items-center gap-2 mb-2'>
          <Square className='h-4 w-4 text-orange-600' />
          <span className='text-xs font-semibold text-orange-600 uppercase tracking-wide'>
            Surface
          </span>
        </div>
        <p className='text-2xl font-bold text-orange-900 mb-1'>
          {totalSurface > 0 ? totalSurface.toFixed(1) : '0'} m²
        </p>
        {surfaceMode && (
          <div className='flex items-center gap-1.5 mt-1.5'>
            <span className='text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full'>
              {surfaceMode === 'manual' ? '✏️ Manuel' : '🔢 Auto'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * CO2 metric card with mode-aware labeling
 * Shows impact or savings depending on mode
 */
export function CO2MetricCard({
  totalCO2,
  mode,
  className = '',
}: CO2MetricCardProps) {
  const displayValue = Math.abs(totalCO2);
  const isLocationMode = mode === 'location';

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`group relative bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-green-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl'></div>
      <div className='relative z-10'>
        <div className='flex items-center gap-2 mb-2'>
          <Leaf className='h-4 w-4 text-emerald-600' />
          <span className='text-xs font-semibold text-emerald-600 uppercase tracking-wide'>
            CO₂
          </span>
        </div>
        <p className='text-2xl font-bold text-emerald-900 mb-1'>
          {displayValue.toFixed(1)} kg
        </p>
        <p className='text-xs text-emerald-600 mt-1.5 font-medium'>
          {isLocationMode ? 'Économisé' : 'Impact'}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Kit summary card showing kit types and total units
 */
export function KitSummaryCard({
  kitCount,
  totalUnits,
  className = '',
}: KitSummaryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className={`group relative bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl'></div>
      <div className='relative z-10'>
        <div className='flex items-center gap-2 mb-2'>
          <Package2 className='h-4 w-4 text-blue-600' />
          <span className='text-xs font-semibold text-blue-600 uppercase tracking-wide'>
            Kits
          </span>
        </div>
        <p className='text-2xl font-bold text-blue-900 mb-1'>
          {kitCount}
        </p>
        <p className='text-sm font-medium text-blue-700'>
          {totalUnits} unité{totalUnits > 1 ? 's' : ''}
        </p>
      </div>
    </motion.div>
  );
}
