'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Euro,
  ShoppingCart,
  Home,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calculator,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  Recycle,
  DollarSign,
  Calendar,
  Lightbulb
} from 'lucide-react';
import { Project } from '@/lib/types/project';
import { type ProductPeriod } from '@/lib/schemas/product';
import {
  getProductPricing,
  formatPrice as formatPriceHelper,
  annualToMonthly,
} from '@/lib/utils/product-helpers';

interface PurchaseRentalComparisonProps {
  project: Project;
}

// Calculate purchase costs (one-time)
const calculatePurchaseCosts = (project: Project) => {
  if (!project.projectKits) return { totalPrice: 0, totalCost: 0, totalMargin: 0 };

  let totalPrice = 0;
  let totalCost = 0;

  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit;
    if (!kit || !kit.kitProducts) return;

    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product;
      if (product) {
        const pricing = getProductPricing(product, 'achat', '1an');
        totalPrice += (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
        totalCost += (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite;
      }
    });
  });

  return { totalPrice, totalCost, totalMargin: totalPrice - totalCost };
};

// Calculate rental costs for different periods
const calculateRentalCosts = (project: Project, period: ProductPeriod) => {
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

  return { totalPrice, totalCost, totalMargin: totalPrice - totalCost };
};

// Calculate break-even point
const calculateBreakEvenPoint = (project: Project) => {
  const purchaseCost = calculatePurchaseCosts(project);
  const rental1Year = calculateRentalCosts(project, '1an');
  
  if (rental1Year.totalPrice === 0) return null;
  
  const breakEvenYears = purchaseCost.totalPrice / rental1Year.totalPrice;
  return breakEvenYears;
};

export function PurchaseRentalComparison({ project }: PurchaseRentalComparisonProps) {
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState(3);

  const purchaseData = calculatePurchaseCosts(project);
  const rental1Year = calculateRentalCosts(project, '1an');
  const rental2Years = calculateRentalCosts(project, '2ans');
  const rental3Years = calculateRentalCosts(project, '3ans');

  const breakEvenPoint = calculateBreakEvenPoint(project);

  const getRentalDataForHorizon = (years: number) => {
    if (years <= 1) return rental1Year;
    if (years <= 2) return rental2Years;
    return rental3Years;
  };

  const currentRentalData = getRentalDataForHorizon(selectedTimeHorizon);

  const getProjectedCosts = (years: number) => {
    const purchaseCostTotal = purchaseData.totalPrice;
    const rentalData = getRentalDataForHorizon(years);
    const rentalCostPerYear = rentalData.totalPrice;
    const rentalCostTotal = rentalCostPerYear * years;

    return {
      purchase: purchaseCostTotal,
      rental: rentalCostTotal,
      savings: purchaseCostTotal - rentalCostTotal
    };
  };

  const projectedCosts = getProjectedCosts(selectedTimeHorizon);
  const isRentalBetter = projectedCosts.savings > 0;

  // Purchase advantages
  const purchaseAdvantages = [
    { icon: DollarSign, text: "Propriété complète de l'équipement" },
    { icon: TrendingUp, text: "Pas de coûts récurrents après l'achat" },
    { icon: Shield, text: "Contrôle total sur l'équipement" },
    { icon: Calendar, text: "Utilisation illimitée dans le temps" },
    { icon: Zap, text: "Potentiel de revente en fin de vie" }
  ];

  const purchaseDisadvantages = [
    { icon: AlertCircle, text: "Investissement initial important" },
    { icon: XCircle, text: "Responsabilité maintenance et réparations" },
    { icon: Clock, text: "Obsolescence technologique à votre charge" },
    { icon: Euro, text: "Immobilisation de capital importante" }
  ];

  // Rental advantages  
  const rentalAdvantages = [
    { icon: Euro, text: "Coût initial faible, étalement des paiements" },
    { icon: Shield, text: "Maintenance incluse dans le service" },
    { icon: Zap, text: "Flexibilité et mise à niveau possible" },
    { icon: Recycle, text: "Impact environnemental réduit" },
    { icon: Calculator, text: "Coûts prévisibles et budgétables" }
  ];

  const rentalDisadvantages = [
    { icon: TrendingUp, text: "Coût total plus élevé sur le long terme" },
    { icon: XCircle, text: "Pas de propriété de l'équipement" },
    { icon: Calendar, text: "Contraintes contractuelles de durée" },
    { icon: AlertCircle, text: "Dépendance au fournisseur" }
  ];

  const timeHorizons = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Comparaison Achat vs Location</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Analysez les deux options pour faire le meilleur choix selon vos besoins et votre situation financière
        </p>
      </div>

      {/* Time Horizon Selector - Moved to top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              Horizon temporel d'analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 justify-center">
              {timeHorizons.map((years) => (
                <Button
                  key={years}
                  variant={selectedTimeHorizon === years ? 'default' : 'outline'}
                  onClick={() => setSelectedTimeHorizon(years)}
                  className={selectedTimeHorizon === years ? 'bg-purple-500 hover:bg-purple-600' : ''}
                >
                  {years} an{years > 1 ? 's' : ''}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Purchase Option */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-green-900">Achat</CardTitle>
                </div>
                {!isRentalBetter && breakEvenPoint && selectedTimeHorizon > breakEvenPoint && (
                  <Badge className="bg-green-500 text-white">Recommandé</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-900 mb-2">
                  {formatPriceHelper(projectedCosts.purchase)}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Coût total sur {selectedTimeHorizon} an{selectedTimeHorizon > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/60 rounded-xl p-4 border border-white/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-green-800">Coût d'acquisition (unique)</span>
                    <span className="font-bold text-green-900">{formatPriceHelper(purchaseData.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-800">Coût sur {selectedTimeHorizon} an{selectedTimeHorizon > 1 ? 's' : ''}</span>
                    <span className="font-bold text-green-900">{formatPriceHelper(projectedCosts.purchase)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Avantages
                  </h4>
                  <div className="space-y-2">
                    {purchaseAdvantages.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-green-800">
                        <advantage.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{advantage.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Inconvénients
                  </h4>
                  <div className="space-y-2">
                    {purchaseDisadvantages.map((disadvantage, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-green-700">
                        <disadvantage.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{disadvantage.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rental Option */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-blue-900">Location</CardTitle>
                </div>
                {isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint && (
                  <Badge className="bg-blue-500 text-white">Recommandé</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-4xl font-bold text-blue-900">
                    {formatPriceHelper(projectedCosts.rental / (selectedTimeHorizon * 12))}
                  </span>
                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-400 text-blue-600 bg-blue-50">
                    /mois
                  </Badge>
                </div>
                <div className="text-sm text-blue-500 mb-2">
                  {formatPriceHelper(projectedCosts.rental)} total sur {selectedTimeHorizon} an{selectedTimeHorizon > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/60 rounded-xl p-4 border border-white/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">Coût mensuel</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-900">{formatPriceHelper(annualToMonthly(currentRentalData.totalPrice))}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-400 text-blue-600 bg-blue-50">
                        /mois
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-blue-600">
                    <span>Coût annuel</span>
                    <span>{formatPriceHelper(currentRentalData.totalPrice)} /an</span>
                  </div>
                  <div className="h-px bg-blue-200/50"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">Coût sur {selectedTimeHorizon} an{selectedTimeHorizon > 1 ? 's' : ''}</span>
                    <span className="font-bold text-blue-900">{formatPriceHelper(projectedCosts.rental)}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Avantages
                  </h4>
                  <div className="space-y-2">
                    {rentalAdvantages.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-blue-800">
                        <advantage.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{advantage.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Inconvénients
                  </h4>
                  <div className="space-y-2">
                    {rentalDisadvantages.map((disadvantage, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-blue-700">
                        <disadvantage.icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{disadvantage.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Break-Even Analysis */}
      {breakEvenPoint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                Analyse de rentabilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-amber-900">
                  {breakEvenPoint.toFixed(1)} ans
                </div>
                <div className="text-sm text-amber-700">
                  Point d'équilibre entre achat et location
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/60 rounded-xl border border-white/50">
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {formatPriceHelper(Math.abs(projectedCosts.savings))}
                  </div>
                  <div className="text-sm text-amber-700">
                    {projectedCosts.savings >= 0 ? 'Économies' : 'Surcoût'} sur {selectedTimeHorizon} ans
                  </div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl border border-white/50">
                  <div className="text-2xl font-bold text-amber-900 mb-1">
                    {((Math.abs(projectedCosts.savings) / projectedCosts.purchase) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-amber-700">
                    {projectedCosts.savings >= 0 ? 'Économie' : 'Surcoût'} relatif
                  </div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl border border-white/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <span className="text-2xl font-bold text-amber-900">
                      {formatPriceHelper(annualToMonthly(currentRentalData.totalPrice))}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600 bg-amber-50">
                      /mois
                    </Badge>
                  </div>
                  <div className="text-sm text-amber-700">Coût mensuel location</div>
                  <div className="text-xs text-amber-500 mt-0.5">{formatPriceHelper(currentRentalData.totalPrice)} /an</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Smart Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl">
                <Lightbulb className="w-5 h-5 text-indigo-600" />
              </div>
              Recommandation intelligente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-6 rounded-xl border-2 ${
              isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                ? 'border-blue-300 bg-blue-50'
                : 'border-green-300 bg-green-50'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl ${
                  isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                    ? 'bg-blue-100'
                    : 'bg-green-100'
                }`}>
                  {isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint ? (
                    <Home className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${
                    isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                      ? 'text-blue-900'
                      : 'text-green-900'
                  }`}>
                    {isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                      ? 'Location recommandée'
                      : 'Achat recommandé'
                    }
                  </h3>
                  <p className={`text-sm mb-4 ${
                    isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                      ? 'text-blue-800'
                      : 'text-green-800'
                  }`}>
                    {isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                      ? `Pour un projet de ${selectedTimeHorizon} ans, la location vous permet d'économiser ${formatPriceHelper(Math.abs(projectedCosts.savings))} tout en conservant votre flexibilité financière.`
                      : `Sur ${selectedTimeHorizon} ans, l'achat vous permet d'économiser ${formatPriceHelper(Math.abs(projectedCosts.savings))} et vous offre la propriété complète de l'équipement.`
                    }
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      className={
                        isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }
                    >
                      {isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                        ? 'Opter pour la location'
                        : 'Procéder à l\'achat'
                      }
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline">
                      Obtenir un devis détaillé
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                <h4 className="font-semibold text-indigo-900 mb-2">Contexte de projet</h4>
                <ul className="space-y-1 text-indigo-800">
                  <li>• {project.projectKits?.length || 0} types de kits configurés</li>
                  <li>• Durée d'analyse : {selectedTimeHorizon} an{selectedTimeHorizon > 1 ? 's' : ''}</li>
                  <li>• {breakEvenPoint ? `Point d'équilibre : ${breakEvenPoint.toFixed(1)} ans` : 'Pas de données de location disponibles'}</li>
                </ul>
              </div>
              <div className="p-4 bg-white/60 rounded-xl border border-white/50">
                <h4 className="font-semibold text-indigo-900 mb-2">Facteurs à considérer</h4>
                <ul className="space-y-1 text-indigo-800">
                  <li>• Capacité d'investissement initial</li>
                  <li>• Durée prévue d'utilisation</li>
                  <li>• Besoins de flexibilité</li>
                  <li>• Évolution technologique prévue</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}