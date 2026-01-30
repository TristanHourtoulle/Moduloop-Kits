'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Euro,
  Package,
  TrendingUp,
  Calculator,
  Percent,
  Calendar,
  BarChart3,
  ShoppingCart,
  Home,
  GitCompare,
  FileText,
} from 'lucide-react';
import { Project } from '@/lib/types/project';
import {
  type PurchaseRentalMode,
  type ProductPeriod,
} from '@/lib/schemas/product';
import { LocationPriceDisplay } from './location-price-display';
import {
  getProductPricing,
  formatPrice as formatPriceHelper,
  annualToMonthly,
} from '@/lib/utils/product-helpers';
import { PurchaseRentalComparison } from './purchase-rental-comparison';

interface PricingBreakdownProps {
  project: Project;
}

// Calculer les prix pour l'achat (prix unique)
const calculateAchatPrices = (project: Project) => {
  if (!project.projectKits) return { totalPrice: 0, totalCost: 0, totalMargin: 0 };

  let totalPrice = 0;
  let totalCost = 0;

  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit;
    if (!kit || !kit.kitProducts) return;

    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product;
      if (product) {
        const pricing = getProductPricing(product, 'achat', '1an'); // Pour l'achat, pas de notion de période
        totalPrice += (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
        totalCost += (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite;
      }
    });
  });

  return {
    totalPrice,
    totalCost,
    totalMargin: totalPrice - totalCost,
  };
};

// Calculer les prix pour la location (par période)
const calculateLocationPrices = (project: Project, period: ProductPeriod) => {
  if (!project.projectKits) return { totalPrice: 0, totalCost: 0, totalMargin: 0 };

  let totalPrice = 0;
  let totalCost = 0;

  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit;
    if (!kit || !kit.kitProducts) return;

    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product;
      if (product) {
        const pricing = getProductPricing(product, 'location', period);
        totalPrice += (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
        totalCost += (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite;
      }
    });
  });

  return {
    totalPrice,
    totalCost,
    totalMargin: totalPrice - totalCost,
  };
};

// Détail par kit pour l'achat
const getAchatKitBreakdown = (project: Project) => {
  if (!project.projectKits) return [];

  return project.projectKits
    .map((projectKit) => {
      const kit = projectKit.kit;
      if (!kit || !kit.kitProducts) return null;

      let kitTotalPrice = 0;
      let kitTotalCost = 0;

      kit.kitProducts.forEach((kitProduct) => {
        const product = kitProduct.product;
        if (product) {
          const pricing = getProductPricing(product, 'achat', '1an');
          kitTotalPrice += (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
          kitTotalCost += (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite;
        }
      });

      const kitTotalMargin = kitTotalPrice - kitTotalCost;

      return {
        kitName: kit.nom,
        quantity: projectKit.quantite,
        totalPrice: kitTotalPrice,
        totalCost: kitTotalCost,
        totalMargin: kitTotalMargin,
        marginPercentage: kitTotalPrice > 0 ? (kitTotalMargin / kitTotalPrice) * 100 : 0,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

// Détail par kit pour la location (par période)
const getLocationKitBreakdown = (project: Project, period: ProductPeriod) => {
  if (!project.projectKits) return [];

  return project.projectKits
    .map((projectKit) => {
      const kit = projectKit.kit;
      if (!kit || !kit.kitProducts) return null;

      let kitTotalPrice = 0;
      let kitTotalCost = 0;

      kit.kitProducts.forEach((kitProduct) => {
        const product = kitProduct.product;
        if (product) {
          const pricing = getProductPricing(product, 'location', period);
          kitTotalPrice += (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
          kitTotalCost += (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite;
        }
      });

      const kitTotalMargin = kitTotalPrice - kitTotalCost;

      return {
        kitName: kit.nom,
        quantity: projectKit.quantite,
        totalPrice: kitTotalPrice,
        totalCost: kitTotalCost,
        totalMargin: kitTotalMargin,
        marginPercentage: kitTotalPrice > 0 ? (kitTotalMargin / kitTotalPrice) * 100 : 0,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

export function PricingBreakdown({ project }: PricingBreakdownProps) {
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat');
  const [selectedPeriod, setSelectedPeriod] = useState<ProductPeriod>('1an');

  // Calculs basés sur le mode sélectionné
  const achatData = calculateAchatPrices(project);
  const locationData = selectedMode === 'location' ? calculateLocationPrices(project, selectedPeriod) : null;
  
  const currentData = selectedMode === 'achat' ? achatData : locationData || { totalPrice: 0, totalCost: 0, totalMargin: 0 };
  const marginPercentage = currentData.totalPrice > 0 ? (currentData.totalMargin / currentData.totalPrice) * 100 : 0;

  const kitBreakdown = selectedMode === 'achat' 
    ? getAchatKitBreakdown(project)
    : getLocationKitBreakdown(project, selectedPeriod);

  const averagePricePerKit = kitBreakdown.length > 0 ? currentData.totalPrice / kitBreakdown.length : 0;

  const periodLabels = {
    '1an': '1 an',
    '2ans': '2 ans',
    '3ans': '3 ans',
  };

  return (
    <div className="space-y-6">
      {/* Sous-onglets pour organiser le contenu */}
      <Tabs defaultValue="comparison" className="space-y-8">
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 text-gray-500 shadow-lg border border-gray-200/50 backdrop-blur-sm min-w-full lg:min-w-0">
              <div className="flex space-x-1 w-full lg:w-auto">
                <TabsTrigger 
                  value="comparison"
                  className="relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80 
                  hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300"></div>
                  <GitCompare className="w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200" />
                  <span className="text-sm font-medium">Comparaison</span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-12 transition-all duration-300"></div>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="detailed"
                  className="relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30C1BD] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 
                  data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-gray-200/80 
                  hover:bg-white/60 min-w-0 flex-1 lg:flex-initial lg:min-w-max group"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#30C1BD]/0 to-blue-500/0 opacity-0 group-data-[state=active]:opacity-5 transition-opacity duration-300"></div>
                  <FileText className="w-4 h-4 mr-2 group-data-[state=active]:text-[#30C1BD] transition-colors duration-200" />
                  <span className="text-sm font-medium">Analyse détaillée</span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#30C1BD] to-blue-500 rounded-full group-data-[state=active]:w-12 transition-all duration-300"></div>
                </TabsTrigger>
              </div>
            </TabsList>
          </div>
        </div>

        {/* Onglet Comparaison */}
        <TabsContent value="comparison" className="space-y-6 mt-8">
          <PurchaseRentalComparison project={project} />
        </TabsContent>

        {/* Onglet Analyse détaillée */}
        <TabsContent value="detailed" className="space-y-6 mt-8">
          {/* Sélecteur de mode avec design moderne */}
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
              <Euro className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-base font-semibold text-gray-900">Mode de commercialisation</span>
          </div>
          <div className="flex space-x-3 p-1 bg-gray-100 rounded-2xl">
            <Button
              variant={selectedMode === 'achat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('achat')}
              className={`flex items-center gap-2 ${
                selectedMode === 'achat' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Achat
            </Button>
            <Button
              variant={selectedMode === 'location' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('location')}
              className={`flex items-center gap-2 ${
                selectedMode === 'location' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              Location
            </Button>
          </div>
        </div>

        {/* Sélecteur de période uniquement pour la location */}
        {selectedMode === 'location' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-base font-semibold text-gray-900">Période de location</span>
              </div>
              <div className="flex space-x-3 p-1 bg-gray-100 rounded-2xl">
                {(['1an', '2ans', '3ans'] as ProductPeriod[]).map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                    className={selectedPeriod === period ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''}
                  >
                    {periodLabels[period]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vue d'ensemble des prix */}
      <motion.div
        key={`overview-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-elegant transition-all duration-300 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/[0.02] to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <Euro className="w-8 h-8 text-green-600" />
            </div>
            {selectedMode === 'location' ? (
              <LocationPriceDisplay
                annualPrice={currentData.totalPrice}
                label={`Prix total location`}
                variant="card"
                priceClassName="text-green-900 text-4xl"
                secondaryClassName="text-green-600"
                labelClassName="text-green-700 text-base font-semibold"
                badgeClassName="border-green-500 text-green-600 bg-green-50"
                secondaryBadgeClassName="border-green-300 text-green-500 bg-green-50"
              />
            ) : (
              <>
                <div className="text-4xl font-bold text-green-900 mb-2">
                  {formatPriceHelper(currentData.totalPrice)}
                </div>
                <div className="text-base text-green-700 font-semibold">
                  Prix total (Achat)
                </div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-elegant transition-all duration-300 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
            {selectedMode === 'location' ? (
              <LocationPriceDisplay
                annualPrice={currentData.totalCost}
                label="Coût total"
                variant="card"
                priceClassName="text-blue-900 text-4xl"
                secondaryClassName="text-blue-600"
                labelClassName="text-blue-700 text-base font-semibold"
                badgeClassName="border-blue-500 text-blue-600 bg-blue-50"
                secondaryBadgeClassName="border-blue-300 text-blue-500 bg-blue-50"
              />
            ) : (
              <>
                <div className="text-4xl font-bold text-blue-900 mb-2">
                  {formatPriceHelper(currentData.totalCost)}
                </div>
                <div className="text-base text-blue-700 font-semibold">Coût total</div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2, scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-elegant transition-all duration-300 group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-violet-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            {selectedMode === 'location' ? (
              <LocationPriceDisplay
                annualPrice={currentData.totalMargin}
                label="Marge totale"
                variant="card"
                priceClassName="text-purple-900 text-4xl"
                secondaryClassName="text-purple-600"
                labelClassName="text-purple-700 text-base font-semibold"
                badgeClassName="border-purple-500 text-purple-600 bg-purple-50"
                secondaryBadgeClassName="border-purple-300 text-purple-500 bg-purple-50"
              />
            ) : (
              <>
                <div className="text-4xl font-bold text-purple-900 mb-2">
                  {formatPriceHelper(currentData.totalMargin)}
                </div>
                <div className="text-base text-purple-700 font-semibold">Marge totale</div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Analyse de rentabilité */}
      <motion.div
        key={`profitability-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Percent className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900">Rentabilité du projet</h3>
                  <p className="text-sm text-amber-700 font-medium">
                    {selectedMode === 'achat' 
                      ? 'Analyse pour l\'achat de produits neufs' 
                      : `Analyse pour la location ${periodLabels[selectedPeriod].toLowerCase()}`
                    }
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm font-semibold px-4 py-2 bg-white border-amber-300 text-amber-800">
                {selectedMode === 'achat' ? 'Achat unique' : periodLabels[selectedPeriod]}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-amber-200 shadow-sm">
                  <span className="text-sm font-medium text-amber-800">Marge brute</span>
                  <span className="text-xl font-bold text-amber-900">{marginPercentage.toFixed(1)}%</span>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
                  <Progress
                    value={Math.min(marginPercentage, 100)}
                    className="h-4 bg-amber-100"
                  />
                </div>

                <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
                  <div className="text-sm text-amber-700 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Coût</span>
                      <div className="text-right">
                        <span className="font-semibold text-amber-900">{formatPriceHelper(selectedMode === 'location' ? annualToMonthly(currentData.totalCost) : currentData.totalCost)}</span>
                        {selectedMode === 'location' && <span className="text-xs text-amber-600 ml-1">/mois</span>}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Marge</span>
                      <div className="text-right">
                        <span className="font-semibold text-amber-900">{formatPriceHelper(selectedMode === 'location' ? annualToMonthly(currentData.totalMargin) : currentData.totalMargin)}</span>
                        {selectedMode === 'location' && <span className="text-xs text-amber-600 ml-1">/mois</span>}
                      </div>
                    </div>
                    <div className="h-px bg-amber-200"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Prix de vente</span>
                      <div className="text-right">
                        <span className="font-bold text-amber-900">{formatPriceHelper(selectedMode === 'location' ? annualToMonthly(currentData.totalPrice) : currentData.totalPrice)}</span>
                        {selectedMode === 'location' && <span className="text-xs text-amber-600 ml-1">/mois</span>}
                      </div>
                    </div>
                    {selectedMode === 'location' && (
                      <div className="text-xs text-amber-500 text-right pt-1">
                        {formatPriceHelper(currentData.totalPrice)} /an
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-white to-amber-50 border border-amber-200 rounded-2xl shadow-sm">
                  {selectedMode === 'location' ? (
                    <LocationPriceDisplay
                      annualPrice={averagePricePerKit}
                      label="Prix moyen par kit"
                      variant="card"
                      priceClassName="text-amber-900 text-3xl"
                      secondaryClassName="text-amber-600"
                      labelClassName="text-amber-700"
                      badgeClassName="border-amber-500 text-amber-600 bg-amber-50"
                      secondaryBadgeClassName="border-amber-300 text-amber-500 bg-amber-50"
                    />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-amber-900 mb-2">
                        {formatPriceHelper(averagePricePerKit)}
                      </div>
                      <div className="text-sm text-amber-700 font-medium">Prix moyen par kit</div>
                    </>
                  )}
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-white to-amber-50 border border-amber-200 rounded-2xl shadow-sm">
                  <div className="text-3xl font-bold text-amber-900 mb-2">{kitBreakdown.length}</div>
                  <div className="text-sm text-amber-700 font-medium">Nombre de kits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Détail par kit */}
      <motion.div
        key={`kits-detail-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <span>Détail des prix par kit</span>
              </div>
              <Badge variant="outline" className="text-xs bg-white">
                {selectedMode === 'achat' 
                  ? 'Mode Achat' 
                  : `Location ${periodLabels[selectedPeriod]}`
                }
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kitBreakdown.length > 0 ? (
              <div className="space-y-4">
                {kitBreakdown.map((kit, index) => (
                  <motion.div
                    key={`${kit.kitName}-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{kit.kitName}</h4>
                          <p className="text-sm text-gray-500">Quantité: {kit.quantity}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-sm font-medium ${
                          kit.marginPercentage > 30 
                            ? 'border-green-500 text-green-700 bg-green-50' 
                            : kit.marginPercentage > 20 
                            ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                            : 'border-red-500 text-red-700 bg-red-50'
                        }`}
                      >
                        {kit.marginPercentage.toFixed(1)}% marge
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl">
                        {selectedMode === 'location' ? (
                          <LocationPriceDisplay
                            annualPrice={kit.totalPrice}
                            label="Prix total"
                            variant="card"
                            priceClassName="text-green-900 text-lg"
                            secondaryClassName="text-green-600 text-xs"
                            labelClassName="text-green-700 text-xs"
                            badgeClassName="border-green-500 text-green-600 bg-green-50 text-[10px] px-1 py-0"
                            secondaryBadgeClassName="border-green-300 text-green-500 bg-green-50"
                          />
                        ) : (
                          <>
                            <div className="text-lg font-bold text-green-900 mb-1">
                              {formatPriceHelper(kit.totalPrice)}
                            </div>
                            <div className="text-xs text-green-700 font-medium">Prix total</div>
                          </>
                        )}
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                        {selectedMode === 'location' ? (
                          <LocationPriceDisplay
                            annualPrice={kit.totalCost}
                            label="Coût total"
                            variant="card"
                            priceClassName="text-blue-900 text-lg"
                            secondaryClassName="text-blue-600 text-xs"
                            labelClassName="text-blue-700 text-xs"
                            badgeClassName="border-blue-500 text-blue-600 bg-blue-50 text-[10px] px-1 py-0"
                            secondaryBadgeClassName="border-blue-300 text-blue-500 bg-blue-50"
                          />
                        ) : (
                          <>
                            <div className="text-lg font-bold text-blue-900 mb-1">
                              {formatPriceHelper(kit.totalCost)}
                            </div>
                            <div className="text-xs text-blue-700 font-medium">Coût total</div>
                          </>
                        )}
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 rounded-xl">
                        {selectedMode === 'location' ? (
                          <LocationPriceDisplay
                            annualPrice={kit.totalMargin}
                            label="Marge"
                            variant="card"
                            priceClassName="text-purple-900 text-lg"
                            secondaryClassName="text-purple-600 text-xs"
                            labelClassName="text-purple-700 text-xs"
                            badgeClassName="border-purple-500 text-purple-600 bg-purple-50 text-[10px] px-1 py-0"
                            secondaryBadgeClassName="border-purple-300 text-purple-500 bg-purple-50"
                          />
                        ) : (
                          <>
                            <div className="text-lg font-bold text-purple-900 mb-1">
                              {formatPriceHelper(kit.totalMargin)}
                            </div>
                            <div className="text-xs text-purple-700 font-medium">Marge</div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Aucun kit configuré pour ce projet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Comparaison des périodes (uniquement pour la location) */}
      {selectedMode === 'location' && (
        <motion.div
          key="location-comparison"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Comparaison des périodes de location</span>
                </div>
                <Badge variant="outline" className="text-xs bg-white">Mode Location</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Période</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Prix /mois</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Coût /mois</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Marge /mois</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Marge %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(['1an', '2ans', '3ans'] as ProductPeriod[]).map((period) => {
                      const prices = calculateLocationPrices(project, period);
                      const marginPercent = prices.totalPrice > 0 ? (prices.totalMargin / prices.totalPrice) * 100 : 0;

                      return (
                        <tr
                          key={period}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            selectedPeriod === period ? 'bg-[#30C1BD]/5' : ''
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {selectedPeriod === period && (
                                <div className="w-2 h-2 bg-[#30C1BD] rounded-full"></div>
                              )}
                              <span className="font-medium">{periodLabels[period]}</span>
                            </div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className="font-semibold">{formatPriceHelper(annualToMonthly(prices.totalPrice))}</div>
                            <div className="text-xs text-gray-400">{formatPriceHelper(prices.totalPrice)} /an</div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className="text-gray-600">{formatPriceHelper(annualToMonthly(prices.totalCost))}</div>
                            <div className="text-xs text-gray-400">{formatPriceHelper(prices.totalCost)} /an</div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <div className="text-green-600 font-medium">{formatPriceHelper(annualToMonthly(prices.totalMargin))}</div>
                            <div className="text-xs text-gray-400">{formatPriceHelper(prices.totalMargin)} /an</div>
                          </td>
                          <td className="text-right py-4 px-4">
                            <Badge
                              variant="outline"
                              className={`font-medium ${
                                marginPercent > 30
                                  ? 'border-green-500 text-green-700 bg-green-50'
                                  : marginPercent > 20
                                  ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                                  : 'border-red-500 text-red-700 bg-red-50'
                              }`}
                            >
                              {marginPercent.toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Insights et recommandations */}
      <motion.div
        key={`insights-${selectedMode}-${selectedMode === 'location' ? selectedPeriod : 'achat'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 rounded-2xl shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-indigo-900 mb-4">
                  Analyse et recommandations
                </h3>
                <div className="space-y-3 text-sm text-indigo-800">
                  {marginPercentage > 30 ? (
                    <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-white/50">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">
                        Excellente rentabilité ! Votre marge de {marginPercentage.toFixed(1)}% est très bonne.
                      </span>
                    </div>
                  ) : marginPercentage > 20 ? (
                    <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-white/50">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">
                        Rentabilité correcte. Considérez optimiser les coûts pour améliorer la marge.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-white/50">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">
                        Marge faible. Analysez les coûts et considérez ajuster les prix.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-white/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="font-medium">
                      Prix moyen par kit : {formatPriceHelper(averagePricePerKit)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-white/50">
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span className="font-medium">
                      {selectedMode === 'achat'
                        ? `Coût total pour l'achat : ${formatPriceHelper(currentData.totalCost)}`
                        : `Coût total pour la location ${periodLabels[selectedPeriod].toLowerCase()} : ${formatPriceHelper(currentData.totalCost)}`
                      }
                    </span>
                  </div>

                  {kitBreakdown.length > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-white/50">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium">
                        Kit le plus rentable : {
                          kitBreakdown.reduce((max, kit) =>
                            kit.marginPercentage > max.marginPercentage ? kit : max
                          )?.kitName || 'N/A'
                        }
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-white/50">
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <span className="font-medium">
                      {selectedMode === 'achat'
                        ? 'Achat de produits neufs avec impact environnemental complet'
                        : 'Location d\'équipements existants avec impact environnemental réduit'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}