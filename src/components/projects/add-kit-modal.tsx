'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  Search,
  Filter,
  Plus,
  Minus,
  Leaf,
  Euro,
  Target,
  X,
  Info,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Kit {
  id: string;
  nom: string;
  description?: string;
  style: string;
  kitProducts: {
    id: string;
    quantite: number;
    product: {
      id: string;
      nom: string;
      reference: string;
      prixVente1An: number;
      rechauffementClimatique: number;
      epuisementRessources: number;
      acidification: number;
      eutrophisation: number;
      surface: number;
    };
  }[];
}

interface AddKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKits: (kits: { kitId: string; quantite: number }[]) => void;
  projectId: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const getKitImpact = (kitProducts: Kit['kitProducts']) => {
  return kitProducts.reduce(
    (acc, kitProduct) => ({
      rechauffementClimatique:
        acc.rechauffementClimatique +
        kitProduct.product.rechauffementClimatique * kitProduct.quantite,
      epuisementRessources:
        acc.epuisementRessources +
        kitProduct.product.epuisementRessources * kitProduct.quantite,
      acidification:
        acc.acidification +
        kitProduct.product.acidification * kitProduct.quantite,
      eutrophisation:
        acc.eutrophisation +
        kitProduct.product.eutrophisation * kitProduct.quantite,
      surface: acc.surface + kitProduct.product.surface * kitProduct.quantite,
    }),
    {
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
      surface: 0,
    }
  );
};

const getKitPrice = (kitProducts: Kit['kitProducts']) => {
  return kitProducts.reduce(
    (acc, kitProduct) =>
      acc + kitProduct.product.prixVente1An * kitProduct.quantite,
    0
  );
};

export function AddKitModal({
  isOpen,
  onClose,
  onAddKits,
  projectId,
}: AddKitModalProps) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedKits, setSelectedKits] = useState<Record<string, number>>({});
  const [expandedKit, setExpandedKit] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (isOpen) {
      fetchKits();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debouncedSearchTerm || selectedStyle) {
      fetchKits();
    }
  }, [debouncedSearchTerm, selectedStyle]);

  const fetchKits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedStyle) params.append('style', selectedStyle);

      const response = await fetch(`/api/kits?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setKits(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des kits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (kitId: string, change: number) => {
    const currentQuantity = selectedKits[kitId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    if (newQuantity === 0) {
      const { [kitId]: removed, ...rest } = selectedKits;
      setSelectedKits(rest);
    } else {
      setSelectedKits((prev) => ({ ...prev, [kitId]: newQuantity }));
    }
  };

  const handleAddKits = () => {
    const kitsToAdd = Object.entries(selectedKits)
      .filter(([_, quantity]) => quantity > 0)
      .map(([kitId, quantity]) => ({ kitId, quantite: quantity }));

    if (kitsToAdd.length > 0) {
      onAddKits(kitsToAdd);
      setSelectedKits({});
      onClose();
    }
  };

  const selectedKitsCount = Object.values(selectedKits).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const selectedKitsTotalPrice = Object.entries(selectedKits).reduce(
    (sum, [kitId, quantity]) => {
      const kit = kits.find((k) => k.id === kitId);
      return sum + (kit ? getKitPrice(kit.kitProducts) * quantity : 0);
    },
    0
  );

  const availableStyles = Array.from(new Set(kits.map((kit) => kit.style)));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-full sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <Package className='w-5 h-5' />
            <span>Ajouter des kits au projet</span>
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col h-full space-y-4'>
          {/* Barre de recherche et filtres */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Rechercher un kit...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Filter className='w-4 h-4 text-gray-500' />
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>Tous les styles</option>
                {availableStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Résumé des kits sélectionnés */}
          {selectedKitsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                      <Package className='w-4 h-4 text-blue-600' />
                    </div>
                    <div>
                      <div className='font-medium text-blue-900'>
                        {selectedKitsCount} kit
                        {selectedKitsCount > 1 ? 's' : ''} sélectionné
                        {selectedKitsCount > 1 ? 's' : ''}
                      </div>
                      <div className='text-sm text-blue-600'>
                        Prix total: {formatPrice(selectedKitsTotalPrice)}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddKits}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Ajouter au projet
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Liste des kits */}
          <div className='flex-1 overflow-y-auto space-y-4'>
            {loading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
                <p className='text-gray-500 mt-2'>Chargement des kits...</p>
              </div>
            ) : kits.length === 0 ? (
              <div className='text-center py-8'>
                <Package className='w-16 h-16 text-gray-300 mx-auto mb-4' />
                <p className='text-gray-500'>Aucun kit trouvé</p>
              </div>
            ) : (
              kits.map((kit) => {
                const kitImpact = getKitImpact(kit.kitProducts);
                const kitPrice = getKitPrice(kit.kitProducts);
                const selectedQuantity = selectedKits[kit.id] || 0;
                const isExpanded = expandedKit === kit.id;

                return (
                  <motion.div
                    key={kit.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className='border rounded-lg hover:shadow-md transition-shadow'>
                      <Card className='border-0 shadow-none'>
                        <CardHeader className='pb-3'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center space-x-3 mb-2'>
                                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center'>
                                  <Package className='w-5 h-5 text-white' />
                                </div>
                                <div>
                                  <CardTitle className='text-lg text-gray-900'>
                                    {kit.nom}
                                  </CardTitle>
                                  <div className='flex items-center space-x-2 mt-1'>
                                    <Badge
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {kit.style}
                                    </Badge>
                                    {kit.description && (
                                      <span className='text-sm text-gray-600'>
                                        {kit.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className='flex items-center space-x-3'>
                              <div className='text-right'>
                                <div className='text-xl font-bold text-blue-600'>
                                  {formatPrice(kitPrice)}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  par kit
                                </div>
                              </div>

                              <div className='flex items-center space-x-2'>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleQuantityChange(kit.id, -1)
                                  }
                                  className='w-8 h-8 p-0'
                                  disabled={selectedQuantity === 0}
                                >
                                  <Minus className='w-3 h-3' />
                                </Button>
                                <span className='font-semibold text-blue-600 min-w-[3rem] text-center'>
                                  {selectedQuantity}
                                </span>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() =>
                                    handleQuantityChange(kit.id, 1)
                                  }
                                  className='w-8 h-8 p-0'
                                >
                                  <Plus className='w-3 h-3' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className='space-y-4'>
                          {/* Métriques rapides */}
                          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3'>
                            <div className='text-center p-2 bg-gray-50 rounded text-xs'>
                              <div className='font-semibold text-red-600'>
                                {kitImpact.rechauffementClimatique.toFixed(1)}
                              </div>
                              <div className='text-gray-500'>kg CO₂</div>
                            </div>
                            <div className='text-center p-2 bg-gray-50 rounded text-xs'>
                              <div className='font-semibold text-orange-600'>
                                {kitImpact.epuisementRessources.toFixed(0)}
                              </div>
                              <div className='text-gray-500'>MJ</div>
                            </div>
                            <div className='text-center p-2 bg-gray-50 rounded text-xs'>
                              <div className='font-semibold text-blue-600'>
                                {kitImpact.acidification.toFixed(2)}
                              </div>
                              <div className='text-gray-500'>mol H+</div>
                            </div>
                            <div className='text-center p-2 bg-gray-50 rounded text-xs'>
                              <div className='font-semibold text-green-600'>
                                {kitImpact.eutrophisation.toFixed(2)}
                              </div>
                              <div className='text-gray-500'>kg PO₄</div>
                            </div>
                            <div className='text-center p-2 bg-gray-50 rounded text-xs'>
                              <div className='font-semibold text-teal-600'>
                                {kitImpact.surface.toFixed(1)}
                              </div>
                              <div className='text-gray-500'>m²</div>
                            </div>
                          </div>

                          {/* Bouton pour développer/réduire */}
                          <div className='flex justify-center'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                setExpandedKit(isExpanded ? null : kit.id)
                              }
                              className='text-blue-600 hover:text-blue-700'
                            >
                              {isExpanded ? (
                                <>
                                  <X className='w-4 h-4 mr-2' />
                                  Réduire
                                </>
                              ) : (
                                <>
                                  <Info className='w-4 h-4 mr-2' />
                                  Voir les produits
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Détail des produits (développable) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className='border-t pt-4'>
                                  <h4 className='font-medium text-gray-700 mb-3'>
                                    Produits inclus dans ce kit
                                  </h4>

                                  <div className='space-y-2'>
                                    {kit.kitProducts.map((kitProduct) => (
                                      <div
                                        key={kitProduct.id}
                                        className='flex items-center justify-between p-2 bg-gray-50 rounded text-sm'
                                      >
                                        <div>
                                          <span className='font-medium'>
                                            {kitProduct.product.nom}
                                          </span>
                                          <Badge
                                            variant='outline'
                                            className='ml-2 text-xs'
                                          >
                                            {kitProduct.product.reference}
                                          </Badge>
                                        </div>
                                        <div className='text-right'>
                                          <div className='font-medium'>
                                            {kitProduct.quantite} ×{' '}
                                            {formatPrice(
                                              kitProduct.product.prixVente1An
                                            )}
                                          </div>
                                          <div className='text-gray-500'>
                                            ={' '}
                                            {formatPrice(
                                              kitProduct.product.prixVente1An *
                                                kitProduct.quantite
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
