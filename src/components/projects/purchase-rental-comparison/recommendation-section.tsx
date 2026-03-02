'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, Home, ShoppingCart, ArrowRight } from 'lucide-react'
import { formatPrice as formatPriceHelper } from '@/lib/utils/product-helpers'
import { formatBreakEvenDuration } from '@/lib/utils/project/calculations'
import type { BreakEvenPhase } from '@/lib/utils/project/calculations'

interface ProjectedCosts {
  purchase: number
  rental: number
  savings: number
}

interface RecommendationSectionProps {
  recommendsRental: boolean
  selectedTimeHorizon: number
  projectedCosts: ProjectedCosts
  breakEvenPhase: BreakEvenPhase | null
  postThreeYearMonthly: number
  breakEvenYears: number | null
  breakEvenMonths: number | null
  projectKitCount: number
}

/**
 * Smart recommendation section comparing purchase vs rental with contextual advice.
 * @param props - Recommendation state, costs, and project context
 * @returns Recommendation card with action buttons and contextual factors
 */
export function RecommendationSection({
  recommendsRental,
  selectedTimeHorizon,
  projectedCosts,
  breakEvenPhase,
  postThreeYearMonthly,
  breakEvenYears,
  breakEvenMonths,
  projectKitCount,
}: RecommendationSectionProps) {
  const recommendationText = buildRecommendationText({
    recommendsRental,
    selectedTimeHorizon,
    savings: projectedCosts.savings,
    breakEvenPhase,
    postThreeYearMonthly,
  })

  return (
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
                  {recommendationText}
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
                <li>• {projectKitCount} types de kits configurés</li>
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
  )
}

function buildRecommendationText({
  recommendsRental,
  selectedTimeHorizon,
  savings,
  breakEvenPhase,
  postThreeYearMonthly,
}: {
  recommendsRental: boolean
  selectedTimeHorizon: number
  savings: number
  breakEvenPhase: BreakEvenPhase | null
  postThreeYearMonthly: number
}): string {
  const yearLabel = `${selectedTimeHorizon} an${selectedTimeHorizon > 1 ? 's' : ''}`
  const savingsLabel = formatPriceHelper(Math.abs(savings))
  const postRateLabel = formatPriceHelper(postThreeYearMonthly)
  const showTieredNote = breakEvenPhase === '3ans+' && selectedTimeHorizon > 3

  if (recommendsRental) {
    const base = `Pour un projet de ${yearLabel}, la location vous permet d'économiser ${savingsLabel} tout en conservant votre flexibilité financière.`
    if (showTieredNote) {
      return `${base} Après 3 ans, le tarif de location passe à ${postRateLabel}/mois (20% du tarif initial).`
    }
    return base
  }

  const base = `Sur ${yearLabel}, l'achat vous permet d'économiser ${savingsLabel} et vous offre la propriété complète de l'équipement.`
  if (showTieredNote) {
    return `${base} Même avec le tarif réduit de ${postRateLabel}/mois après 3 ans, l'achat reste plus avantageux.`
  }
  return base
}
