'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Edit3,
  Trash2,
  ShoppingCart,
  Home,
  Target,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { ProjectKit } from '@/lib/types/project';
import { type PurchaseRentalMode } from '@/lib/schemas/product';
import {
  calculateKitImpact,
  calculateKitPrice,
} from '@/lib/utils/kit/calculations';
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  formatPrice as formatPriceHelper,
  annualToMonthly,
  ceilPrice,
} from '@/lib/utils/product-helpers';
import { QuantityEditor } from './shared/quantity-editor';
import { EnvironmentalImpactGrid } from './shared/environmental-impact-grid';

interface ProjectKitCardProps {
  projectKit: ProjectKit;
  index: number;
  selectedMode: PurchaseRentalMode;
  isExpanded: boolean;
  editingQuantity: string | null;
  tempQuantity: number;
  onToggleExpand: (projectKitId: string | null) => void;
  onStartEditing: (projectKitId: string, currentQuantity: number) => void;
  onSaveQuantity: (projectKitId: string) => void;
  onCancelEditing: () => void;
  onTempQuantityChange: (value: number) => void;
  onUpdateQuantity?: (projectKitId: string, newQuantity: number) => Promise<void>;
  onRemoveKit?: (projectKitId: string) => Promise<void>;
}

/**
 * Renders a single project kit card displaying pricing, environmental impact, and product details.
 * @param props - Kit data, expansion state, editing state, and action handlers
 * @returns A fully interactive card for a kit already added to a project
 */
export function ProjectKitCard({
  projectKit,
  index,
  selectedMode,
  isExpanded,
  editingQuantity,
  tempQuantity,
  onToggleExpand,
  onStartEditing,
  onSaveQuantity,
  onCancelEditing,
  onTempQuantityChange,
  onUpdateQuantity,
  onRemoveKit,
}: ProjectKitCardProps) {
  const kit = projectKit.kit;

  if (!kit || !kit.kitProducts) {
    return (
      <Card className='pt-6 border-red-200 bg-red-50'>
        <CardContent className='p-6'>
          <div className='text-center text-red-600'>
            <Package className='w-8 h-8 mx-auto mb-2' />
            <p>Kit non disponible ou sans produits</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const kitImpact = calculateKitImpact(kit.kitProducts, selectedMode);
  const kitPrice = calculateKitPrice(kit.kitProducts, selectedMode);
  const totalPrice = kitPrice * projectKit.quantite;
  const totalImpact = {
    rechauffementClimatique:
      kitImpact.rechauffementClimatique * projectKit.quantite,
    epuisementRessources:
      kitImpact.epuisementRessources * projectKit.quantite,
    acidification: kitImpact.acidification * projectKit.quantite,
    eutrophisation: kitImpact.eutrophisation * projectKit.quantite,
    surface: (kit.surfaceM2 || 0) * projectKit.quantite,
  };

  return (
    <motion.div
      key={projectKit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className='pt-6 bg-gradient-to-br from-white to-gray-50/50 border-gray-200 hover:border-[#30C1BD]/30 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group'>
        <CardHeader className='pb-4'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#30C1BD]/[0.02] to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
          <div className='flex items-center justify-between relative z-10'>
            <div className='flex items-center space-x-4 flex-1'>
              <div className='w-14 h-14 bg-gradient-to-br from-[#30C1BD]/10 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm'>
                <Package className='w-7 h-7 text-[#30C1BD]' />
              </div>
              <div className='flex-1'>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  {kit.nom}
                </h3>
                <div className='flex flex-wrap items-center gap-3'>
                  <Badge
                    variant='outline'
                    className='text-xs border-gray-300'
                  >
                    {kit.style}
                  </Badge>

                  {editingQuantity === projectKit.id ? (
                    <QuantityEditor
                      value={tempQuantity}
                      onChange={onTempQuantityChange}
                      onSave={() => onSaveQuantity(projectKit.id)}
                      onCancel={onCancelEditing}
                    />
                  ) : (
                    <div className='flex items-center space-x-2'>
                      <Badge className='bg-[#30C1BD]/10 text-[#30C1BD] hover:bg-[#30C1BD]/20'>
                        <ShoppingCart className='w-3 h-3 mr-1' />
                        {projectKit.quantite}{' '}
                        {projectKit.quantite > 1 ? 'kits' : 'kit'}
                      </Badge>
                      {onUpdateQuantity && (
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-6 w-6 p-0 text-gray-400 hover:text-[#30C1BD]'
                          onClick={() =>
                            onStartEditing(
                              projectKit.id,
                              projectKit.quantite
                            )
                          }
                          title='Modifier la quantit&#233;'
                        >
                          <Edit3 className='w-3 h-3' />
                        </Button>
                      )}
                      {onRemoveKit && (
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-6 w-6 p-0 text-gray-400 hover:text-red-600'
                          onClick={() => onRemoveKit(projectKit.id)}
                          title='Retirer ce kit du projet'
                        >
                          <Trash2 className='w-3 h-3' />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {kit.description && (
                  <p className='text-sm text-gray-600 mt-2'>
                    {kit.description}
                  </p>
                )}
              </div>
            </div>

            <div className='text-right'>
              {selectedMode === 'achat' ? (
                <>
                  <div className='text-3xl font-bold text-[#30C1BD] mb-1'>
                    {formatPriceHelper(totalPrice)}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {formatPriceHelper(kitPrice)} par kit
                  </div>
                  {kit.surfaceM2 && kit.surfaceM2 > 0 && (
                    <div className='text-xs text-gray-500 mt-1'>
                      {ceilPrice(kitPrice / kit.surfaceM2).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€/m²
                      <span className='text-gray-400 ml-1'>
                        ({(kit.surfaceM2 * projectKit.quantite).toFixed(1)} m² total)
                      </span>
                    </div>
                  )}
                  <div className='text-xs text-gray-500 mt-1'>
                    Achat
                  </div>
                </>
              ) : (
                <>
                  <div className='text-sm text-gray-600 mb-2'>
                    Prix location par kit
                  </div>
                  <div className='space-y-2'>
                    {(() => {
                      const price1an = kit.kitProducts?.reduce((acc, kp) => {
                        if (!kp.product) return acc;
                        const pricing = getProductPricing(kp.product, 'location', '1an');
                        return acc + (pricing.prixVente || 0) * kp.quantite;
                      }, 0) || 0;
                      const price2ans = kit.kitProducts?.reduce((acc, kp) => {
                        if (!kp.product) return acc;
                        const pricing = getProductPricing(kp.product, 'location', '2ans');
                        return acc + (pricing.prixVente || 0) * kp.quantite;
                      }, 0) || 0;
                      const price3ans = kit.kitProducts?.reduce((acc, kp) => {
                        if (!kp.product) return acc;
                        const pricing = getProductPricing(kp.product, 'location', '3ans');
                        return acc + (pricing.prixVente || 0) * kp.quantite;
                      }, 0) || 0;

                      return (
                        <>
                          {[
                            { label: '1 an', price: price1an },
                            { label: '2 ans', price: price2ans },
                            { label: '3 ans', price: price3ans },
                          ].map(({ label, price }) => (
                            <div key={label} className='flex justify-end items-start gap-2'>
                              <span className='text-xs text-gray-500 mt-1'>{label}:</span>
                              <div className='text-right'>
                                <div className='flex items-baseline gap-1'>
                                  <span className='text-lg font-bold text-[#30C1BD]'>
                                    {formatPriceHelper(annualToMonthly(price))}
                                  </span>
                                  <Badge variant='outline' className='text-[10px] px-1 py-0 border-[#30C1BD] text-[#30C1BD] bg-[#30C1BD]/10'>
                                    /mois
                                  </Badge>
                                </div>
                                <div className='text-xs text-gray-400'>
                                  {formatPriceHelper(price)} /an
                                </div>
                              </div>
                            </div>
                          ))}
                          {kit.surfaceM2 && kit.surfaceM2 > 0 && (() => {
                            const annualPerM2 = ceilPrice(price3ans / kit.surfaceM2);
                            const monthlyPerM2 = ceilPrice(annualPerM2 / 12);
                            return (
                              <div className='text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200'>
                                <div>
                                  Prix/m² : {monthlyPerM2.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€/mois
                                  <span className='text-gray-400 ml-1'>(base 3 ans)</span>
                                </div>
                                <div className='text-gray-400'>
                                  {annualPerM2.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€/an
                                </div>
                                <div className='text-gray-400 mt-1'>
                                  {(kit.surfaceM2 * projectKit.quantite).toFixed(1)} m² total
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4 relative z-10'>
          <div className='grid grid-cols-1 gap-3'>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              className='text-center p-4 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'
            >
              <div className='w-8 h-8 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2'>
                <Target className='w-4 h-4 text-teal-600' />
              </div>
              <div className='text-sm font-bold text-teal-900 mb-1'>
                {totalImpact.surface.toFixed(1)}
              </div>
              <div className='text-xs text-teal-700'>m² - Surface totale</div>
            </motion.div>
          </div>

          {selectedMode === 'location' && (
            <>
              <div className='text-center mb-3'>
                <p className='text-sm font-semibold text-emerald-700'>
                  Impact environnemental économisé
                </p>
              </div>
              <EnvironmentalImpactGrid impact={totalImpact} variant='card' />
            </>
          )}

          <div className='flex justify-center pt-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() =>
                onToggleExpand(isExpanded ? null : projectKit.id)
              }
              className='text-[#30C1BD] hover:text-[#30C1BD]/80'
            >
              {isExpanded ? (
                <>
                  <EyeOff className='w-4 h-4 mr-2' />
                  Masquer les détails
                </>
              ) : (
                <>
                  <Eye className='w-4 h-4 mr-2' />
                  Voir les produits
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Separator className='my-4' />
                <div className='space-y-3'>
                  <h4 className='font-semibold text-gray-900'>
                    Produits du kit
                  </h4>
                  {kit.kitProducts.map((kitProduct) => {
                    const product = kitProduct.product;
                    if (!product) return null;

                    const productImpact =
                      getProductEnvironmentalImpact(
                        product,
                        selectedMode
                      );

                    const pricingAchat = getProductPricing(product, 'achat', '1an');
                    const pricingLocation1An = getProductPricing(product, 'location', '1an');
                    const pricingLocation2Ans = getProductPricing(product, 'location', '2ans');
                    const pricingLocation3Ans = getProductPricing(product, 'location', '3ans');

                    return (
                      <div
                        key={kitProduct.id}
                        className='bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200'
                      >
                        <div className='flex items-start gap-4 mb-4'>
                          <div className='w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200'>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.nom}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='w-full h-full flex items-center justify-center'>
                                <Package className='w-10 h-10 text-gray-400' />
                              </div>
                            )}
                          </div>

                          <div className='flex-1 min-w-0'>
                            <h5 className='font-semibold text-gray-900 mb-2 truncate'>
                              {product.nom}
                            </h5>
                            <div className='flex flex-wrap items-center gap-2'>
                              <Badge
                                variant='outline'
                                className='text-xs border-gray-300'
                              >
                                {product.reference}
                              </Badge>
                              <Badge
                                variant='secondary'
                                className='text-xs bg-[#30C1BD]/10 text-[#30C1BD] border border-[#30C1BD]/20'
                              >
                                {kitProduct.quantite} unité{kitProduct.quantite > 1 ? 's' : ''}
                              </Badge>
                              {product.surfaceM2 && product.surfaceM2 > 0 && (
                                <span className='text-xs text-gray-500'>
                                  {product.surfaceM2}m² /unité
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4'>
                          <div className='bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 border border-primary/20'>
                            <div className='flex items-center gap-2 mb-3'>
                              <div className='w-6 h-6 bg-white rounded-md flex items-center justify-center'>
                                <ShoppingCart className='h-3.5 w-3.5 text-primary' />
                              </div>
                              <span className='font-semibold text-sm text-primary'>Achat</span>
                            </div>

                            {pricingAchat.prixVente && pricingAchat.prixVente > 0 ? (
                              <div>
                                <div className='text-xl font-bold text-primary mb-1'>
                                  {formatPriceHelper(pricingAchat.prixVente * kitProduct.quantite)}
                                </div>
                                <div className='text-xs text-gray-600'>
                                  {formatPriceHelper(pricingAchat.prixVente)} × {kitProduct.quantite}
                                </div>
                              </div>
                            ) : (
                              <div className='text-sm italic text-orange-600'>
                                Non renseigné
                              </div>
                            )}
                          </div>

                          <div className='bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50'>
                            <div className='flex items-center gap-2 mb-3'>
                              <div className='w-6 h-6 bg-white rounded-md flex items-center justify-center'>
                                <Home className='h-3.5 w-3.5 text-emerald-700' />
                              </div>
                              <span className='font-semibold text-sm text-emerald-800'>Location</span>
                            </div>

                            <div className='grid grid-cols-3 gap-2 text-xs'>
                              {[
                                { label: '1 an', pricing: pricingLocation1An },
                                { label: '2 ans', pricing: pricingLocation2Ans },
                                { label: '3 ans', pricing: pricingLocation3Ans },
                              ].map(({ label, pricing }) => (
                                <div key={label}>
                                  <div className='text-gray-600 mb-1'>{label}</div>
                                  {pricing.prixVente && pricing.prixVente > 0 ? (
                                    <>
                                      <div className='font-bold text-emerald-900'>
                                        {formatPriceHelper(annualToMonthly(pricing.prixVente * kitProduct.quantite))}
                                        <span className='text-[10px] font-normal text-emerald-600'>/mois</span>
                                      </div>
                                      <div className='text-[10px] text-gray-400'>
                                        {formatPriceHelper(pricing.prixVente * kitProduct.quantite)} /an
                                      </div>
                                    </>
                                  ) : (
                                    <div className='italic text-orange-600'>N/R</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {selectedMode === 'location' && (
                          <div className='bg-gray-50 rounded-lg p-3 border border-gray-100'>
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs'>
                              <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full flex-shrink-0' style={{ backgroundColor: '#FE9E58' }}></div>
                                <span className='text-gray-700 truncate'>
                                  {(
                                    (productImpact.rechauffementClimatique || 0) * kitProduct.quantite
                                  ).toFixed(1)}{' '}
                                  <span className='text-gray-500'>kg CO₂</span>
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full flex-shrink-0' style={{ backgroundColor: '#FE5858' }}></div>
                                <span className='text-gray-700 truncate'>
                                  {(
                                    (productImpact.epuisementRessources || 0) * kitProduct.quantite
                                  ).toFixed(0)}{' '}
                                  <span className='text-gray-500'>MJ</span>
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full flex-shrink-0' style={{ backgroundColor: '#55D789' }}></div>
                                <span className='text-gray-700 truncate'>
                                  {(
                                    (productImpact.acidification || 0) * kitProduct.quantite
                                  ).toFixed(1)}{' '}
                                  <span className='text-gray-500'>MOL H+</span>
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full flex-shrink-0' style={{ backgroundColor: '#55D789' }}></div>
                                <span className='text-gray-700 truncate'>
                                  {(
                                    (productImpact.eutrophisation || 0) * kitProduct.quantite
                                  ).toFixed(1)}{' '}
                                  <span className='text-gray-500'>kg P eq</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
