'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Leaf, Flame, Droplets, Zap, AlertTriangle, CheckCircle, Info, Award } from 'lucide-react'
import type { Project } from '@/lib/types/project'
import { formatEnvironmentalImpact } from '@/lib/utils/product-helpers'
import { calculateEnvironmentalSavings } from '@/lib/utils/project/calculations'

interface EnvironmentalMetricsProps {
  project: Project
}

const getMetricInfo = (metric: string) => {
  switch (metric) {
    case 'rechauffementClimatique':
      return {
        name: 'Réchauffement climatique',
        unit: 'kg CO₂ eq',
        description: 'Économie de CO₂ vs produits neufs',
        icon: Flame,
        color: '#FE9E58', // CO₂ - Orange
        formatUnit: 'kg' as const,
      }
    case 'epuisementRessources':
      return {
        name: 'Épuisement des ressources',
        unit: 'MJ',
        description: "Économie d'énergie vs produits neufs",
        icon: Zap,
        color: '#FE5858', // Ressources - Rouge
        formatUnit: 'MJ' as const,
      }
    case 'acidification':
      return {
        name: 'Acidification',
        unit: 'MOL H⁺',
        description: 'Réduction acidification vs produits neufs',
        icon: Droplets,
        color: '#55D789', // Acidification - Vert
        formatUnit: 'MOL' as const,
      }
    case 'eutrophisation':
      return {
        name: 'Eutrophisation',
        unit: 'kg P eq',
        description: 'Économie eutrophisation vs produits neufs',
        icon: Leaf,
        color: '#55D789', // Eutrophisation - Vert
        formatUnit: 'kg' as const,
      }
    default:
      return {
        name: 'Métrique',
        unit: 'unit',
        description: 'Description',
        icon: Info,
        color: '#6B7280', // Gray
        formatUnit: 'kg' as const,
      }
  }
}

const getSavingsLevel = (value: number) => {
  if (value >= 500) {
    return {
      level: 'high',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      icon: Award,
      label: 'Excellent',
    }
  } else if (value >= 100) {
    return {
      level: 'medium',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      icon: CheckCircle,
      label: 'Bon',
    }
  } else {
    return {
      level: 'low',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      icon: Info,
      label: 'Modéré',
    }
  }
}

/**
 * Environmental impact metrics showing savings from rental vs new products.
 * @param props - Project data for environmental calculations
 * @returns Grid of environmental metric cards with savings levels
 */
export function EnvironmentalMetrics({ project }: EnvironmentalMetricsProps) {
  const savings = calculateEnvironmentalSavings(project)
  const metrics = Object.entries(savings)

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-green-50 p-6">
        <div className="flex items-start space-x-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-100 to-green-100 p-3">
            <Info className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-bold text-blue-900">
              Impact environnemental en mode location
            </h3>
            <p className="text-sm leading-relaxed text-blue-800">
              Les données ci-dessous représentent les{' '}
              <strong>économies d&apos;impact environnemental</strong> réalisées en choisissant la
              location d&apos;équipements existants par rapport à l&apos;achat de produits neufs.
              Cette approche permet de réduire significativement l&apos;empreinte carbone et
              l&apos;utilisation de ressources.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {metrics.map(([key, value], index) => {
          const info = getMetricInfo(key)
          const IconComponent = info.icon
          const metricSavingsLevel = getSavingsLevel(value)

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300"
                        style={{ backgroundColor: `${info.color}20` }}
                      >
                        <IconComponent className="h-6 w-6" style={{ color: info.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{info.name}</h3>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                    <Badge
                      className={`${metricSavingsLevel.bgColor} ${metricSavingsLevel.color} border-0 px-3 py-1`}
                    >
                      <metricSavingsLevel.icon className="mr-1 h-3 w-3" />
                      {metricSavingsLevel.label}
                    </Badge>
                  </div>

                  <div className="mb-6 text-center">
                    <div className="mb-2 text-4xl font-bold" style={{ color: info.color }}>
                      {formatEnvironmentalImpact(value, info.formatUnit)}
                    </div>
                    <div className="text-sm font-medium text-gray-600">{info.unit} économisés</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <h4 className="mb-1 font-semibold text-amber-800">Note importante</h4>
            <p className="text-xs leading-relaxed text-amber-700">
              <strong>Pour l&apos;achat de produits neufs</strong>, nous ne disposons pas
              actuellement de données d&apos;impact environnemental spécifiques. Les économies
              affichées correspondent uniquement aux bénéfices de la location par rapport à une
              estimation d&apos;impact pour des produits neufs équivalents.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
