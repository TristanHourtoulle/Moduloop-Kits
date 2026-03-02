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
import {
  formatPrice as formatPriceHelper,
  annualToMonthly,
  ceilPrice,
} from '@/lib/utils/product-helpers'
import {
  calculateProjectPurchaseCosts,
  calculateProjectRentalCosts,
  calculateBreakEvenPoint,
  calculateExtendedRentalCost,
} from '@/lib/utils/project/calculations'

const DEFAULT_MAX_HORIZON = 9
const ABSOLUTE_MAX_HORIZON = 20

const PHASE_LABELS: Record<string, string> = {
  '0-1an': '0 - 1 an',
  '1-2ans': '1 - 2 ans',
  '2-3ans': '2 - 3 ans',
  '3ans+': 'au-delà de 3 ans',
}

const PHASE_ORDER = ['0-1an', '1-2ans', '2-3ans', '3ans+'] as const

interface PurchaseRentalComparisonProps {
  project: Project
}

function formatBreakEvenDuration(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = Math.round(months % 12)

  if (remainingMonths === 0) {
    return `${years} an${years > 1 ? 's' : ''}`
  }
  if (years === 0) {
    return `${remainingMonths} mois`
  }
  return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`
}

export function PurchaseRentalComparison({ project }: PurchaseRentalComparisonProps) {
  const [selectedTimeHorizon, setSelectedTimeHorizon] = useState(3)

  const purchaseData = calculateProjectPurchaseCosts(project)
  const rental3Years = calculateProjectRentalCosts(project, '3ans')

  const breakEvenResult = calculateBreakEvenPoint(project)
  const breakEvenYears = breakEvenResult?.breakEvenYears ?? null
  const breakEvenMonths = breakEvenResult?.breakEvenMonths ?? null
  const breakEvenPhase = breakEvenResult?.phase ?? null

  const monthly3ans = annualToMonthly(rental3Years.totalPrice)
  const postThreeYearMonthly = ceilPrice(monthly3ans * 0.2)

  // Dynamic horizon: adapt slider to break-even range, cap at 20
  const dynamicMax = breakEvenYears
    ? Math.min(Math.max(Math.ceil(breakEvenYears) + 2, DEFAULT_MAX_HORIZON), ABSOLUTE_MAX_HORIZON)
    : DEFAULT_MAX_HORIZON
  const timeHorizons = Array.from({ length: dynamicMax }, (_, i) => i + 1)
  const isBreakEvenBeyondMax = breakEvenYears !== null && breakEvenYears > ABSOLUTE_MAX_HORIZON

  const getProjectedCosts = (years: number) => {
    const purchaseCostTotal = purchaseData.totalPrice
    const rentalCostTotal = calculateExtendedRentalCost(monthly3ans, years)

    return {
      purchase: purchaseCostTotal,
      rental: rentalCostTotal,
      savings: purchaseCostTotal - rentalCostTotal,
    }
  }

  const projectedCosts = getProjectedCosts(selectedTimeHorizon)
  const isRentalBetter = projectedCosts.savings > 0

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

  const recommendsRental =
    isRentalBetter && breakEvenYears !== null && selectedTimeHorizon < breakEvenYears

  const getRecommendationText = (): string => {
    if (recommendsRental) {
      const base = `Pour un projet de ${selectedTimeHorizon} an${selectedTimeHorizon > 1 ? 's' : ''}, la location vous permet d'économiser ${formatPriceHelper(Math.abs(projectedCosts.savings))} tout en conservant votre flexibilité financière.`
      if (breakEvenPhase === '3ans+' && selectedTimeHorizon > 3) {
        return `${base} Après 3 ans, le tarif de location passe à ${formatPriceHelper(postThreeYearMonthly)}/mois (20% du tarif initial).`
      }
      return base
    }
    const base = `Sur ${selectedTimeHorizon} an${selectedTimeHorizon > 1 ? 's' : ''}, l'achat vous permet d'économiser ${formatPriceHelper(Math.abs(projectedCosts.savings))} et vous offre la propriété complète de l'équipement.`
    if (breakEvenPhase === '3ans+' && selectedTimeHorizon > 3) {
      return `${base} Même avec le tarif réduit de ${formatPriceHelper(postThreeYearMonthly)}/mois après 3 ans, l'achat reste plus avantageux.`
    }
    return base
  }

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

      {/* Time Horizon Selector */}
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
          <CardContent className="space-y-3">
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
            {isBreakEvenBeyondMax && (
              <div className="flex items-center justify-center gap-2 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Le point d&apos;équilibre dépasse {ABSOLUTE_MAX_HORIZON} ans
                  {breakEvenYears !== null && ` (${formatBreakEvenDuration(breakEvenYears * 12)})`}
                </span>
              </div>
            )}
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
                {!isRentalBetter && breakEvenYears && selectedTimeHorizon > breakEvenYears && (
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
                {recommendsRental && <Badge className="bg-blue-500 text-white">Recommandé</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-blue-900">
                    {formatPriceHelper(
                      ceilPrice(projectedCosts.rental / (selectedTimeHorizon * 12)),
                    )}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-blue-400 bg-blue-50 px-2 py-0.5 text-xs text-blue-600"
                  >
                    /mois moy.
                  </Badge>
                </div>
                <div className="mb-2 text-sm text-blue-500">
                  {formatPriceHelper(projectedCosts.rental)} total sur {selectedTimeHorizon} an
                  {selectedTimeHorizon > 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-white/50 bg-white/60 p-4">
                  {selectedTimeHorizon <= 3 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Coût mensuel</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-900">
                            {formatPriceHelper(monthly3ans)}
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
                        <span>{formatPriceHelper(rental3Years.totalPrice)} /an</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          Tarif 3 premières années
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-900">
                            {formatPriceHelper(monthly3ans)}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-blue-400 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-600"
                          >
                            /mois
                          </Badge>
                        </div>
                      </div>
                      <div className="h-px bg-blue-200/50"></div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                          Tarif au-delà de 3 ans
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-blue-900">
                            {formatPriceHelper(postThreeYearMonthly)}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-blue-400 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-600"
                          >
                            /mois
                          </Badge>
                        </div>
                      </div>
                      <div className="text-center text-xs text-blue-500">
                        20% du tarif initial après 3 ans
                      </div>
                    </>
                  )}
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
      {breakEvenResult && breakEvenYears && breakEvenMonths && breakEvenPhase && (
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
                  {formatBreakEvenDuration(breakEvenMonths)}
                </div>
                <div className="text-sm text-amber-700">
                  Point d&apos;équilibre entre achat et location
                </div>
                <div className="text-xs text-amber-600">
                  Phase : {PHASE_LABELS[breakEvenPhase] ?? breakEvenPhase}
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="space-y-2">
                <div className="flex h-8 overflow-hidden rounded-lg">
                  {PHASE_ORDER.map((phase) => {
                    const isActive = phase === breakEvenPhase
                    const baseClasses =
                      'flex items-center justify-center text-[10px] font-medium transition-all'
                    const activeClasses = isActive
                      ? 'bg-amber-400 text-amber-900 ring-2 ring-amber-500 ring-offset-1'
                      : 'bg-amber-100 text-amber-600'
                    const widthClass = phase === '3ans+' ? 'flex-[2]' : 'flex-1'

                    return (
                      <div key={phase} className={`${baseClasses} ${activeClasses} ${widthClass}`}>
                        {PHASE_LABELS[phase]}
                      </div>
                    )
                  })}
                </div>
                {/* Break-even marker position */}
                <div className="relative h-2">
                  <div
                    className="absolute top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-600 shadow-sm"
                    style={{
                      left: `${Math.min((breakEvenYears / Math.max(dynamicMax, breakEvenYears)) * 100, 100)}%`,
                    }}
                  />
                  <div className="h-px w-full bg-amber-200" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-amber-900">
                    {formatPriceHelper(Math.abs(projectedCosts.savings))}
                  </div>
                  <div className="text-sm text-amber-700">
                    {projectedCosts.savings >= 0 ? 'Économies' : 'Surcoût'} sur{' '}
                    {selectedTimeHorizon} an{selectedTimeHorizon > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-amber-900">
                    {projectedCosts.purchase > 0
                      ? (
                          (Math.abs(projectedCosts.savings) / projectedCosts.purchase) *
                          100
                        ).toFixed(1)
                      : '0.0'}
                    %
                  </div>
                  <div className="text-sm text-amber-700">
                    {projectedCosts.savings >= 0 ? 'Économie' : 'Surcoût'} relatif
                  </div>
                </div>
                <div className="rounded-xl border border-white/50 bg-white/60 p-4 text-center">
                  {breakEvenPhase === '3ans+' ? (
                    <>
                      <div className="mb-1 flex items-center justify-center gap-1.5">
                        <span className="text-lg font-bold text-amber-900">
                          {formatPriceHelper(monthly3ans)}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-amber-400 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-600"
                        >
                          /mois
                        </Badge>
                      </div>
                      <div className="text-xs text-amber-700">3 premières années</div>
                      <div className="my-1 h-px bg-amber-200/50" />
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-lg font-bold text-amber-900">
                          {formatPriceHelper(postThreeYearMonthly)}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-amber-400 bg-amber-50 px-1.5 py-0 text-[10px] text-amber-600"
                        >
                          /mois
                        </Badge>
                      </div>
                      <div className="text-xs text-amber-600">au-delà de 3 ans (20%)</div>
                    </>
                  ) : (
                    <>
                      <div className="mb-1 flex items-center justify-center gap-1.5">
                        <span className="text-2xl font-bold text-amber-900">
                          {formatPriceHelper(monthly3ans)}
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
                        {formatPriceHelper(rental3Years.totalPrice)} /an
                      </div>
                    </>
                  )}
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
                recommendsRental ? 'border-blue-300 bg-blue-50' : 'border-green-300 bg-green-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-xl p-2 ${recommendsRental ? 'bg-blue-100' : 'bg-green-100'}`}
                >
                  {recommendsRental ? (
                    <Home className="h-6 w-6 text-blue-600" />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`mb-2 text-lg font-bold ${
                      recommendsRental ? 'text-blue-900' : 'text-green-900'
                    }`}
                  >
                    {recommendsRental ? 'Location recommandée' : 'Achat recommandé'}
                  </h3>
                  <p
                    className={`mb-4 text-sm ${
                      recommendsRental ? 'text-blue-800' : 'text-green-800'
                    }`}
                  >
                    {getRecommendationText()}
                  </p>
                  <div className="flex gap-3">
                    <Button
                      className={
                        recommendsRental
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }
                    >
                      {recommendsRental ? 'Opter pour la location' : "Procéder à l'achat"}
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
                    {breakEvenYears
                      ? `Point d'équilibre : ${formatBreakEvenDuration(breakEvenMonths ?? breakEvenYears * 12)}`
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
