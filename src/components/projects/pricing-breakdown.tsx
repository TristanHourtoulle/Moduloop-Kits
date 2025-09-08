"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Euro,
  Package,
  TrendingUp,
  Calculator,
  Percent,
  Calendar,
  BarChart3,
  Info,
  ShoppingCart,
  Home,
} from "lucide-react";
import { Project } from "@/lib/types/project";
import { type PurchaseRentalMode, type ProductPeriod } from "@/lib/schemas/product";
import { 
  getProductPricing, 
  getDefaultProductMode,
  formatPrice as formatPriceHelper,
} from "@/lib/utils/product-helpers";

interface PricingBreakdownProps {
  project: Project;
}


const getKitPriceBreakdown = (project: Project, period: ProductPeriod = '1an', mode: PurchaseRentalMode = 'achat') => {
  if (!project.projectKits) return [];

  return project.projectKits
    .map((projectKit) => {
      const kit = projectKit.kit;
      if (!kit || !kit.kitProducts) return null;

      let kitTotalPrice = 0;
      let kitTotalCost = 0;
      let kitTotalMargin = 0;

      kit.kitProducts.forEach((kitProduct) => {
        const product = kitProduct.product;
        if (product) {
          // Utiliser les nouveaux helpers pour les prix
          const pricing = getProductPricing(product, mode, period);
          
          const productPrice = (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
          const productCost = (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite;
          
          kitTotalPrice += productPrice;
          kitTotalCost += productCost;
        }
      });

      kitTotalMargin = kitTotalPrice - kitTotalCost;

      return {
        kitName: kit.nom,
        quantity: projectKit.quantite,
        totalPrice: kitTotalPrice,
        totalCost: kitTotalCost,
        totalMargin: kitTotalMargin,
        marginPercentage:
          kitTotalPrice > 0 ? (kitTotalMargin / kitTotalPrice) * 100 : 0,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
};

const calculateTotalPrices = (project: Project, period: ProductPeriod = '1an', mode: PurchaseRentalMode = 'achat') => {
  if (!project.projectKits) return { totalPrice: 0, totalCost: 0, totalMargin: 0 };
  
  let totalPrice = 0;
  let totalCost = 0;
  
  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit;
    if (!kit || !kit.kitProducts) return;
    
    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product;
      if (product) {
        const pricing = getProductPricing(product, mode, period);
        totalPrice += (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
        totalCost += (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite;
      }
    });
  });
  
  return {
    totalPrice,
    totalCost,
    totalMargin: totalPrice - totalCost
  };
};

export function PricingBreakdown({ project }: PricingBreakdownProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ProductPeriod>('1an');
  const [selectedMode, setSelectedMode] = useState<PurchaseRentalMode>('achat');
  
  const { totalPrice, totalCost, totalMargin } = calculateTotalPrices(project, selectedPeriod, selectedMode);
  const marginPercentage = totalPrice > 0 ? (totalMargin / totalPrice) * 100 : 0;
  
  const kitBreakdown = getKitPriceBreakdown(project, selectedPeriod, selectedMode);
  const averagePricePerKit = kitBreakdown.length > 0 ? totalPrice / kitBreakdown.length : 0;
  
  const periodLabels = {
    '1an': '1 an',
    '2ans': '2 ans',
    '3ans': '3 ans'
  };

  return (
    <div className="space-y-6">
      {/* Sélecteurs de mode et période */}
      <div className="flex flex-col space-y-4 mb-6">
        {/* Sélecteur de mode achat/location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Mode de commercialisation</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={selectedMode === 'achat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('achat')}
              className={`flex items-center gap-2 ${selectedMode === 'achat' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''}`}
            >
              <ShoppingCart className="w-4 h-4" />
              Achat
            </Button>
            <Button
              variant={selectedMode === 'location' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMode('location')}
              className={`flex items-center gap-2 ${selectedMode === 'location' ? 'bg-[#30C1BD] hover:bg-[#30C1BD]/90' : ''}`}
            >
              <Home className="w-4 h-4" />
              Location
            </Button>
          </div>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Période</span>
          </div>
          <div className="flex space-x-2">
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
      
      {/* Vue d'ensemble des prix */}
      <motion.div 
        key={`${selectedPeriod}-${selectedMode}`}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {formatPriceHelper(totalPrice)}
            </div>
            <div className="text-sm text-green-600">Prix total ({selectedMode === 'achat' ? 'Achat' : 'Location'})</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {formatPriceHelper(totalCost)}
            </div>
            <div className="text-sm text-blue-600">Coût total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-900 mb-1">
              {formatPriceHelper(totalMargin)}
            </div>
            <div className="text-sm text-purple-600">Marge totale</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Marge et rentabilité */}
      <motion.div 
        key={`margin-${selectedPeriod}-${selectedMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Percent className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    Rentabilité du projet
                  </h3>
                  <p className="text-sm text-amber-600">
                    Marge et indicateurs pour {selectedMode === 'achat' ? 'Achat' : 'Location'} - {periodLabels[selectedPeriod]}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm font-medium">
                {periodLabels[selectedPeriod]}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-amber-700">Marge brute</span>
                  <span className="font-semibold text-amber-900">
                    {marginPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(marginPercentage, 100)}
                  className="h-2 bg-amber-100"
                />

                <div className="pt-2">
                  <div className="text-xs text-amber-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Coût</span>
                      <span>{formatPriceHelper(totalCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marge</span>
                      <span>{formatPriceHelper(totalMargin)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Prix de vente</span>
                      <span>{formatPriceHelper(totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-center p-4 bg-amber-100 rounded-lg">
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {formatPriceHelper(averagePricePerKit)}
                  </div>
                  <div className="text-sm text-amber-700">
                    Prix moyen par kit
                  </div>
                </div>

                <div className="text-center p-4 bg-amber-100 rounded-lg">
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {kitBreakdown.length}
                  </div>
                  <div className="text-sm text-amber-700">Nombre de kits</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Détail par kit */}
      <motion.div 
        key={`kits-${selectedPeriod}-${selectedMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Détail des prix par kit</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {selectedMode === 'achat' ? 'Achat' : 'Location'} - {periodLabels[selectedPeriod]}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kitBreakdown.map((kit, index) => (
                <motion.div
                  key={`${index}-${selectedPeriod}-${selectedMode}`}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {kit.kitName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantité: {kit.quantity}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {kit.marginPercentage.toFixed(1)}% marge
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">
                        {formatPriceHelper(kit.totalPrice)}
                      </div>
                      <div className="text-gray-500">Prix total</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">
                        {formatPriceHelper(kit.totalCost)}
                      </div>
                      <div className="text-gray-500">Coût total</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">
                        {formatPriceHelper(kit.totalMargin)}
                      </div>
                      <div className="text-gray-500">Marge</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tableau comparatif des périodes */}
      <motion.div
        key={`comparison-${selectedMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Comparaison des périodes</span>
              </div>
              <Badge variant="outline" className="text-xs">
                Mode {selectedMode === 'achat' ? 'Achat' : 'Location'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Période</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-700">Prix total</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-700">Coût total</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-700">Marge</th>
                    <th className="text-right py-2 px-4 font-medium text-gray-700">Marge %</th>
                  </tr>
                </thead>
                <tbody>
                  {(['1an', '2ans', '3ans'] as ProductPeriod[]).map((period) => {
                    const prices = calculateTotalPrices(project, period, selectedMode);
                    const marginPercent = prices.totalPrice > 0 
                      ? (prices.totalMargin / prices.totalPrice) * 100 
                      : 0;
                    
                    return (
                      <tr 
                        key={period} 
                        className={`border-b hover:bg-gray-50 ${selectedPeriod === period ? 'bg-[#30C1BD]/5' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {selectedPeriod === period && (
                              <div className="w-2 h-2 bg-[#30C1BD] rounded-full"></div>
                            )}
                            <span className="font-medium">{periodLabels[period]}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {formatPriceHelper(prices.totalPrice)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-600">
                          {formatPriceHelper(prices.totalCost)}
                        </td>
                        <td className="text-right py-3 px-4 text-green-600 font-medium">
                          {formatPriceHelper(prices.totalMargin)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge 
                            variant="outline" 
                            className={`
                              ${marginPercent > 30 ? 'border-green-500 text-green-700' : ''}
                              ${marginPercent > 20 && marginPercent <= 30 ? 'border-yellow-500 text-yellow-700' : ''}
                              ${marginPercent <= 20 ? 'border-red-500 text-red-700' : ''}
                            `}
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
            
            {/* Note informative */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="mb-1">
                    <strong>Mode {selectedMode === 'achat' ? 'Achat' : 'Location'}</strong> : Les prix affichés correspondent aux données spécifiques à ce mode de commercialisation.
                  </p>
                  <p>
                    Les prix sur 2 et 3 ans sont calculés automatiquement si non définis spécifiquement. Pour des tarifs personnalisés, configurez les prix dans chaque produit.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights et recommandations */}
      <motion.div 
        key={`insights-${selectedPeriod}-${selectedMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-indigo-800 mb-2">
                  Insights et recommandations pour {selectedMode === 'achat' ? 'Achat' : 'Location'} - {periodLabels[selectedPeriod]}
                </h3>
                <div className="space-y-2 text-sm text-indigo-700">
                  {marginPercentage > 30 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>
                        Excellente rentabilité ! Votre marge de{" "}
                        {marginPercentage.toFixed(1)}% est très bonne.
                      </span>
                    </div>
                  ) : marginPercentage > 20 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>
                        Rentabilité correcte. Considérez optimiser les coûts
                        pour améliorer la marge.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>
                        Marge faible. Analysez les coûts et considérez ajuster
                        les prix.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>
                      Prix moyen par kit ({selectedMode === 'achat' ? 'Achat' : 'Location'} - {periodLabels[selectedPeriod]}): {formatPriceHelper(averagePricePerKit)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>
                      Coût total sur {periodLabels[selectedPeriod]} ({selectedMode === 'achat' ? 'Achat' : 'Location'}): {formatPriceHelper(totalCost)}
                    </span>
                  </div>

                  {kitBreakdown.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>
                        Kit le plus rentable en {selectedMode === 'achat' ? 'achat' : 'location'}:{" "}
                        {kitBreakdown.reduce((max, kit) =>
                          kit.marginPercentage > max.marginPercentage
                            ? kit
                            : max
                        )?.kitName || "N/A"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>
                      {selectedMode === 'achat' 
                        ? 'Prix d\'achat de produits neufs avec impact environnemental complet'
                        : 'Prix de location d\'équipements existants avec impact environnemental réduit'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
