'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { calculateKitImpact, calculateKitPrice } from '@/lib/utils/kit/calculations';
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  formatPrice as formatPriceHelper,
  annualToMonthly,
} from '@/lib/utils/product-helpers';
import { EnvironmentalImpactGrid } from './shared/environmental-impact-grid';
import type { Kit, KitProduct } from '@/lib/types/project';
import type { PurchaseRentalMode } from '@/lib/schemas/product';

export interface AvailableKit extends Kit {
  kitProducts: KitProduct[];
}

interface AvailableKitCardProps {
  kit: AvailableKit;
  selectedMode: PurchaseRentalMode;
  selectedQuantity: number;
  isExpanded: boolean;
  onQuantityChange: (kitId: string, change: number) => void;
  onToggleExpand: (kitId: string | null) => void;
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
  const kitImpact = calculateKitImpact(kit.kitProducts, selectedMode);
  const kitPrice = calculateKitPrice(
    kit.kitProducts,
    selectedMode,
    selectedMode === 'location' ? '3ans' : '1an'
  );

  return (
    <motion.div
      key={kit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden'
    >
      <div className='p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-start space-x-4 flex-1'>
            <div className='w-16 h-16 bg-gradient-to-br from-[#30C1BD]/10 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0'>
              <Package className='w-8 h-8 text-[#30C1BD]' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-lg font-bold text-gray-900 mb-1 truncate'>
                {kit.nom}
              </h3>
              <div className='flex flex-wrap items-center gap-2 mb-2'>
                <Badge variant='outline' className='text-xs'>
                  {kit.style}
                </Badge>
                <Badge
                  variant='secondary'
                  className='text-xs bg-blue-100 text-blue-800'
                >
                  {kit.kitProducts?.length || 0} produit
                  {(kit.kitProducts?.length || 0) > 1 ? 's' : ''}
                </Badge>
              </div>
              {kit.description && (
                <p className='text-sm text-gray-600 line-clamp-2'>
                  {kit.description}
                </p>
              )}
            </div>
          </div>

          <div className='text-right flex-shrink-0 ml-4'>
            {selectedMode === 'location' ? (
              <>
                <div className='flex items-baseline justify-end gap-1 mb-0.5'>
                  <span className='text-2xl font-bold text-[#30C1BD]'>
                    {formatPriceHelper(annualToMonthly(kitPrice))}
                  </span>
                  <Badge
                    variant='outline'
                    className='text-[10px] px-1 py-0 border-[#30C1BD] text-[#30C1BD] bg-[#30C1BD]/10'
                  >
                    /mois
                  </Badge>
                </div>
                <div className='text-xs text-gray-400'>
                  {formatPriceHelper(kitPrice)} /an (base 3 ans)
                </div>
              </>
            ) : (
              <>
                <div className='text-2xl font-bold text-[#30C1BD] mb-1'>
                  {formatPriceHelper(kitPrice)}
                </div>
                <div className='text-xs text-gray-500'>
                  {"Prix d'achat"}
                </div>
              </>
            )}
          </div>
        </div>

        <div className='mb-4'>
          <EnvironmentalImpactGrid
            impact={kitImpact}
            variant='compact'
            showSurface={kitImpact.surface > 0}
          />
        </div>

        <div className='flex items-center justify-between gap-3'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onToggleExpand(isExpanded ? null : kit.id)}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-800'
          >
            {isExpanded ? (
              <>
                <EyeOff className='w-3 h-3' />
                Masquer
              </>
            ) : (
              <>
                <Eye className='w-3 h-3' />
                Voir les détails
              </>
            )}
          </Button>

          {selectedQuantity > 0 ? (
            <div className='flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2'>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onQuantityChange(kit.id, -1)}
                className='h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
              >
                <Minus className='w-4 h-4' />
              </Button>
              <span className='text-lg font-bold text-green-700 min-w-[2ch] text-center'>
                {selectedQuantity}
              </span>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onQuantityChange(kit.id, 1)}
                className='h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50'
              >
                <Plus className='w-4 h-4' />
              </Button>
            </div>
          ) : (
            <Button
              size='sm'
              onClick={() => onQuantityChange(kit.id, 1)}
              className='bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white'
            >
              <Plus className='w-3 h-3 mr-1' /> Ajouter
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
              className='overflow-hidden'
            >
              <Separator className='my-4' />
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold text-gray-700 mb-3'>
                  Détail des produits
                </h4>
                {kit.kitProducts.map((kitProduct) => {
                  const product = kitProduct.product;
                  if (!product) return null;

                  const productPricing = getProductPricing(
                    product,
                    selectedMode,
                    '1an'
                  );
                  const productImpact = getProductEnvironmentalImpact(
                    product,
                    selectedMode
                  );

                  return (
                    <div
                      key={kitProduct.id}
                      className='flex items-center gap-4 bg-gray-50 rounded-lg p-3 border border-gray-100'
                    >
                      <div className='w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200'>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.nom}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <Package className='w-6 h-6 text-gray-400' />
                          </div>
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {product.nom}
                        </p>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge variant='outline' className='text-[10px]'>
                            {product.reference}
                          </Badge>
                          <span className='text-xs text-gray-500'>
                            × {kitProduct.quantite}
                          </span>
                        </div>
                      </div>

                      <div className='text-right flex-shrink-0'>
                        {selectedMode === 'location' ? (
                          <>
                            <div className='flex items-baseline gap-1 justify-end'>
                              <span className='text-sm font-bold text-[#30C1BD]'>
                                {formatPriceHelper(
                                  annualToMonthly(
                                    (productPricing.prixVente || 0) *
                                      kitProduct.quantite
                                  )
                                )}
                              </span>
                              <span className='text-[10px] font-normal text-gray-500'>
                                /mois
                              </span>
                            </div>
                            <div className='text-xs text-gray-400'>
                              {formatPriceHelper(
                                (productPricing.prixVente || 0) *
                                  kitProduct.quantite
                              )}{' '}
                              /an
                            </div>
                          </>
                        ) : (
                          <>
                            <div className='text-sm font-semibold text-gray-900'>
                              {formatPriceHelper(
                                (productPricing.prixVente || 0) *
                                  kitProduct.quantite
                              )}
                            </div>
                            <div className='text-xs text-gray-500'>
                              {formatPriceHelper(
                                productPricing.prixVente || 0
                              )}
                              /u
                            </div>
                          </>
                        )}
                      </div>

                      <div className='grid grid-cols-4 gap-1 text-xs'>
                        <div className='flex items-center gap-1'>
                          <div
                            className='w-1.5 h-1.5 rounded-full'
                            style={{ backgroundColor: '#FE9E58' }}
                          ></div>
                          <span className='text-gray-600 truncate'>
                            {(
                              (productImpact.rechauffementClimatique || 0) *
                              kitProduct.quantite
                            ).toFixed(1)}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <div
                            className='w-1.5 h-1.5 rounded-full'
                            style={{ backgroundColor: '#FE5858' }}
                          ></div>
                          <span className='text-gray-600 truncate'>
                            {(
                              (productImpact.epuisementRessources || 0) *
                              kitProduct.quantite
                            ).toFixed(0)}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <div
                            className='w-1.5 h-1.5 rounded-full'
                            style={{ backgroundColor: '#55D789' }}
                          ></div>
                          <span className='text-gray-600 truncate'>
                            {(
                              (productImpact.acidification || 0) *
                              kitProduct.quantite
                            ).toFixed(1)}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <div className='w-1.5 h-1.5 bg-teal-500 rounded-full'></div>
                          <span className='text-gray-600 truncate'>
                            {(
                              (product.surfaceM2 || 0) * kitProduct.quantite
                            ).toFixed(1)}
                            m²
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!kit.kitProducts?.length && (
                <div className='text-center py-4 text-gray-500'>
                  <Info className='w-8 h-8 mx-auto mb-2 text-gray-400' />
                  <p>Aucun produit configuré dans ce kit</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
