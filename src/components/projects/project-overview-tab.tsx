'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Euro,
  Leaf,
  Target,
  ShoppingCart,
  Home,
  FileText,
  Edit3,
} from 'lucide-react'
import type { Project } from '@/lib/types/project'
import type { PurchaseRentalMode, ProductPeriod } from '@/lib/schemas/product'
import type { ProjectPriceTotals } from '@/lib/utils/project/calculations'
import { formatPrice, annualToMonthly } from '@/lib/utils/product-helpers'
import { getStatusIcon } from '@/lib/utils/project/status'
import { LocationPriceDisplay } from './location-price-display'
import { ProjectSurfaceManager } from './project-surface-manager'

interface ProjectOverviewTabProps {
  project: Project
  pricingMode: PurchaseRentalMode
  pricingPeriod: ProductPeriod
  totalPrices: ProjectPriceTotals
  onPricingModeChange: (mode: PurchaseRentalMode) => void
  onPricingPeriodChange: (period: ProductPeriod) => void
  onEditProject: () => void
  onRefreshProject?: () => void
}

/**
 * Overview tab content for a project detail view, displaying pricing mode selector, key metrics, and project summary.
 *
 * @param props - The component props containing project data, pricing state, and action handlers.
 * @returns The rendered overview tab with mode selector, metrics cards, and project summary sections.
 */
export function ProjectOverviewTab({
  project,
  pricingMode,
  pricingPeriod,
  totalPrices,
  onPricingModeChange,
  onPricingPeriodChange,
  onEditProject,
  onRefreshProject,
}: ProjectOverviewTabProps) {
  const currentPrice =
    pricingMode === 'achat'
      ? totalPrices.achat
      : pricingPeriod === '1an'
        ? totalPrices.location1an
        : pricingPeriod === '2ans'
          ? totalPrices.location2ans
          : totalPrices.location3ans

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Mode :</span>
          <div className="flex gap-2">
            <button
              onClick={() => onPricingModeChange('achat')}
              className={`h-10 px-4 text-sm rounded-xl flex items-center justify-center gap-2 transition-all font-medium ${
                pricingMode === 'achat'
                  ? 'bg-[#30C1BD] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Achat
            </button>
            <button
              onClick={() => onPricingModeChange('location')}
              className={`h-10 px-4 text-sm rounded-xl flex items-center justify-center gap-2 transition-all font-medium ${
                pricingMode === 'location'
                  ? 'bg-[#30C1BD] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Home className="w-4 h-4" />
              Location
            </button>
          </div>
        </div>

        {pricingMode === 'location' && (
          <>
            <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Période :
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onPricingPeriodChange('1an')}
                  className={`h-10 px-4 text-sm rounded-xl transition-all font-medium ${
                    pricingPeriod === '1an'
                      ? 'bg-[#30C1BD] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  1 an
                </button>
                <button
                  onClick={() => onPricingPeriodChange('2ans')}
                  className={`h-10 px-4 text-sm rounded-xl transition-all font-medium ${
                    pricingPeriod === '2ans'
                      ? 'bg-[#30C1BD] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  2 ans
                </button>
                <button
                  onClick={() => onPricingPeriodChange('3ans')}
                  className={`h-10 px-4 text-sm rounded-xl transition-all font-medium ${
                    pricingPeriod === '3ans'
                      ? 'bg-[#30C1BD] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  3 ans
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`grid grid-cols-1 gap-6 ${pricingMode === 'location' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
      >
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="group relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-elegant overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.02] to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
            {pricingMode === 'location' ? (
              <LocationPriceDisplay
                annualPrice={currentPrice}
                label="Prix Total"
                variant="card"
                priceClassName="text-green-900"
                secondaryClassName="text-green-600"
                labelClassName="text-green-700"
                badgeClassName="border-green-500 text-green-600 bg-green-50"
                secondaryBadgeClassName="border-green-300 text-green-500 bg-green-50"
              />
            ) : (
              <>
                <p className="text-3xl font-bold text-green-900 mb-2">
                  {formatPrice(currentPrice)}
                </p>
                <p className="text-sm text-green-700 font-medium">Prix Total</p>
              </>
            )}
            {project.totalSurface && project.totalSurface > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs text-green-600 mb-1">Prix moyen/m²</p>
                {pricingMode === 'location' ? (
                  <>
                    <p className="text-lg font-bold text-green-800">
                      {Math.round(
                        annualToMonthly(currentPrice) / project.totalSurface,
                      ).toLocaleString('fr-FR')}
                      €/m²
                      <span className="text-xs font-normal text-green-600 ml-1">
                        /mois
                      </span>
                    </p>
                    <p className="text-xs text-green-600">
                      {Math.round(
                        currentPrice / project.totalSurface,
                      ).toLocaleString('fr-FR')}
                      €/m² /an
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-green-800">
                    {Math.round(
                      currentPrice / project.totalSurface,
                    ).toLocaleString('fr-FR')}
                    €/m²
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {pricingMode === 'location' && (
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            className="group relative bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-elegant overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-green-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-900 mb-2">
                {project.totalImpact?.rechauffementClimatique?.toFixed(1) ||
                  '0'}{' '}
                kg
              </p>
              <p className="text-sm text-emerald-700 font-medium">
                CO₂ économisé
              </p>
              <p className="text-xs text-emerald-600 mt-1">(Location)</p>
            </div>
          </motion.div>
        )}

        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="group relative bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-elegant overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-900 mb-2">
              {project.totalSurface?.toFixed(1) || '0'} m²
            </p>
            <p className="text-sm text-orange-700 font-medium">Surface</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-[#30C1BD]/10 to-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-[#30C1BD]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Aperçu du projet
                </h2>
                <p className="text-gray-600">
                  Informations générales et métriques clés
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Statut
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl">
                      {getStatusIcon(project.status)}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {project.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Créé le
                  </label>
                  <div className="mt-1 text-lg text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {project.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Description
                  </label>
                  <div className="mt-1 text-gray-900 leading-relaxed">
                    {project.description}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {project.projectKits?.reduce(
                        (acc, pk) => acc + pk.quantite,
                        0,
                      ) || 0}
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      Unités totales
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {project.projectKits?.length || 0}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">
                      Types de kits
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="space-y-3">
              <Button
                onClick={onEditProject}
                className="w-full bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white justify-start gap-3 h-12"
              >
                <Edit3 className="w-5 h-5" />
                Modifier le projet
              </Button>
            </div>
          </div>

          <ProjectSurfaceManager
            projectId={project.id}
            currentSurface={project.totalSurface || 0}
            manualSurface={project.surfaceManual}
            isOverride={project.surfaceOverride || false}
            onUpdate={() => {
              if (onRefreshProject) {
                onRefreshProject()
              }
            }}
          />

          {project.totalSurface && project.totalSurface > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Aperçu financier
              </h3>
              <div className="space-y-3">
                {pricingMode === 'location' ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Prix moyen/m²</span>
                      <span className="font-semibold text-gray-900">
                        {(
                          annualToMonthly(currentPrice) / project.totalSurface
                        ).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        €/m²
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          /mois
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Prix annuel/m²</span>
                      <span>
                        {(currentPrice / project.totalSurface).toLocaleString(
                          'fr-FR',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                        €/m² /an
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Prix moyen/m²</span>
                    <span className="font-semibold text-gray-900">
                      {(currentPrice / project.totalSurface).toLocaleString(
                        'fr-FR',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                      €/m²
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {pricingMode === 'achat'
                    ? 'Mode Achat'
                    : `Location ${pricingPeriod === '1an' ? '1 an' : pricingPeriod === '2ans' ? '2 ans' : '3 ans'}`}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
