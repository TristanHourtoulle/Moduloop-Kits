import {
  Euro,
  TrendingUp,
  Clock,
  XCircle,
  AlertCircle,
  Calculator,
  Zap,
  Shield,
  Recycle,
  DollarSign,
  Calendar,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const DEFAULT_MAX_HORIZON = 9
export const ABSOLUTE_MAX_HORIZON = 20

export const PHASE_LABELS: Record<string, string> = {
  '0-1an': '0 - 1 an',
  '1-2ans': '1 - 2 ans',
  '2-3ans': '2 - 3 ans',
  '3ans+': 'au-delà de 3 ans',
}

export const PHASE_ORDER = ['0-1an', '1-2ans', '2-3ans', '3ans+'] as const

interface AdvantageItem {
  icon: LucideIcon
  text: string
}

export const PURCHASE_ADVANTAGES: AdvantageItem[] = [
  { icon: DollarSign, text: "Propriété complète de l'équipement" },
  { icon: TrendingUp, text: "Pas de coûts récurrents après l'achat" },
  { icon: Shield, text: "Contrôle total sur l'équipement" },
  { icon: Calendar, text: 'Utilisation illimitée dans le temps' },
  { icon: Zap, text: 'Potentiel de revente en fin de vie' },
]

export const PURCHASE_DISADVANTAGES: AdvantageItem[] = [
  { icon: AlertCircle, text: 'Investissement initial important' },
  { icon: XCircle, text: 'Responsabilité maintenance et réparations' },
  { icon: Clock, text: 'Obsolescence technologique à votre charge' },
  { icon: Euro, text: 'Immobilisation de capital importante' },
]

export const RENTAL_ADVANTAGES: AdvantageItem[] = [
  { icon: Euro, text: 'Coût initial faible, étalement des paiements' },
  { icon: Shield, text: 'Maintenance incluse dans le service' },
  { icon: Zap, text: 'Flexibilité et mise à niveau possible' },
  { icon: Recycle, text: 'Impact environnemental réduit' },
  { icon: Calculator, text: 'Coûts prévisibles et budgétables' },
]

export const RENTAL_DISADVANTAGES: AdvantageItem[] = [
  { icon: TrendingUp, text: 'Coût total plus élevé sur le long terme' },
  { icon: XCircle, text: "Pas de propriété de l'équipement" },
  { icon: Calendar, text: 'Contraintes contractuelles de durée' },
  { icon: AlertCircle, text: 'Dépendance au fournisseur' },
]
