import type { Project, EnvironmentalImpact } from '@/lib/types/project'
import type { PurchaseRentalMode, ProductPeriod } from '@/lib/schemas/product'
import { getProductPricing, getProductEnvironmentalImpact } from '@/lib/utils/product-helpers'

export interface ProjectPriceTotals {
  achat: number
  location1an: number
  location2ans: number
  location3ans: number
}

export interface ProjectCostBreakdown {
  totalPrice: number
  totalCost: number
  totalMargin: number
}

export interface KitBreakdownItem {
  kitName: string
  quantity: number
  totalPrice: number
  totalCost: number
  totalMargin: number
  marginPercentage: number
}

const EMPTY_PRICE_TOTALS: ProjectPriceTotals = {
  achat: 0,
  location1an: 0,
  location2ans: 0,
  location3ans: 0,
}

const EMPTY_COST_BREAKDOWN: ProjectCostBreakdown = {
  totalPrice: 0,
  totalCost: 0,
  totalMargin: 0,
}

const EMPTY_ENVIRONMENTAL_IMPACT: EnvironmentalImpact = {
  rechauffementClimatique: 0,
  epuisementRessources: 0,
  acidification: 0,
  eutrophisation: 0,
}

/**
 * Calculate total sale prices across all modes and periods for a project.
 * @param project - The project with its kits and products
 * @returns Price totals for purchase and all rental periods
 */
export function calculateProjectPriceTotals(project: Project): ProjectPriceTotals {
  if (!project.projectKits) return { ...EMPTY_PRICE_TOTALS }

  let achat = 0
  let location1an = 0
  let location2ans = 0
  let location3ans = 0

  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit
    if (!kit?.kitProducts) return

    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product
      if (!product) return

      const quantite = kitProduct.quantite * projectKit.quantite

      const pricingAchat = getProductPricing(product, 'achat', '1an')
      achat += (pricingAchat.prixVente || 0) * quantite

      const pricing1an = getProductPricing(product, 'location', '1an')
      location1an += (pricing1an.prixVente || 0) * quantite

      const pricing2ans = getProductPricing(product, 'location', '2ans')
      location2ans += (pricing2ans.prixVente || 0) * quantite

      const pricing3ans = getProductPricing(product, 'location', '3ans')
      location3ans += (pricing3ans.prixVente || 0) * quantite
    })
  })

  return { achat, location1an, location2ans, location3ans }
}

/**
 * Calculate cost breakdown for purchase mode.
 * @param project - The project with its kits and products
 * @returns Total sale price, supplier cost, and margin
 */
export function calculateProjectPurchaseCosts(project: Project): ProjectCostBreakdown {
  return calculateCostsForMode(project, 'achat', '1an')
}

/**
 * Calculate cost breakdown for rental mode at a given period.
 * @param project - The project with its kits and products
 * @param period - The rental period
 * @returns Total sale price, supplier cost, and margin
 */
export function calculateProjectRentalCosts(
  project: Project,
  period: ProductPeriod,
): ProjectCostBreakdown {
  return calculateCostsForMode(project, 'location', period)
}

/**
 * Get per-kit pricing breakdown for a given mode and period.
 * @param project - The project with its kits and products
 * @param mode - Purchase or rental mode
 * @param period - The rental period (ignored for purchase mode)
 * @returns Array of breakdown items per kit
 */
export function getProjectKitBreakdown(
  project: Project,
  mode: PurchaseRentalMode,
  period: ProductPeriod = '1an',
): KitBreakdownItem[] {
  if (!project.projectKits) return []

  return project.projectKits
    .map((projectKit) => {
      const kit = projectKit.kit
      if (!kit?.kitProducts) return null

      let kitTotalPrice = 0
      let kitTotalCost = 0

      kit.kitProducts.forEach((kitProduct) => {
        const product = kitProduct.product
        if (!product) return

        const pricing = getProductPricing(product, mode, period)
        kitTotalPrice += (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite
        kitTotalCost += (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite
      })

      const kitTotalMargin = kitTotalPrice - kitTotalCost

      return {
        kitName: kit.nom,
        quantity: projectKit.quantite,
        totalPrice: kitTotalPrice,
        totalCost: kitTotalCost,
        totalMargin: kitTotalMargin,
        marginPercentage: kitTotalPrice > 0 ? (kitTotalMargin / kitTotalPrice) * 100 : 0,
      }
    })
    .filter((item): item is KitBreakdownItem => item !== null)
}

/**
 * Calculate environmental savings of rental vs new products.
 * @param project - The project with its kits and products
 * @returns Aggregated environmental savings
 */
export function calculateEnvironmentalSavings(project: Project): EnvironmentalImpact {
  if (!project.projectKits) return { ...EMPTY_ENVIRONMENTAL_IMPACT }

  let rechauffementClimatique = 0
  let epuisementRessources = 0
  let acidification = 0
  let eutrophisation = 0

  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit
    if (!kit?.kitProducts) return

    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product
      if (!product) return

      const locationImpact = getProductEnvironmentalImpact(product, 'location')
      const totalQuantity = kitProduct.quantite * projectKit.quantite

      rechauffementClimatique +=
        Math.abs(locationImpact.rechauffementClimatique || 0) * totalQuantity
      epuisementRessources += Math.abs(locationImpact.epuisementRessources || 0) * totalQuantity
      acidification += Math.abs(locationImpact.acidification || 0) * totalQuantity
      eutrophisation += Math.abs(locationImpact.eutrophisation || 0) * totalQuantity
    })
  })

  return {
    rechauffementClimatique,
    epuisementRessources,
    acidification,
    eutrophisation,
  }
}

/**
 * Calculate the break-even point in years between purchase and rental.
 * @param project - The project with its kits and products
 * @returns Number of years to break even, or null if rental price is zero
 */
export function calculateBreakEvenPoint(project: Project): number | null {
  const purchaseCost = calculateProjectPurchaseCosts(project)
  const rental1Year = calculateProjectRentalCosts(project, '1an')

  if (rental1Year.totalPrice === 0) return null

  return purchaseCost.totalPrice / rental1Year.totalPrice
}

function calculateCostsForMode(
  project: Project,
  mode: PurchaseRentalMode,
  period: ProductPeriod,
): ProjectCostBreakdown {
  if (!project.projectKits) return { ...EMPTY_COST_BREAKDOWN }

  let totalPrice = 0
  let totalCost = 0

  project.projectKits.forEach((projectKit) => {
    const kit = projectKit.kit
    if (!kit?.kitProducts) return

    kit.kitProducts.forEach((kitProduct) => {
      const product = kitProduct.product
      if (!product) return

      const pricing = getProductPricing(product, mode, period)
      totalPrice += (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite
      totalCost += (pricing.prixAchat || 0) * kitProduct.quantite * projectKit.quantite
    })
  })

  return { totalPrice, totalCost, totalMargin: totalPrice - totalCost }
}
