import type { Product } from '@/lib/types/project'
import type { PurchaseRentalMode, ProductPeriod } from '@/lib/schemas/product'

/**
 * Types pour les données de prix structurées
 */
export interface ProductPricing {
  prixAchat: number | null
  prixUnitaire: number | null
  prixVente: number | null
  margeCoefficient: number | null
}

export interface ProductEnvironmentalImpact {
  rechauffementClimatique: number | null
  epuisementRessources: number | null
  acidification: number | null
  eutrophisation: number | null
}

/**
 * Récupère les prix d'un produit pour un mode (achat/location) et une période donnés
 */
export function getProductPricing(
  product: Product,
  mode: PurchaseRentalMode = 'achat',
  period: ProductPeriod = '1an',
): ProductPricing {
  // MODE ACHAT : un seul prix, pas de périodes
  if (mode === 'achat') {
    // Priorité: nouveaux champs -> deprecated avec périodes -> legacy
    // Utiliser ?? (nullish coalescing) pour accepter 0 comme valeur valide
    const prixAchat =
      product.prixAchatAchat ??
      product.prixAchatAchat1An ??
      product.prixAchat1An ??
      null
    const prixUnitaire =
      product.prixUnitaireAchat ??
      product.prixUnitaireAchat1An ??
      product.prixUnitaire1An ??
      null
    const prixVente =
      product.prixVenteAchat ??
      product.prixVenteAchat1An ??
      product.prixVente1An ??
      null
    const margeCoefficient =
      product.margeCoefficientAchat ?? product.margeCoefficient ?? null

    return {
      prixAchat,
      prixUnitaire,
      prixVente,
      margeCoefficient,
    }
  }

  // MODE LOCATION : avec périodes 1an, 2ans, 3ans
  const suffix =
    `${period === '1an' ? '1An' : period === '2ans' ? '2Ans' : '3Ans'}` as const
  const prixAchatKey = `prixAchatLocation${suffix}` as keyof Product
  const prixUnitaireKey = `prixUnitaireLocation${suffix}` as keyof Product
  const prixVenteKey = `prixVenteLocation${suffix}` as keyof Product

  const rawPrixAchat = product[prixAchatKey] as number | null
  const rawPrixUnitaire = product[prixUnitaireKey] as number | null
  const rawPrixVente = product[prixVenteKey] as number | null
  const margeCoefficient = product.margeCoefficientLocation as number | null

  // Fallback : si pas de prix spécifique pour 2/3 ans, utiliser le prix 1 an
  const fallback =
    period !== '1an' &&
    (rawPrixAchat == null || rawPrixUnitaire == null || rawPrixVente == null)
      ? getProductPricing(product, mode, '1an')
      : null

  const prixAchat = rawPrixAchat ?? fallback?.prixAchat ?? null
  const prixUnitaire = rawPrixUnitaire ?? fallback?.prixUnitaire ?? null
  const prixVente = rawPrixVente ?? fallback?.prixVente ?? null

  return {
    prixAchat,
    prixUnitaire,
    prixVente,
    margeCoefficient,
  }
}

/**
 * Récupère l'impact environnemental d'un produit pour un mode donné
 */
export function getProductEnvironmentalImpact(
  product: Product,
  mode: PurchaseRentalMode = 'achat',
): ProductEnvironmentalImpact {
  const suffix = mode === 'achat' ? 'Achat' : 'Location'

  // Essayer d'abord les nouveaux champs spécifiques au mode
  const rechauffementKey = `rechauffementClimatique${suffix}` as keyof Product
  const epuisementKey = `epuisementRessources${suffix}` as keyof Product
  const acidificationKey = `acidification${suffix}` as keyof Product
  const eutrophisationKey = `eutrophisation${suffix}` as keyof Product

  let rechauffementClimatique = product[rechauffementKey] as number | null
  let epuisementRessources = product[epuisementKey] as number | null
  let acidification = product[acidificationKey] as number | null
  let eutrophisation = product[eutrophisationKey] as number | null

  // Fallback vers les champs legacy pour la compatibilité
  if (
    rechauffementClimatique === null ||
    rechauffementClimatique === undefined
  ) {
    rechauffementClimatique = product.rechauffementClimatique || null
  }

  if (epuisementRessources === null || epuisementRessources === undefined) {
    epuisementRessources = product.epuisementRessources || null
  }

  if (acidification === null || acidification === undefined) {
    acidification = product.acidification || null
  }

  if (eutrophisation === null || eutrophisation === undefined) {
    eutrophisation = product.eutrophisation || null
  }

  return {
    rechauffementClimatique,
    epuisementRessources,
    acidification,
    eutrophisation,
  }
}

/**
 * Calcule la marge en pourcentage entre le prix d'achat et le prix unitaire
 */
export function calculateMarginPercentage(
  prixAchat: number,
  prixUnitaire: number,
): number {
  if (prixAchat <= 0) return 0
  return ((prixUnitaire - prixAchat) / prixAchat) * 100
}

/**
 * Vérifie si un produit a des données de prix pour un mode donné
 */
export function hasProductPricingData(
  product: Product,
  mode: PurchaseRentalMode,
): boolean {
  const pricing = getProductPricing(product, mode, '1an')
  return (
    pricing.prixAchat !== null &&
    pricing.prixUnitaire !== null &&
    pricing.prixVente !== null
  )
}

/**
 * Vérifie si un produit a des données d'impact environnemental pour un mode donné
 */
export function hasProductEnvironmentalData(
  product: Product,
  mode: PurchaseRentalMode,
): boolean {
  const impact = getProductEnvironmentalImpact(product, mode)
  return (
    impact.rechauffementClimatique !== null &&
    impact.epuisementRessources !== null &&
    impact.acidification !== null &&
    impact.eutrophisation !== null
  )
}

/**
 * Détermine le mode par défaut à utiliser pour un produit
 * (basé sur quelles données sont disponibles)
 */
export function getDefaultProductMode(product: Product): PurchaseRentalMode {
  const hasAchatData = hasProductPricingData(product, 'achat')
  const hasLocationData = hasProductPricingData(product, 'location')

  // Si les deux modes ont des données, préférer l'achat
  if (hasAchatData && hasLocationData) return 'achat'

  // Sinon, utiliser le mode qui a des données
  if (hasAchatData) return 'achat'
  if (hasLocationData) return 'location'

  // Par défaut, utiliser l'achat (pour compatibilité avec les données legacy)
  return 'achat'
}

/**
 * Rounds a price UP to the next cent for profitability.
 * Handles floating-point precision artifacts.
 * Whole numbers and prices already at cent precision are unchanged.
 *
 * @example ceilPrice(15.123) // 15.13
 * @example ceilPrice(16)     // 16
 * @example ceilPrice(16.50)  // 16.50
 */
export function ceilPrice(price: number): number {
  const cleaned = Math.round(price * 1e10) / 1e10
  return Math.ceil(cleaned * 100) / 100
}

/**
 * Converts an annual price to its monthly equivalent, rounded UP to the next cent.
 *
 * @param annualPrice - The yearly price to convert
 * @returns The monthly price ceiled to 2 decimals
 */
export function annualToMonthly(annualPrice: number): number {
  return ceilPrice(annualPrice / 12)
}

/**
 * Formats a numeric price for display using French locale and EUR currency.
 * Applies ceil rounding to ensure profitability before formatting.
 *
 * @param price - The price value to format, or null if unavailable
 * @returns A formatted string (e.g. "1 200 €") or "N/A" when price is null
 */
export function formatPrice(price: number | null): string {
  if (price === null) return 'N/A'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(ceilPrice(price))
}

/**
 * Formats l'impact environnemental pour l'affichage
 */
export function formatEnvironmentalImpact(
  impact: number | null,
  unit: 'kg' | 'MJ' | 'MOL' = 'kg',
): string {
  if (impact === null) return 'N/A'

  const formattedNumber = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(impact)

  const unitMap = {
    kg: ' kg CO₂',
    MJ: ' MJ',
    MOL: ' MOL H⁺',
  }

  return `${formattedNumber}${unitMap[unit]}`
}
