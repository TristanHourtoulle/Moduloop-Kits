'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Search,
  Filter,
  Plus,
  Minus,
  Edit3,
  Trash2,
  ShoppingCart,
  Home,
  Target,
  Leaf,
  Euro,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  BarChart3,
  Zap,
  Droplets,
  Info,
  ShoppingBag,
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ProjectKit, Kit, KitProduct } from '@/lib/types/project';
import { type PurchaseRentalMode } from '@/lib/schemas/product';
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  formatPrice as formatPriceHelper,
} from '@/lib/utils/product-helpers';

interface KitsTabProps {
  projectKits: ProjectKit[];
  onAddKits: (kits: { kitId: string; quantite: number }[]) => Promise<void>;
  onUpdateQuantity?: (
    projectKitId: string,
    newQuantity: number
  ) => Promise<void>;
  onRemoveKit?: (projectKitId: string) => Promise<void>;
}

interface AvailableKit extends Kit {
  kitProducts: KitProduct[];
}

export function KitsTab({
  projectKits,
  onAddKits,
  onUpdateQuantity,
  onRemoveKit,
}: KitsTabProps) {
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat');
  const [showAddSection, setShowAddSection] = useState(false);
  const [availableKits, setAvailableKits] = useState<AvailableKit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedKits, setSelectedKits] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [expandedProjectKit, setExpandedProjectKit] = useState<string | null>(
    null
  );
  const [expandedAvailableKit, setExpandedAvailableKit] = useState<
    string | null
  >(null);
  const [editingQuantity, setEditingQuantity] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch available kits when add section is shown
  useEffect(() => {
    if (showAddSection) {
      fetchAvailableKits();
    }
  }, [showAddSection, debouncedSearchTerm, selectedStyle]);

  const fetchAvailableKits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (selectedStyle) params.append('style', selectedStyle);

      const response = await fetch(`/api/kits?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableKits(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des kits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kit calculations with proper error handling
  const getKitImpact = (
    kitProducts: KitProduct[],
    mode: PurchaseRentalMode
  ) => {
    if (!kitProducts || kitProducts.length === 0) {
      return {
        rechauffementClimatique: 0,
        epuisementRessources: 0,
        acidification: 0,
        eutrophisation: 0,
        surface: 0,
      };
    }

    return kitProducts.reduce(
      (acc, kitProduct) => {
        const product = kitProduct.product;
        if (!product) return acc;

        const environmentalImpact = getProductEnvironmentalImpact(
          product,
          mode
        );

        return {
          rechauffementClimatique:
            acc.rechauffementClimatique +
            (environmentalImpact.rechauffementClimatique || 0) *
              kitProduct.quantite,
          epuisementRessources:
            acc.epuisementRessources +
            (environmentalImpact.epuisementRessources || 0) *
              kitProduct.quantite,
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
    if (!kitProducts || kitProducts.length === 0) return 0;

    return kitProducts.reduce((acc, kitProduct) => {
      const product = kitProduct.product;
      if (!product) return acc;

      const pricing = getProductPricing(product, mode, '1an');
      return acc + (pricing.prixVente || 0) * kitProduct.quantite;
    }, 0);
  };

  // Handlers
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

  const handleAddSelectedKits = async () => {
    const kitsToAdd = Object.entries(selectedKits)
      .filter(([_, quantity]) => quantity > 0)
      .map(([kitId, quantity]) => ({ kitId, quantite: quantity }));

    if (kitsToAdd.length > 0) {
      await onAddKits(kitsToAdd);
      setSelectedKits({});
      setShowAddSection(false);
    }
  };

  const startEditingQuantity = (
    projectKitId: string,
    currentQuantity: number
  ) => {
    setEditingQuantity(projectKitId);
    setTempQuantity(currentQuantity);
  };

  const saveQuantity = async (projectKitId: string) => {
    if (onUpdateQuantity && tempQuantity > 0) {
      await onUpdateQuantity(projectKitId, tempQuantity);
      setEditingQuantity(null);
      setTempQuantity(0);
    }
  };

  const cancelEditingQuantity = () => {
    setEditingQuantity(null);
    setTempQuantity(0);
  };

  const handleRemoveKit = async (projectKitId: string) => {
    if (onRemoveKit) {
      await onRemoveKit(projectKitId);
    }
  };

  // Calculate totals for selected kits
  const selectedKitsCount = Object.values(selectedKits).reduce(
    (sum, qty) => sum + qty,
    0
  );
  const selectedKitsTotalPrice = Object.entries(selectedKits).reduce(
    (sum, [kitId, quantity]) => {
      const kit = availableKits.find((k) => k.id === kitId);
      return (
        sum + (kit ? getKitPrice(kit.kitProducts, selectedMode) * quantity : 0)
      );
    },
    0
  );

  const availableStyles = Array.from(
    new Set(availableKits.map((kit) => kit.style).filter(Boolean))
  );

  return (
    <div className='space-y-8'>
      {/* Header Section */}
      <div className='bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div className='flex items-center space-x-3'>
            <div className='p-3 bg-gradient-to-br from-[#30C1BD]/10 to-blue-100 rounded-xl'>
              <Package className='w-6 h-6 text-[#30C1BD]' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900'>
                Gestion des Kits
              </h2>
              <p className='text-gray-600'>
                {projectKits.length} kit{projectKits.length > 1 ? 's' : ''}{' '}
                configuré{projectKits.length > 1 ? 's' : ''} dans ce projet
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className='flex items-center space-x-4'>
            <span className='text-sm font-medium text-gray-700'>Mode :</span>
            <div className='flex space-x-1 p-1 bg-gray-100 rounded-2xl'>
              <Button
                variant={selectedMode === 'achat' ? 'default' : 'ghost'}
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
                variant={selectedMode === 'location' ? 'default' : 'ghost'}
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

        <Separator className='my-4' />

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center'>
          <Button
            onClick={() => setShowAddSection(!showAddSection)}
            className={`flex items-center gap-2 ${
              showAddSection
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white'
            }`}
          >
            {showAddSection ? (
              <>
                <XCircle className='w-4 h-4' />
                Fermer le catalogue
              </>
            ) : (
              <>
                <Plus className='w-4 h-4' />
                Parcourir le catalogue
              </>
            )}
          </Button>

          {projectKits.length > 0 && (
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-gray-600'>
              <div className='flex items-center gap-2'>
                <BarChart3 className='w-4 h-4' />
                <span>
                  Total: {projectKits.reduce((sum, pk) => sum + pk.quantite, 0)}{' '}
                  unités
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Euro className='w-4 h-4' />
                <span>
                  Valeur:{' '}
                  {formatPriceHelper(
                    projectKits.reduce((sum, pk) => {
                      if (!pk.kit?.kitProducts) return sum;
                      return (
                        sum +
                        getKitPrice(pk.kit.kitProducts, selectedMode) *
                          pk.quantite
                      );
                    }, 0)
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Kits Section - Completely Redesigned */}
      <AnimatePresence>
        {showAddSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className='pt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-3 text-blue-900'>
                    <div className='p-2 bg-blue-100 rounded-xl'>
                      <ShoppingBag className='w-5 h-5 text-blue-600' />
                    </div>
                    <div>
                      <span className='text-xl'>Catalogue des Kits</span>
                      <p className='text-sm font-normal text-blue-700 mt-1'>
                        Sélectionnez les kits à ajouter à votre projet
                      </p>
                    </div>
                  </div>

                  {/* Shopping Cart Summary */}
                  {selectedKitsCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className='bg-white border border-blue-300 rounded-xl p-3 shadow-sm'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                          <ShoppingBag className='w-4 h-4 text-green-600' />
                        </div>
                        <div className='text-sm'>
                          <div className='font-semibold text-gray-900'>
                            {selectedKitsCount} kit
                            {selectedKitsCount > 1 ? 's' : ''} sélectionné
                            {selectedKitsCount > 1 ? 's' : ''}
                          </div>
                          <div className='text-green-600 font-medium'>
                            {formatPriceHelper(selectedKitsTotalPrice)}
                          </div>
                        </div>
                        <Button
                          size='sm'
                          onClick={handleAddSelectedKits}
                          className='bg-green-600 hover:bg-green-700 text-white shadow-sm'
                        >
                          <Plus className='w-3 h-3 mr-1' />
                          Ajouter
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className='space-y-6'>
                {/* Search and Filters */}
                <div className='flex flex-col lg:flex-row gap-4 bg-white rounded-xl p-4 border border-blue-200'>
                  <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                    <Input
                      placeholder='Rechercher par nom de kit...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-10 bg-white border-gray-300 focus:border-[#30C1BD] focus:ring-[#30C1BD]'
                    />
                  </div>

                  <div className='flex items-center gap-3'>
                    <Filter className='w-4 h-4 text-gray-500' />
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className='px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30C1BD] bg-white min-w-[140px]'
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

                {/* Available Kits Grid */}
                <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2'>
                  {loading ? (
                    <div className='text-center py-16'>
                      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
                      <p className='text-gray-500'>
                        Chargement du catalogue...
                      </p>
                    </div>
                  ) : availableKits.length === 0 ? (
                    <div className='text-center py-16'>
                      <Package className='w-20 h-20 text-gray-300 mx-auto mb-4' />
                      <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                        Aucun kit trouvé
                      </h3>
                      <p className='text-gray-500'>
                        {searchTerm || selectedStyle
                          ? 'Aucun kit ne correspond à vos critères de recherche'
                          : 'Le catalogue de kits est actuellement vide'}
                      </p>
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
                      {availableKits.map((kit) => {
                        const kitImpact = getKitImpact(
                          kit.kitProducts,
                          selectedMode
                        );
                        const kitPrice = getKitPrice(
                          kit.kitProducts,
                          selectedMode
                        );
                        const selectedQuantity = selectedKits[kit.id] || 0;
                        const isExpanded = expandedAvailableKit === kit.id;

                        return (
                          <motion.div
                            key={kit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden'
                          >
                            <div className='p-6'>
                              {/* Kit Header */}
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
                                      <Badge
                                        variant='outline'
                                        className='text-xs'
                                      >
                                        {kit.style}
                                      </Badge>
                                      <Badge
                                        variant='secondary'
                                        className='text-xs bg-blue-100 text-blue-800'
                                      >
                                        {kit.kitProducts?.length || 0} produit
                                        {(kit.kitProducts?.length || 0) > 1
                                          ? 's'
                                          : ''}
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
                                  <div className='text-2xl font-bold text-[#30C1BD] mb-1'>
                                    {formatPriceHelper(kitPrice)}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    {selectedMode === 'achat'
                                      ? "Prix d'achat"
                                      : 'Prix location'}
                                  </div>
                                </div>
                              </div>

                              {/* Environmental Impact Preview */}
                              <div className='grid grid-cols-4 gap-2 mb-4'>
                                <div className='text-center p-2 rounded-lg' style={{ backgroundColor: '#FE9E5815' }}>
                                  <Zap className='w-3 h-3 mx-auto mb-1' style={{ color: '#FE9E58' }} />
                                  <div className='text-xs font-semibold' style={{ color: '#FE9E58' }}>
                                    {kitImpact.rechauffementClimatique.toFixed(
                                      1
                                    )}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    CO₂
                                  </div>
                                </div>
                                <div className='text-center p-2 rounded-lg' style={{ backgroundColor: '#FE585815' }}>
                                  <Target className='w-3 h-3 mx-auto mb-1' style={{ color: '#FE5858' }} />
                                  <div className='text-xs font-semibold' style={{ color: '#FE5858' }}>
                                    {kitImpact.epuisementRessources.toFixed(0)}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    MJ
                                  </div>
                                </div>
                                <div className='text-center p-2 rounded-lg' style={{ backgroundColor: '#55D78915' }}>
                                  <Droplets className='w-3 h-3 mx-auto mb-1' style={{ color: '#55D789' }} />
                                  <div className='text-xs font-semibold' style={{ color: '#55D789' }}>
                                    {kitImpact.acidification.toFixed(1)}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    H+
                                  </div>
                                </div>
                                <div className='text-center p-2 bg-teal-50 rounded-lg'>
                                  <Leaf className='w-3 h-3 text-teal-500 mx-auto mb-1' />
                                  <div className='text-xs font-semibold text-teal-900'>
                                    {kitImpact.surface.toFixed(1)}
                                  </div>
                                  <div className='text-xs text-gray-600'>
                                    m²
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className='flex items-center justify-between gap-3'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() =>
                                    setExpandedAvailableKit(
                                      isExpanded ? null : kit.id
                                    )
                                  }
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
                                      Détails
                                    </>
                                  )}
                                </Button>

                                <div className='flex items-center gap-2'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() =>
                                      handleQuantityChange(kit.id, -1)
                                    }
                                    disabled={selectedQuantity === 0}
                                    className='w-8 h-8 p-0 border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white'
                                  >
                                    <Minus className='w-3 h-3' />
                                  </Button>
                                  <span className='font-bold text-[#30C1BD] min-w-[2.5rem] text-center text-lg'>
                                    {selectedQuantity}
                                  </span>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() =>
                                      handleQuantityChange(kit.id, 1)
                                    }
                                    className='w-8 h-8 p-0 border-[#30C1BD] text-[#30C1BD] hover:bg-[#30C1BD] hover:text-white'
                                  >
                                    <Plus className='w-3 h-3' />
                                  </Button>
                                </div>
                              </div>

                              {/* Kit Details Expansion */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className='overflow-hidden'
                                  >
                                    <Separator className='my-4' />
                                    <div className='space-y-4'>
                                      <h4 className='font-semibold text-gray-900 flex items-center gap-2'>
                                        <Package className='w-4 h-4' />
                                        Produits inclus (
                                        {kit.kitProducts?.length || 0})
                                      </h4>

                                      {kit.kitProducts &&
                                      kit.kitProducts.length > 0 ? (
                                        <div className='space-y-3 max-h-64 overflow-y-auto'>
                                          {kit.kitProducts.map((kitProduct) => {
                                            const product = kitProduct.product;
                                            if (!product) return null;

                                            const productPricing =
                                              getProductPricing(
                                                product,
                                                selectedMode,
                                                '1an'
                                              );
                                            const productImpact =
                                              getProductEnvironmentalImpact(
                                                product,
                                                selectedMode
                                              );

                                            return (
                                              <div
                                                key={kitProduct.id}
                                                className='bg-gray-50 rounded-lg p-3'
                                              >
                                                <div className='flex items-center justify-between mb-2'>
                                                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                                                    <div className='w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0'>
                                                      <Package className='w-4 h-4 text-gray-400' />
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                      <h5 className='font-medium text-gray-900 truncate text-sm'>
                                                        {product.nom}
                                                      </h5>
                                                      <div className='flex items-center gap-2 mt-1'>
                                                        <Badge
                                                          variant='outline'
                                                          className='text-xs'
                                                        >
                                                          {product.reference}
                                                        </Badge>
                                                        <span className='text-xs text-gray-500'>
                                                          Qté:{' '}
                                                          {kitProduct.quantite}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  <div className='text-right flex-shrink-0'>
                                                    <div className='text-sm font-semibold text-gray-900'>
                                                      {formatPriceHelper(
                                                        (productPricing.prixVente ||
                                                          0) *
                                                          kitProduct.quantite
                                                      )}
                                                    </div>
                                                    <div className='text-xs text-gray-500'>
                                                      {formatPriceHelper(
                                                        productPricing.prixVente ||
                                                          0
                                                      )}
                                                      /u
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Product Environmental Impact */}
                                                <div className='grid grid-cols-4 gap-1 text-xs'>
                                                  <div className='flex items-center gap-1'>
                                                    <div className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: '#FE9E58' }}></div>
                                                    <span className='text-gray-600 truncate'>
                                                      {(
                                                        (productImpact.rechauffementClimatique ||
                                                          0) *
                                                        kitProduct.quantite
                                                      ).toFixed(1)}
                                                    </span>
                                                  </div>
                                                  <div className='flex items-center gap-1'>
                                                    <div className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: '#FE5858' }}></div>
                                                    <span className='text-gray-600 truncate'>
                                                      {(
                                                        (productImpact.epuisementRessources ||
                                                          0) *
                                                        kitProduct.quantite
                                                      ).toFixed(0)}
                                                    </span>
                                                  </div>
                                                  <div className='flex items-center gap-1'>
                                                    <div className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: '#55D789' }}></div>
                                                    <span className='text-gray-600 truncate'>
                                                      {(
                                                        (productImpact.acidification ||
                                                          0) *
                                                        kitProduct.quantite
                                                      ).toFixed(1)}
                                                    </span>
                                                  </div>
                                                  <div className='flex items-center gap-1'>
                                                    <div className='w-1.5 h-1.5 bg-teal-500 rounded-full'></div>
                                                    <span className='text-gray-600 truncate'>
                                                      {(
                                                        (product.surfaceM2 ||
                                                          0) *
                                                        kitProduct.quantite
                                                      ).toFixed(1)}
                                                      m²
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className='text-center py-4 text-gray-500'>
                                          <Info className='w-8 h-8 mx-auto mb-2 text-gray-400' />
                                          <p>
                                            Aucun produit configuré dans ce kit
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Floating Add Button for Mobile */}
                {selectedKitsCount > 0 && (
                  <div className='lg:hidden fixed bottom-6 right-6 z-50'>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleAddSelectedKits}
                        className='bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full w-14 h-14 flex items-center justify-center'
                      >
                        <Plus className='w-6 h-6' />
                      </Button>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Project Kits */}
      <div className='space-y-4'>
        {projectKits.length === 0 ? (
          <Card className='pt-6 border-dashed border-2 border-gray-300'>
            <CardContent className='flex flex-col items-center justify-center py-16'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                <Package className='w-10 h-10 text-gray-400' />
              </div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Aucun kit dans ce projet
              </h3>
              <p className='text-gray-500 text-center mb-6 max-w-md'>
                Commencez par parcourir notre catalogue pour ajouter des kits à
                votre projet et voir leurs métriques détaillées.
              </p>
              <Button
                onClick={() => setShowAddSection(true)}
                className='bg-[#30C1BD] hover:bg-[#30C1BD]/90 text-white'
              >
                <ShoppingBag className='w-4 h-4 mr-2' />
                Parcourir le catalogue
              </Button>
            </CardContent>
          </Card>
        ) : (
          projectKits.map((projectKit, index) => {
            const kit = projectKit.kit;

            if (!kit || !kit.kitProducts) {
              return (
                <Card
                  key={projectKit.id}
                  className='pt-6 border-red-200 bg-red-50'
                >
                  <CardContent className='p-6'>
                    <div className='text-center text-red-600'>
                      <Package className='w-8 h-8 mx-auto mb-2' />
                      <p>Kit non disponible ou sans produits</p>
                    </div>
                  </CardContent>
                </Card>
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
              surface: (kit.surfaceM2 || 0) * projectKit.quantite,
            };
            const isExpanded = expandedProjectKit === projectKit.id;

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

                            {/* Quantity Management */}
                            {editingQuantity === projectKit.id ? (
                              <div className='flex items-center space-x-2 bg-white border rounded-lg px-3 py-1'>
                                <input
                                  type='number'
                                  value={tempQuantity}
                                  onChange={(e) =>
                                    setTempQuantity(Number(e.target.value))
                                  }
                                  className='w-16 text-sm border-none bg-transparent text-center focus:outline-none'
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
                                  <CheckCircle className='w-3 h-3' />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='h-6 w-6 p-0 text-red-600 hover:text-red-700'
                                  onClick={cancelEditingQuantity}
                                >
                                  <XCircle className='w-3 h-3' />
                                </Button>
                              </div>
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
                                    onClick={() =>
                                      handleRemoveKit(projectKit.id)
                                    }
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
                                {Math.round(kitPrice / kit.surfaceM2).toLocaleString('fr-FR')}€/m²
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
                            <div className='space-y-1'>
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
                                    <div className='flex justify-end items-baseline gap-2'>
                                      <span className='text-xs text-gray-500'>1 an:</span>
                                      <span className='text-lg font-bold text-[#30C1BD]'>
                                        {formatPriceHelper(price1an)}
                                      </span>
                                    </div>
                                    <div className='flex justify-end items-baseline gap-2'>
                                      <span className='text-xs text-gray-500'>2 ans:</span>
                                      <span className='text-lg font-bold text-[#30C1BD]'>
                                        {formatPriceHelper(price2ans)}
                                      </span>
                                    </div>
                                    <div className='flex justify-end items-baseline gap-2'>
                                      <span className='text-xs text-gray-500'>3 ans:</span>
                                      <span className='text-lg font-bold text-[#30C1BD]'>
                                        {formatPriceHelper(price3ans)}
                                      </span>
                                    </div>
                                    {kit.surfaceM2 && kit.surfaceM2 > 0 && (
                                      <div className='text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200'>
                                        Prix/m²: {Math.round(price1an / kit.surfaceM2).toLocaleString('fr-FR')}€
                                      </div>
                                    )}
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
                    {/* Surface Card - Always visible */}
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

                    {/* Environmental Metrics - Only show for location mode */}
                    {selectedMode === 'location' && (
                      <>
                        <div className='text-center mb-3'>
                          <p className='text-sm font-semibold text-emerald-700'>
                            Impact environnemental économisé
                          </p>
                        </div>
                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                        <motion.div
                          whileHover={{ y: -2, scale: 1.02 }}
                          className='text-center p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'
                          style={{ backgroundColor: '#FE9E5815', borderColor: '#FE9E5830', borderWidth: 1 }}
                        >
                          <div className='w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2' style={{ backgroundColor: '#FE9E5825' }}>
                            <Zap className='w-4 h-4' style={{ color: '#FE9E58' }} />
                          </div>
                          <div className='text-sm font-bold mb-1' style={{ color: '#FE9E58' }}>
                            {totalImpact.rechauffementClimatique.toFixed(1)}
                          </div>
                          <div className='text-xs text-gray-600'>kg CO₂ économisés</div>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -2, scale: 1.02 }}
                          className='text-center p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'
                          style={{ backgroundColor: '#FE585815', borderColor: '#FE585830', borderWidth: 1 }}
                        >
                          <div className='w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2' style={{ backgroundColor: '#FE585825' }}>
                            <Target className='w-4 h-4' style={{ color: '#FE5858' }} />
                          </div>
                          <div className='text-sm font-bold mb-1' style={{ color: '#FE5858' }}>
                            {totalImpact.epuisementRessources.toFixed(0)}
                          </div>
                          <div className='text-xs text-gray-600'>MJ économisés</div>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -2, scale: 1.02 }}
                          className='text-center p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'
                          style={{ backgroundColor: '#55D78915', borderColor: '#55D78930', borderWidth: 1 }}
                        >
                          <div className='w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2' style={{ backgroundColor: '#55D78925' }}>
                            <Droplets className='w-4 h-4' style={{ color: '#55D789' }} />
                          </div>
                          <div className='text-sm font-bold mb-1' style={{ color: '#55D789' }}>
                            {totalImpact.acidification.toFixed(1)}
                          </div>
                          <div className='text-xs text-gray-600'>MOL H+ économisés</div>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -2, scale: 1.02 }}
                          className='text-center p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'
                          style={{ backgroundColor: '#55D78915', borderColor: '#55D78930', borderWidth: 1 }}
                        >
                          <div className='w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2' style={{ backgroundColor: '#55D78925' }}>
                            <Leaf className='w-4 h-4' style={{ color: '#55D789' }} />
                          </div>
                          <div className='text-sm font-bold mb-1' style={{ color: '#55D789' }}>
                            {totalImpact.eutrophisation.toFixed(1)}
                          </div>
                          <div className='text-xs text-gray-600'>kg P eq économisés</div>
                        </motion.div>
                      </div>
                      </>
                    )}

                    {/* Toggle Detailed View */}
                    <div className='flex justify-center pt-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          setExpandedProjectKit(
                            isExpanded ? null : projectKit.id
                          )
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

                    {/* Detailed Product View */}
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

                              const productPricing = getProductPricing(
                                product,
                                selectedMode,
                                '1an'
                              );
                              const productImpact =
                                getProductEnvironmentalImpact(
                                  product,
                                  selectedMode
                                );

                              // Debug: vérifier si l'image arrive
                              if (product.image) {
                                console.log(`[KitsTab] Product ${product.nom} has image:`, product.image.substring(0, 50));
                              } else {
                                console.log(`[KitsTab] Product ${product.nom} NO IMAGE`);
                              }

                              // Calculate pricing for all modes
                              const pricingAchat = getProductPricing(product, 'achat', '1an');
                              const pricingLocation1An = getProductPricing(product, 'location', '1an');
                              const pricingLocation2Ans = getProductPricing(product, 'location', '2ans');
                              const pricingLocation3Ans = getProductPricing(product, 'location', '3ans');

                              return (
                                <div
                                  key={kitProduct.id}
                                  className='bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200'
                                >
                                  {/* Header: Image + Info */}
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

                                  {/* Pricing Section - Full Width 2 Columns */}
                                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4'>
                                    {/* Achat Column */}
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

                                    {/* Location Column */}
                                    <div className='bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-3 border border-emerald-200/50'>
                                      <div className='flex items-center gap-2 mb-3'>
                                        <div className='w-6 h-6 bg-white rounded-md flex items-center justify-center'>
                                          <Home className='h-3.5 w-3.5 text-emerald-700' />
                                        </div>
                                        <span className='font-semibold text-sm text-emerald-800'>Location</span>
                                      </div>

                                      <div className='grid grid-cols-3 gap-2 text-xs'>
                                        {/* 1 an */}
                                        <div>
                                          <div className='text-gray-600 mb-1'>1 an</div>
                                          {pricingLocation1An.prixVente && pricingLocation1An.prixVente > 0 ? (
                                            <div className='font-bold text-emerald-900'>
                                              {formatPriceHelper(pricingLocation1An.prixVente * kitProduct.quantite)}
                                            </div>
                                          ) : (
                                            <div className='italic text-orange-600'>N/R</div>
                                          )}
                                        </div>

                                        {/* 2 ans */}
                                        <div>
                                          <div className='text-gray-600 mb-1'>2 ans</div>
                                          {pricingLocation2Ans.prixVente && pricingLocation2Ans.prixVente > 0 ? (
                                            <div className='font-bold text-emerald-900'>
                                              {formatPriceHelper(pricingLocation2Ans.prixVente * kitProduct.quantite)}
                                            </div>
                                          ) : (
                                            <div className='italic text-orange-600'>N/R</div>
                                          )}
                                        </div>

                                        {/* 3 ans */}
                                        <div>
                                          <div className='text-gray-600 mb-1'>3 ans</div>
                                          {pricingLocation3Ans.prixVente && pricingLocation3Ans.prixVente > 0 ? (
                                            <div className='font-bold text-emerald-900'>
                                              {formatPriceHelper(pricingLocation3Ans.prixVente * kitProduct.quantite)}
                                            </div>
                                          ) : (
                                            <div className='italic text-orange-600'>N/R</div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Environmental Metrics - Only show for location mode */}
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
          })
        )}
      </div>
    </div>
  );
}
