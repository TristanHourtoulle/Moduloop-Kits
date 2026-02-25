'use client'

import { motion } from 'framer-motion'
import { Zap, Target, Droplets, Leaf } from 'lucide-react'
import type { KitImpactResult } from '@/lib/utils/kit/calculations'

interface EnvironmentalImpactGridProps {
  impact: KitImpactResult
  variant: 'compact' | 'card'
  showSurface?: boolean
}

const METRICS = [
  {
    key: 'rechauffementClimatique' as const,
    icon: Zap,
    color: '#FE9E58',
    label: 'CO₂',
    cardLabel: 'kg CO₂ économisés',
    decimals: 1,
  },
  {
    key: 'epuisementRessources' as const,
    icon: Target,
    color: '#FE5858',
    label: 'MJ',
    cardLabel: 'MJ économisés',
    decimals: 0,
  },
  {
    key: 'acidification' as const,
    icon: Droplets,
    color: '#55D789',
    label: 'H+',
    cardLabel: 'MOL H+ économisés',
    decimals: 1,
  },
  {
    key: 'eutrophisation' as const,
    icon: Leaf,
    color: '#55D789',
    label: 'kg P eq',
    cardLabel: 'kg P eq économisés',
    decimals: 1,
  },
] as const

/**
 * Display environmental impact metrics as a grid.
 * @param props - Impact data, visual variant, and optional surface display
 * @returns A compact or card-style environmental impact grid
 */
export function EnvironmentalImpactGrid({
  impact,
  variant,
  showSurface = false,
}: EnvironmentalImpactGridProps) {
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-4 gap-2">
        {METRICS.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg p-2 text-center"
            style={{ backgroundColor: `${metric.color}15` }}
          >
            <metric.icon className="mx-auto mb-1 h-3 w-3" style={{ color: metric.color }} />
            <div className="text-xs font-semibold" style={{ color: metric.color }}>
              {impact[metric.key].toFixed(metric.decimals)}
            </div>
            <div className="text-xs text-gray-600">{metric.label}</div>
          </div>
        ))}
        {showSurface && (
          <div className="rounded-lg bg-teal-50 p-2 text-center">
            <Leaf className="mx-auto mb-1 h-3 w-3 text-teal-500" />
            <div className="text-xs font-semibold text-teal-900">{impact.surface.toFixed(1)}</div>
            <div className="text-xs text-gray-600">m²</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {METRICS.map((metric) => (
        <motion.div
          key={metric.key}
          whileHover={{ y: -2, scale: 1.02 }}
          className="rounded-xl p-4 text-center shadow-sm transition-all duration-200 hover:shadow-md"
          style={{
            backgroundColor: `${metric.color}15`,
            borderColor: `${metric.color}30`,
            borderWidth: 1,
          }}
        >
          <div
            className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${metric.color}25` }}
          >
            <metric.icon className="h-4 w-4" style={{ color: metric.color }} />
          </div>
          <div className="mb-1 text-sm font-bold" style={{ color: metric.color }}>
            {impact[metric.key].toFixed(metric.decimals)}
          </div>
          <div className="text-xs text-gray-600">{metric.cardLabel}</div>
        </motion.div>
      ))}
    </div>
  )
}
