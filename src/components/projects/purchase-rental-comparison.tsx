'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Lightbulb,
} from 'lucide-react'
import type { Project } from '@/lib/types/project'
import { formatPrice as formatPriceHelper, annualToMonthly } from '@/lib/utils/product-helpers'
import {
  calculateProjectPurchaseCosts,
  calculateProjectRentalCosts,
  calculateBreakEvenPoint,
} from '@/lib/utils/project/calculations'

interface PurchaseRentalComparisonProps {
  project: Project
}

/**
 * Side-by-side comparison of purchase vs rental options with break-even analysis.
 * @param props - Project data for cost calculations
 * @returns Interactive comparison view with time horizon selector and recommendation
 */
export function PurchaseRentalComparison({ project }: PurchaseRentalComparisonProps) {
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState(3)

  const purchaseData = calculateProjectPurchaseCosts(project)
  const rental1Year = calculateProjectRentalCosts(project, '1an')
  const rental2Years = calculateProjectRentalCosts(project, '2ans')
  const rental3Years = calculateProjectRentalCosts(project, '3ans')

  const breakEvenPoint = calculateBreakEvenPoint(project)

  const getRentalDataForHorizon = (years: number) => {
    if (years <= 1) return rental1Year
    if (years <= 2) return rental2Years
    return rental3Years
  }

  const currentRentalData = getRentalDataForHorizon(selectedTimeHorizon)

  const getProjectedCosts = (years: number) => {
    const purchaseCostTotal = purchaseData.totalPrice
    const rentalData = getRentalDataForHorizon(years)
    const rentalCostPerYear = rentalData.totalPrice
    const rentalCostTotal = rentalCostPerYear * years

    return {
      purchase: purchaseCostTotal,
      rental: rentalCostTotal,
      savings: purchaseCostTotal - rentalCostTotal,
    }
  }

  const projectedCosts = getProjectedCosts(selectedTimeHorizon)
  const isRentalBetter = projectedCosts.savings > 0

  // Purchase advantages
  const purchaseAdvantages = [
    { icon: DollarSign, text: "Propriété complète de l'équipement" },
    { icon: TrendingUp, text: "Pas de coûts récurrents après l'achat" },
    { icon: Shield, text: "Contrôle total sur l'équipement" },
    { icon: Calendar, text: 'Utilisation illimitée dans le temps' },
    { icon: Zap, text: 'Potentiel de revente en fin de vie' },
  ]

  const purchaseDisadvantages = [
    { icon: AlertCircle, text: 'Investissement initial important' },
    { icon: XCircle, text: 'Responsabilité maintenance et réparations' },
    { icon: Clock, text: 'Obsolescence technologique à votre charge' },
    { icon: Euro, text: 'Immobilisation de capital importante' },
  ]

  // Rental advantages
  const rentalAdvantages = [
    { icon: Euro, text: 'Coût initial faible, étalement des paiements' },
    { icon: Shield, text: 'Maintenance incluse dans le service' },
    { icon: Zap, text: 'Flexibilité et mise à niveau possible' },
    { icon: Recycle, text: 'Impact environnemental réduit' },
    { icon: Calculator, text: 'Coûts prévisibles et budgétables' },
  ]

  const rentalDisadvantages = [
    { icon: TrendingUp, text: 'Coût total plus élevé sur le long terme' },
    { icon: XCircle, text: "Pas de propriété de l'équipement" },
    { icon: Calendar, text: 'Contraintes contractuelles de durée' },
    { icon: AlertCircle, text: 'Dépendance au fournisseur' },
  ]

  const timeHorizons = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 p-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Comparaison Achat vs Location</h2>
        </div>
        <p className="mx-auto max-w-2xl text-gray-600">
          Analysez les deux options pour faire le meilleur choix selon vos besoins et votre
          situation financière
        </p>
      </div>

      {/* Time Horizon Selector - Moved to top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-2">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              Horizon temporel d&apos;analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-3">
              {timeHorizons.map((years) => (
                <Button
                  key={years}
                  variant={selectedTimeHorizon === years ? 'default' : 'outline'}
                  onClick={() => setSelectedTimeHorizon(years)}
                  className={
                    selectedTimeHorizon === years ? 'bg-purple-500 hover:bg-purple-600' : ''
                  }
                >
                  {years} an{years > 1 ? 's' : ''}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Comparison Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Purchase Option */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="h-full border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 p-3">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
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
                <div className="mb-2 text-4xl font-bold text-green-900">
                  {formatPriceHelper(projectedCosts.purchase)}
                </div>
                <div className="text-sm font-medium text-green-700">
                  Coût total sur {selectedTimeHorizon} an
                  {selectedTimeHorizon > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-white/50 bg-white/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Coût d&apos;acquisition (unique)
                    </span>
                    <span className="font-bold text-green-900">
                      {formatPriceHelper(purchaseData.totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Coût sur {selectedTimeHorizon} an
                      {selectedTimeHorizon > 1 ? 's' : ''}
                    </span>
                    <span className="font-bold text-green-900">
                      {formatPriceHelper(projectedCosts.purchase)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-900">
                    <CheckCircle className="h-4 w-4" />
                    Avantages
                  </h4>
                  <div className="space-y-2">
                    {purchaseAdvantages.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-green-800">
                        <advantage.icon className="h-4 w-4 flex-shrink-0 text-green-600" />
                        <span>{advantage.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-900">
                    <XCircle className="h-4 w-4" />
                    Inconvénients
                  </h4>
                  <div className="space-y-2">
                    {purchaseDisadvantages.map((disadvantage, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-green-700">
                        <disadvantage.icon className="h-4 w-4 flex-shrink-0 text-green-500" />
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
          <Card className="h-full border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3">
                    <Home className="h-6 w-6 text-blue-600" />
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
                <div className="mb-1 flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-blue-900">
                    {formatPriceHelper(projectedCosts.rental / (selectedTimeHorizon * 12))}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-blue-400 bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                  >
                    /mois
                  </Badge>
                </div>
                <div className="mb-2 text-sm text-blue-500">
                  {formatPriceHelper(projectedCosts.rental)} total sur {selectedTimeHorizon} an
                  {selectedTimeHorizon > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-white/50 bg-white/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">Coût mensuel</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-900">
                        {formatPriceHelper(annualToMonthly(currentRentalData.totalPrice))}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-blue-400 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-600"
                      >
                        /mois
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-blue-600">
                    <span>Coût annuel</span>
                    <span>{formatPriceHelper(currentRentalData.totalPrice)} /an</span>
                  </div>
                  <div className="h-px bg-blue-200/50"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                      Coût sur {selectedTimeHorizon} an
                      {selectedTimeHorizon > 1 ? 's' : ''}
                    </span>
                    <span className="font-bold text-blue-900">
                      {formatPriceHelper(projectedCosts.rental)}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                    <CheckCircle className="h-4 w-4" />
                    Avantages
                  </h4>
                  <div className="space-y-2">
                    {rentalAdvantages.map((advantage, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-blue-800">
                        <advantage.icon className="h-4 w-4 flex-shrink-0 text-blue-600" />
                        <span>{advantage.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900">
                    <XCircle className="h-4 w-4" />
                    Inconvénients
                  </h4>
                  <div className="space-y-2">
                    {rentalDisadvantages.map((disadvantage, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm text-blue-700">
                        <disadvantage.icon className="h-4 w-4 flex-shrink-0 text-blue-500" />
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
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-2">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                Analyse de rentabilité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="text-3xl font-bold text-amber-900">
                  {breakEvenPoint.toFixed(1)} ans
                </div>
                <div className="text-sm text-amber-700">
                  Point d&apos;équilibre entre achat et location
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-amber-900">
                    {formatPriceHelper(Math.abs(projectedCosts.savings))}
                  </div>
                  <div className="text-sm text-amber-700">
                    {projectedCosts.savings >= 0 ? 'Économies' : 'Surcoût'} sur{' '}
                    {selectedTimeHorizon} ans
                  </div>
                </div>
                <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-amber-900">
                    {((Math.abs(projectedCosts.savings) / projectedCosts.purchase) * 100).toFixed(
                      1,
                    )}
                    %
                  </div>
                  <div className="text-sm text-amber-700">
                    {projectedCosts.savings >= 0 ? 'Économie' : 'Surcoût'} relatif
                  </div>
                </div>
                <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
                  <div className="mb-1 flex items-center justify-center gap-1.5">
                    <span className="text-2xl font-bold text-amber-900">
                      {formatPriceHelper(annualToMonthly(currentRentalData.totalPrice))}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-amber-400 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-600"
                    >
                      /mois
                    </Badge>
                  </div>
                  <div className="text-sm text-amber-700">Coût mensuel location</div>
                  <div className="mt-0.5 text-xs text-amber-500">
                    {formatPriceHelper(currentRentalData.totalPrice)} /an
                  </div>
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
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 p-2">
                <Lightbulb className="h-5 w-5 text-indigo-600" />
              </div>
              Recommandation intelligente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`rounded-xl border-2 p-6 ${
                isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-green-300 bg-green-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-xl p-2 ${
                    isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                      ? 'bg-blue-100'
                      : 'bg-green-100'
                  }`}
                >
                  {isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint ? (
                    <Home className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`mb-2 text-lg font-bold ${
                      isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                        ? 'text-blue-900'
                        : 'text-green-900'
                    }`}
                  >
                    {isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                      ? 'Location recommandée'
                      : 'Achat recommandé'}
                  </h3>
                  <p
                    className={`mb-4 text-sm ${
                      isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                        ? 'text-blue-800'
                        : 'text-green-800'
                    }`}
                  >
                    {isRentalBetter && breakEvenPoint && selectedTimeHorizon < breakEvenPoint
                      ? `Pour un projet de ${selectedTimeHorizon} ans, la location vous permet d'économiser ${formatPriceHelper(Math.abs(projectedCosts.savings))} tout en conservant votre flexibilité financière.`
                      : `Sur ${selectedTimeHorizon} ans, l'achat vous permet d'économiser ${formatPriceHelper(Math.abs(projectedCosts.savings))} et vous offre la propriété complète de l'équipement.`}
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
                        : "Procéder à l'achat"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline">Obtenir un devis détaillé</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <div className="rounded-xl border border-white/50 bg-white/60 p-4">
                <h4 className="mb-2 font-semibold text-indigo-900">Contexte de projet</h4>
                <ul className="space-y-1 text-indigo-800">
                  <li>• {project.projectKits?.length || 0} types de kits configurés</li>
                  <li>
                    • Durée d&apos;analyse : {selectedTimeHorizon} an
                    {selectedTimeHorizon > 1 ? 's' : ''}
                  </li>
                  <li>
                    •{' '}
                    {breakEvenPoint
                      ? `Point d'équilibre : ${breakEvenPoint.toFixed(1)} ans`
                      : 'Pas de données de location disponibles'}
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/50 bg-white/60 p-4">
                <h4 className="mb-2 font-semibold text-indigo-900">Facteurs à considérer</h4>
                <ul className="space-y-1 text-indigo-800">
                  <li>• Capacité d&apos;investissement initial</li>
                  <li>• Durée prévue d&apos;utilisation</li>
                  <li>• Besoins de flexibilité</li>
                  <li>• Évolution technologique prévue</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
