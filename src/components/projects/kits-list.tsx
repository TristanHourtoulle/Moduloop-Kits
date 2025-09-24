'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  ShoppingCart,
  Leaf,
  Euro,
  Target,
  Users,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  Minus,
  Info,
  Home,
} from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProjectKit, Kit, KitProduct } from '@/lib/types/project';
import { type PurchaseRentalMode } from '@/lib/schemas/product';
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  formatPrice as formatPriceHelper,
} from '@/lib/utils/product-helpers';

interface KitsListProps {
  projectKits: ProjectKit[];
  onUpdateQuantity?: (
    projectKitId: string,
    newQuantity: number
  ) => Promise<void>;
  onRemoveKit?: (projectKitId: string) => Promise<void>;
  mode?: PurchaseRentalMode;
}

const getKitImpact = (kitProducts: KitProduct[], mode: PurchaseRentalMode) => {
  return kitProducts.reduce(
    (acc, kitProduct) => {
      const product = kitProduct.product;
      if (!product) return acc;

      const environmentalImpact = getProductEnvironmentalImpact(product, mode);

      return {
        rechauffementClimatique:
          acc.rechauffementClimatique +
          (environmentalImpact.rechauffementClimatique || 0) *
            kitProduct.quantite,
        epuisementRessources:
          acc.epuisementRessources +
          (environmentalImpact.epuisementRessources || 0) * kitProduct.quantite,
        acidification:
          acc.acidification +
          (environmentalImpact.acidification || 0) * kitProduct.quantite,
        eutrophisation:
          acc.eutrophisation +
          (environmentalImpact.eutrophisation || 0) * kitProduct.quantite,
        surface: acc.surface + (product.surfaceM2 || 0) * kitProduct.quantite,
      };
    },
    {
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
      surface: 0,
    }
  );
};

const getKitPrice = (kitProducts: KitProduct[], mode: PurchaseRentalMode) => {
  return kitProducts.reduce((acc, kitProduct) => {
    const product = kitProduct.product;
    if (!product) return acc;

    const pricing = getProductPricing(product, mode, '1an');
    return acc + (pricing.prixVente || 0) * kitProduct.quantite;
  }, 0);
};

export function KitsList({
  projectKits,
  onUpdateQuantity,
  onRemoveKit,
  mode = 'achat',
}: KitsListProps) {
  const [expandedKits, setExpandedKits] = useState<Set<string>>(new Set());
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(0);
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>(mode);

  const toggleKitExpansion = (kitId: string) => {
    const newExpanded = new Set(expandedKits);
    if (newExpanded.has(kitId)) {
      newExpanded.delete(kitId);
    } else {
      newExpanded.add(kitId);
    }
    setExpandedKits(newExpanded);
  };

  const startEditingQuantity = (
    projectKitId: string,
    currentQuantity: number
  ) => {
    setEditingQuantity(projectKitId);
    setTempQuantity(currentQuantity);
  };

  const cancelEditingQuantity = () => {
    setEditingQuantity(null);
    setTempQuantity(0);
  };

  const saveQuantity = async (projectKitId: string) => {
    if (onUpdateQuantity && tempQuantity > 0) {
      await onUpdateQuantity(projectKitId, tempQuantity);
      setEditingQuantity(null);
      setTempQuantity(0);
    }
  };

  const handleRemoveKit = async (projectKitId: string) => {
    if (onRemoveKit) {
      await onRemoveKit(projectKitId);
    }
  };

  if (projectKits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Package className='w-8 h-8 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Aucun kit dans ce projet
          </h3>
          <p className='text-gray-500'>
            Commencez par ajouter des kits pour voir leur impact et leurs coûts.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className='space-y-6'>
      {projectKits.map((projectKit, index) => {
        const kit = projectKit.kit;

        // Vérifier que le kit et ses produits existent
        if (!kit || !kit.kitProducts) {
          return (
            <motion.div
              key={projectKit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className='group relative bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-2xl shadow-sm overflow-hidden'>
                <CardContent className='p-6'>
                  <div className='text-center text-gray-500'>
                    <Package className='w-8 h-8 mx-auto mb-2 text-gray-400' />
                    <p>Kit non disponible ou sans produits</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        }

        const kitImpact = getKitImpact(kit.kitProducts, selectedMode);
        const kitPrice = getKitPrice(kit.kitProducts, selectedMode);
        const totalPrice = kitPrice * projectKit.quantite;
        const totalImpact = {
          rechauffementClimatique:
            kitImpact.rechauffementClimatique * projectKit.quantite,
          epuisementRessources:
            kitImpact.epuisementRessources * projectKit.quantite,
          acidification: kitImpact.acidification * projectKit.quantite,
          eutrophisation: kitImpact.eutrophisation * projectKit.quantite,
          surface: kitImpact.surface * projectKit.quantite,
        };
        const isExpanded = expandedKits.has(projectKit.id);

        return (
          <motion.div
            key={projectKit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className='pt-6 group relative bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 hover:border-[#30C1BD]/30 rounded-2xl shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 overflow-hidden'>
              <CardHeader className='pb-4 relative z-10'>
                <div className='absolute inset-0 bg-gradient-to-br from-[#30C1BD]/[0.02] to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <div className='flex items-start justify-between relative z-10'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-4 mb-3'>
                      <div className='w-12 h-12 bg-gradient-to-br from-[#30C1BD]/10 to-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm'>
                        <Package className='w-6 h-6 text-[#30C1BD]' />
                      </div>
                      <div>
                        <CardTitle className='text-xl font-bold text-gray-900'>
                          {kit.nom}
                        </CardTitle>
                        <div className='flex items-center space-x-3 mt-2'>
                          <Badge
                            variant='secondary'
                            className='text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-700'
                          >
                            {kit.style}
                          </Badge>

                          {/* Badge de quantité avec édition */}
                          {editingQuantity === projectKit.id ? (
                            <div className='flex items-center space-x-2 bg-white border rounded-md px-2 py-1'>
                              <input
                                type='number'
                                value={tempQuantity}
                                onChange={(e) =>
                                  setTempQuantity(Number(e.target.value))
                                }
                                className='w-16 text-xs border-none bg-transparent text-center'
                                min='1'
                                autoFocus
                              />
                              <span className='text-xs text-gray-500'>
                                {tempQuantity > 1 ? 'kits' : 'kit'}
                              </span>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-6 w-6 p-0 text-green-600 hover:text-green-700'
                                onClick={() => saveQuantity(projectKit.id)}
                              >
                                ✓
                              </Button>
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-6 w-6 p-0 text-red-600 hover:text-red-700'
                                onClick={cancelEditingQuantity}
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <div className='flex items-center space-x-1'>
                              <Badge variant='outline' className='text-xs'>
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
                                    startEditingQuantity(
                                      projectKit.id,
                                      projectKit.quantite
                                    )
                                  }
                                  title='Modifier la quantité'
                                >
                                  <Edit3 className='w-3 h-3' />
                                </Button>
                              )}
                              {onRemoveKit && (
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='h-6 w-6 p-0 text-gray-400 hover:text-red-600'
                                  onClick={() => handleRemoveKit(projectKit.id)}
                                  title='Retirer ce kit du projet'
                                >
                                  <Trash2 className='w-3 h-3' />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {kit.description && (
                      <p className='text-gray-600 text-sm ml-13'>
                        {kit.description}
                      </p>
                    )}
                  </div>

                  <div className='text-right ml-6'>
                    <div className='text-3xl font-bold text-[#30C1BD] mb-1 group-hover:scale-105 transition-transform duration-200'>
                      {formatPriceHelper(totalPrice)}
                    </div>
                    <div className='text-sm text-gray-600 font-medium'>
                      {formatPriceHelper(kitPrice)} par kit (
                      {selectedMode === 'achat' ? 'Achat' : 'Location'})
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-6 relative z-10'>
                {/* Sélecteur de mode moderne cohérent */}
                <div className='bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm mb-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl'>
                        <Target className='w-5 h-5 text-blue-600' />
                      </div>
                      <span className='text-base font-semibold text-gray-900'>Mode de commercialisation</span>
                    </div>
                    <div className='flex space-x-3 p-1 bg-gray-100 rounded-2xl'>
                      <Button
                        variant={selectedMode === 'achat' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setSelectedMode('achat')}
                        className={`flex items-center gap-2 transition-all duration-200 ${
                          selectedMode === 'achat' 
                            ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white shadow-sm' 
                            : 'hover:bg-white/60'
                        }`}
                      >
                        <ShoppingCart className='w-4 h-4' />
                        Achat
                      </Button>
                      <Button
                        variant={selectedMode === 'location' ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setSelectedMode('location')}
                        className={`flex items-center gap-2 transition-all duration-200 ${
                          selectedMode === 'location' 
                            ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white shadow-sm' 
                            : 'hover:bg-white/60'
                        }`}
                      >
                        <Home className='w-4 h-4' />
                        Location
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Métriques principales avec design moderne */}
                <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                  <motion.div
                    whileHover={{ y: -2, scale: 1.05 }}
                    className='text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200'
                  >
                    <div className='w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm'>
                      <Target className='w-5 h-5 text-red-600' />
                    </div>
                    <div className='text-base font-bold text-red-900 mb-1'>
                      {totalImpact.rechauffementClimatique.toFixed(1)}
                    </div>
                    <div className='text-xs text-red-700 font-medium'>
                      kg CO₂
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2, scale: 1.05 }}
                    className='text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200'
                  >
                    <div className='w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm'>
                      <Leaf className='w-5 h-5 text-orange-600' />
                    </div>
                    <div className='text-base font-bold text-orange-900 mb-1'>
                      {totalImpact.epuisementRessources.toFixed(0)}
                    </div>
                    <div className='text-xs text-orange-700 font-medium'>
                      MJ
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2, scale: 1.05 }}
                    className='text-center p-4 bg-gradient-to-br from-[#30C1BD]/5 to-cyan-50 border border-[#30C1BD]/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200'
                  >
                    <div className='w-10 h-10 bg-gradient-to-br from-[#30C1BD]/10 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm'>
                      <Leaf className='w-5 h-5 text-[#30C1BD]' />
                    </div>
                    <div className='text-base font-bold text-[#30C1BD] mb-1'>
                      {totalImpact.acidification.toFixed(1)}
                    </div>
                    <div className='text-xs text-[#30C1BD] font-medium'>
                      MOL H+
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2, scale: 1.05 }}
                    className='text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200'
                  >
                    <div className='w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm'>
                      <Target className='w-5 h-5 text-green-600' />
                    </div>
                    <div className='text-base font-bold text-green-900 mb-1'>
                      {totalImpact.eutrophisation.toFixed(1)}
                    </div>
                    <div className='text-xs text-green-700 font-medium'>
                      kg P eq
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -2, scale: 1.05 }}
                    className='text-center p-4 bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200'
                  >
                    <div className='w-10 h-10 bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm'>
                      <Target className='w-5 h-5 text-teal-600' />
                    </div>
                    <div className='text-base font-bold text-teal-900 mb-1'>
                      {totalImpact.surface.toFixed(1)}
                    </div>
                    <div className='text-xs text-teal-700 font-medium'>m²</div>
                  </motion.div>
                </div>

                {/* Bouton d'expansion */}
                <div className='flex justify-center'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => toggleKitExpansion(projectKit.id)}
                    className='text-[#30C1BD] hover:text-[#30C1BD]/80'
                  >
                    {isExpanded ? (
                      <>
                        <Minus className='w-4 h-4 mr-2' />
                        Masquer les détails
                      </>
                    ) : (
                      <>
                        <Plus className='w-4 h-4 mr-2' />
                        Voir les détails
                      </>
                    )}
                  </Button>
                </div>

                {/* Détails des produits (expandable) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className='overflow-hidden'
                    >
                      <div className='border-t pt-4 space-y-3'>
                        <h4 className='font-medium text-gray-900 mb-3'>
                          Produits du kit
                        </h4>
                        {kit.kitProducts.map((kitProduct) => {
                          const product = kitProduct.product;
                          if (!product) return null;

                          return (
                            <div
                              key={kitProduct.id}
                              className='border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow'
                            >
                              <div className='flex items-start gap-4'>
                                <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                                  <Package className='w-6 h-6 text-gray-400' />
                                </div>

                                <div className='flex-1 min-w-0'>
                                  <div className='flex items-start justify-between gap-4'>
                                    <div className='flex-1 min-w-0'>
                                      <h5 className='font-semibold text-gray-900 mb-1 truncate'>
                                        {product.nom}
                                      </h5>
                                      <p className='text-sm text-gray-600 mb-2'>
                                        Référence: {product.reference}
                                      </p>
                                      <div className='flex items-center gap-4 text-xs text-gray-500'>
                                        <span className='bg-blue-50 text-blue-700 px-2 py-1 rounded-full'>
                                          {kitProduct.quantite} unité
                                          {kitProduct.quantite > 1 ? 's' : ''}
                                        </span>
                                        {product.surfaceM2 > 0 && (
                                          <span>
                                            {product.surfaceM2}m² par unité
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className='text-right flex-shrink-0'>
                                      {(() => {
                                        const productPricing =
                                          getProductPricing(
                                            product,
                                            selectedMode,
                                            '1an'
                                          );
                                        return (
                                          <>
                                            <div className='text-lg font-bold text-gray-900 mb-1'>
                                              {formatPriceHelper(
                                                (productPricing.prixVente ||
                                                  0) * kitProduct.quantite
                                              )}
                                            </div>
                                            <div className='text-sm text-gray-500'>
                                              {formatPriceHelper(
                                                productPricing.prixVente || 0
                                              )}{' '}
                                              /unité
                                            </div>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  {/* Environmental metrics in a compact horizontal layout */}
                                  <div className='mt-3 pt-3 border-t border-gray-100'>
                                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs'>
                                      {(() => {
                                        const productImpact =
                                          getProductEnvironmentalImpact(
                                            product,
                                            selectedMode
                                          );
                                        return (
                                          <>
                                            <div className='flex items-center gap-2'>
                                              <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                                              <span className='text-gray-600'>
                                                {(
                                                  (productImpact.rechauffementClimatique ||
                                                    0) * kitProduct.quantite
                                                ).toFixed(1)}{' '}
                                                kg CO₂
                                              </span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                              <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                                              <span className='text-gray-600'>
                                                {(
                                                  (productImpact.epuisementRessources ||
                                                    0) * kitProduct.quantite
                                                ).toFixed(0)}{' '}
                                                MJ
                                              </span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                              <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                              <span className='text-gray-600'>
                                                {(
                                                  (productImpact.acidification ||
                                                    0) * kitProduct.quantite
                                                ).toFixed(1)}{' '}
                                                MOL H+
                                              </span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                                              <span className='text-gray-600'>
                                                {(
                                                  (productImpact.eutrophisation ||
                                                    0) * kitProduct.quantite
                                                ).toFixed(1)}{' '}
                                                kg P eq
                                              </span>
                                            </div>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
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
      })}
    </div>
  );
}
