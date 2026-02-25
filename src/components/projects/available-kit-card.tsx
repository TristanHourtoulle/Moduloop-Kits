'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, Minus, Eye, EyeOff, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { calculateKitImpact, calculateKitPrice } from '@/lib/utils/kit/calculations'
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  formatPrice as formatPriceHelper,
  annualToMonthly,
} from '@/lib/utils/product-helpers'
import { EnvironmentalImpactGrid } from './shared/environmental-impact-grid'
import type { Kit, KitProduct } from '@/lib/types/project'
import type { PurchaseRentalMode } from '@/lib/schemas/product'

export interface AvailableKit extends Kit {
  kitProducts: KitProduct[]
}

interface AvailableKitCardProps {
  kit: AvailableKit
  selectedMode: PurchaseRentalMode
  selectedQuantity: number
  isExpanded: boolean
  onQuantityChange: (kitId: string, change: number) => void
  onToggleExpand: (kitId: string | null) => void
}

/**
 * Renders a single available kit card in the catalog section with pricing,
 * environmental impact preview, quantity controls, and expandable product details.
 * @param props - Kit data, display mode, expansion state, and interaction callbacks
 * @returns An animated card displaying kit information with action controls
 */
export function AvailableKitCard({
  kit,
  selectedMode,
  selectedQuantity,
  isExpanded,
  onQuantityChange,
  onToggleExpand,
}: AvailableKitCardProps) {
  const kitImpact = calculateKitImpact(kit.kitProducts, selectedMode)
  const kitPrice = calculateKitPrice(
    kit.kitProducts,
    selectedMode,
    selectedMode === 'location' ? '3ans' : '1an',
  )

  return (
    <motion.div
      key={kit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-lg"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-1 items-start space-x-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#30C1BD]/10 to-blue-100">
              <Package className="h-8 w-8 text-[#30C1BD]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 truncate text-lg font-bold text-gray-900">{kit.nom}</h3>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {kit.style}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-xs text-blue-800">
                  {kit.kitProducts?.length || 0} produit
                  {(kit.kitProducts?.length || 0) > 1 ? 's' : ''}
                </Badge>
              </div>
              {kit.description && (
                <p className="line-clamp-2 text-sm text-gray-600">{kit.description}</p>
              )}
            </div>
          </div>

          <div className="ml-4 flex-shrink-0 text-right">
            {selectedMode === 'location' ? (
              <>
                <div className="mb-0.5 flex items-baseline justify-end gap-1">
                  <span className="text-2xl font-bold text-[#30C1BD]">
                    {formatPriceHelper(annualToMonthly(kitPrice))}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-[#30C1BD] bg-[#30C1BD]/10 px-1 py-0 text-[10px] text-[#30C1BD]"
                  >
                    /mois
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">
                  {formatPriceHelper(kitPrice)} /an (base 3 ans)
                </div>
              </>
            ) : (
              <>
                <div className="mb-1 text-2xl font-bold text-[#30C1BD]">
                  {formatPriceHelper(kitPrice)}
                </div>
                <div className="text-xs text-gray-500">{"Prix d'achat"}</div>
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <EnvironmentalImpactGrid
            impact={kitImpact}
            variant="compact"
            showSurface={kitImpact.surface > 0}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleExpand(isExpanded ? null : kit.id)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? (
              <>
                <EyeOff className="h-3 w-3" />
                Masquer
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" />
                Voir les détails
              </>
            )}
          </Button>

          {selectedQuantity > 0 ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onQuantityChange(kit.id, -1)}
                className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2ch] text-center text-lg font-bold text-green-700">
                {selectedQuantity}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onQuantityChange(kit.id, 1)}
                className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => onQuantityChange(kit.id, 1)}
              className="bg-[#30C1BD] text-white hover:bg-[#30C1BD]/90"
            >
              <Plus className="mr-1 h-3 w-3" /> Ajouter
            </Button>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Détail des produits</h4>
                {kit.kitProducts.map((kitProduct) => {
                  const product = kitProduct.product
                  if (!product) return null

                  const productPricing = getProductPricing(product, selectedMode, '1an')
                  const productImpact = getProductEnvironmentalImpact(product, selectedMode)

                  return (
                    <div
                      key={kitProduct.id}
                      className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3"
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.nom}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{product.nom}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {product.reference}
                          </Badge>
                          <span className="text-xs text-gray-500">× {kitProduct.quantite}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        {selectedMode === 'location' ? (
                          <>
                            <div className="flex items-baseline justify-end gap-1">
                              <span className="text-sm font-bold text-[#30C1BD]">
                                {formatPriceHelper(
                                  annualToMonthly(
                                    (productPricing.prixVente || 0) * kitProduct.quantite,
                                  ),
                                )}
                              </span>
                              <span className="text-[10px] font-normal text-gray-500">/mois</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatPriceHelper(
                                (productPricing.prixVente || 0) * kitProduct.quantite,
                              )}{' '}
                              /an
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatPriceHelper(
                                (productPricing.prixVente || 0) * kitProduct.quantite,
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatPriceHelper(productPricing.prixVente || 0)}
                              /u
                            </div>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: '#FE9E58' }}
                          ></div>
                          <span className="truncate text-gray-600">
                            {(
                              (productImpact.rechauffementClimatique || 0) * kitProduct.quantite
                            ).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: '#FE5858' }}
                          ></div>
                          <span className="truncate text-gray-600">
                            {(
                              (productImpact.epuisementRessources || 0) * kitProduct.quantite
                            ).toFixed(0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: '#55D789' }}
                          ></div>
                          <span className="truncate text-gray-600">
                            {((productImpact.acidification || 0) * kitProduct.quantite).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                          <span className="truncate text-gray-600">
                            {((product.surfaceM2 || 0) * kitProduct.quantite).toFixed(1)}
                            m²
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {!kit.kitProducts?.length && (
                <div className="py-4 text-center text-gray-500">
                  <Info className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p>Aucun produit configuré dans ce kit</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
