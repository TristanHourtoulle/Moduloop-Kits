'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Euro, Leaf, Target, ShoppingCart, Home, FileText, Edit3 } from 'lucide-react'
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
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Mode :</span>
          <div className="flex gap-2">
            <button
              onClick={() => onPricingModeChange('achat')}
              className={`flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all ${
                pricingMode === 'achat'
                  ? 'bg-[#30C1BD] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Achat
            </button>
            <button
              onClick={() => onPricingModeChange('location')}
              className={`flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all ${
                pricingMode === 'location'
                  ? 'bg-[#30C1BD] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Home className="h-4 w-4" />
              Location
            </button>
          </div>
        </div>

        {pricingMode === 'location' && (
          <>
            <div className="hidden h-8 w-px bg-gray-300 sm:block"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Période :</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onPricingPeriodChange('1an')}
                  className={`h-10 rounded-xl px-4 text-sm font-medium transition-all ${
                    pricingPeriod === '1an'
                      ? 'bg-[#30C1BD] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  1 an
                </button>
                <button
                  onClick={() => onPricingPeriodChange('2ans')}
                  className={`h-10 rounded-xl px-4 text-sm font-medium transition-all ${
                    pricingPeriod === '2ans'
                      ? 'bg-[#30C1BD] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  2 ans
                </button>
                <button
                  onClick={() => onPricingPeriodChange('3ans')}
                  className={`h-10 rounded-xl px-4 text-sm font-medium transition-all ${
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
          className="group hover:shadow-elegant relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.02] to-emerald-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 transition-transform duration-300 group-hover:scale-110">
              <Euro className="h-6 w-6 text-green-600" />
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
                <p className="mb-2 text-3xl font-bold text-green-900">
                  {formatPrice(currentPrice)}
                </p>
                <p className="text-sm font-medium text-green-700">Prix Total</p>
              </>
            )}
            {project.totalSurface && project.totalSurface > 0 && (
              <div className="mt-3 border-t border-green-200 pt-3">
                <p className="mb-1 text-xs text-green-600">Prix moyen/m²</p>
                {pricingMode === 'location' ? (
                  <>
                    <p className="text-lg font-bold text-green-800">
                      {(annualToMonthly(currentPrice) / project.totalSurface).toLocaleString(
                        'fr-FR',
                        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                      )}
                      €/m²
                      <span className="ml-1 text-xs font-normal text-green-600">/mois</span>
                    </p>
                    <p className="text-xs text-green-600">
                      {(currentPrice / project.totalSurface).toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      €/m² /an
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-green-800">
                    {(currentPrice / project.totalSurface).toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
            className="group hover:shadow-elegant relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 text-center transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-green-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative z-10">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 transition-transform duration-300 group-hover:scale-110">
                <Leaf className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="mb-2 text-3xl font-bold text-emerald-900">
                {project.totalImpact?.rechauffementClimatique?.toFixed(1) || '0'} kg
              </p>
              <p className="text-sm font-medium text-emerald-700">CO₂ économisé</p>
              <p className="mt-1 text-xs text-emerald-600">(Location)</p>
            </div>
          </motion.div>
        )}

        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="group hover:shadow-elegant relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 text-center transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-amber-500/[0.02] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 transition-transform duration-300 group-hover:scale-110">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <p className="mb-2 text-3xl font-bold text-orange-900">
              {project.totalSurface?.toFixed(1) || '0'} m²
            </p>
            <p className="text-sm font-medium text-orange-700">Surface</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-2"
        >
          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-[#30C1BD]/10 to-blue-100 p-3">
                <FileText className="h-6 w-6 text-[#30C1BD]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Aperçu du projet</h2>
                <p className="text-gray-600">Informations générales et métriques clés</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                    Statut
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon(project.status)}</span>
                    <span className="text-lg font-semibold text-gray-900">{project.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium tracking-wide text-gray-500 uppercase">
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
                  <label className="text-sm font-medium tracking-wide text-gray-500 uppercase">
                    Description
                  </label>
                  <div className="mt-1 leading-relaxed text-gray-900">{project.description}</div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 text-center">
                    <div className="mb-1 text-2xl font-bold text-green-900">
                      {project.projectKits?.reduce((acc, pk) => acc + pk.quantite, 0) || 0}
                    </div>
                    <div className="text-sm font-medium text-green-700">Unités totales</div>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 text-center">
                    <div className="mb-1 text-2xl font-bold text-blue-900">
                      {project.projectKits?.length || 0}
                    </div>
                    <div className="text-sm font-medium text-blue-700">Types de kits</div>
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Actions rapides</h3>
            <div className="space-y-3">
              <Button
                onClick={onEditProject}
                className="h-12 w-full justify-start gap-3 bg-[#30C1BD] text-white hover:bg-[#30C1BD]/90"
              >
                <Edit3 className="h-5 w-5" />
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
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Aperçu financier</h3>
              <div className="space-y-3">
                {pricingMode === 'location' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Prix moyen/m²</span>
                      <span className="font-semibold text-gray-900">
                        {(annualToMonthly(currentPrice) / project.totalSurface).toLocaleString(
                          'fr-FR',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                        €/m²
                        <span className="ml-1 text-xs font-normal text-gray-500">/mois</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Prix annuel/m²</span>
                      <span>
                        {(currentPrice / project.totalSurface).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        €/m² /an
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prix moyen/m²</span>
                    <span className="font-semibold text-gray-900">
                      {(currentPrice / project.totalSurface).toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
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
