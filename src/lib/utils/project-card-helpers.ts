import { Project } from '@/lib/types/project'
import { getProductPricing, getProductEnvironmentalImpact } from './product-helpers'
import { ProjectCardMetrics, ProjectCardPricingMode, SurfaceMode } from '@/lib/types/project-card'

/**
 * Calculate total price for a project based on mode
 * Location mode always uses 3 years period
 *
 * @param project - Project with all relations loaded
 * @param mode - 'achat' or 'location'
 * @returns Total price in euros
 */
export function calculateProjectPrice(project: Project, mode: ProjectCardPricingMode): number {
  if (!project.projectKits) return 0

  let total = 0
  const period = mode === 'location' ? '3ans' : '1an'

  for (const projectKit of project.projectKits) {
    const kit = projectKit.kit
    if (!kit?.kitProducts) continue

    for (const kitProduct of kit.kitProducts) {
      const product = kitProduct.product
      if (!product) continue

      const pricing = getProductPricing(product, mode, period)
      const quantity = kitProduct.quantite * projectKit.quantite

      total += (pricing.prixVente || 0) * quantity
    }
  }

  return total
}

/**
 * Calculate total CO2 impact for a project based on mode
 * For location mode, returns positive value representing savings
 *
 * @param project - Project with all relations loaded
 * @param mode - 'achat' or 'location'
 * @returns CO2 impact in kg (positive = savings for location)
 */
export function calculateProjectCO2(project: Project, mode: ProjectCardPricingMode): number {
  if (!project.projectKits) return 0

  let total = 0

  for (const projectKit of project.projectKits) {
    const kit = projectKit.kit
    if (!kit?.kitProducts) continue

    for (const kitProduct of kit.kitProducts) {
      const product = kitProduct.product
      if (!product) continue

      const impact = getProductEnvironmentalImpact(product, mode)
      const quantity = kitProduct.quantite * projectKit.quantite

      total += (impact.rechauffementClimatique || 0) * quantity
    }
  }

  return total
}

/**
 * Calculate price per square meter
 * Uses project.totalSurface which already handles manual/auto mode
 *
 * @param totalSurface - Total surface from project (manual or auto)
 * @param totalPrice - Current total price
 * @returns Price per m² or null if no surface available
 */
export function calculatePricePerM2(
  totalSurface: number | undefined,
  totalPrice: number,
): number | null {
  if (!totalSurface || totalSurface === 0 || !totalPrice) {
    return null
  }

  return Math.round(totalPrice / totalSurface)
}

/**
 * Calculate number of unique products across all kits
 *
 * @param project - Project with all relations loaded
 * @returns Count of unique products
 */
export function calculateProductCount(project: Project): number {
  if (!project.projectKits) return 0

  const uniqueProducts = new Set<string>()

  for (const projectKit of project.projectKits) {
    const kit = projectKit.kit
    if (!kit?.kitProducts) continue

    for (const kitProduct of kit.kitProducts) {
      if (kitProduct.productId) {
        uniqueProducts.add(kitProduct.productId)
      }
    }
  }

  return uniqueProducts.size
}

/**
 * Calculate total number of kit units
 *
 * @param project - Project with projectKits loaded
 * @returns Sum of all kit quantities
 */
export function calculateTotalUnits(project: Project): number {
  if (!project.projectKits) return 0

  return project.projectKits.reduce((sum, pk) => sum + pk.quantite, 0)
}

/**
 * Get surface display mode (manual, auto, or null)
 *
 * @param project - Project with surface fields
 * @returns Surface mode indicator
 */
export function getSurfaceMode(project: Project): SurfaceMode {
  if (!project.totalSurface || project.totalSurface === 0) {
    return null
  }

  return project.surfaceOverride ? 'manual' : 'auto'
}

/**
 * Calculate all metrics for a project card at once
 * Optimized to avoid multiple iterations over project data
 *
 * @param project - Project with all relations loaded
 * @param mode - Current pricing mode
 * @returns All calculated metrics
 */
export function calculateProjectCardMetrics(
  project: Project,
  mode: ProjectCardPricingMode,
): ProjectCardMetrics {
  const totalPrice = calculateProjectPrice(project, mode)
  const totalCO2 = calculateProjectCO2(project, mode)
  const pricePerM2 = calculatePricePerM2(project.totalSurface, totalPrice)
  const kitCount = project.projectKits?.length || 0
  const totalUnits = calculateTotalUnits(project)
  const productCount = calculateProductCount(project)

  return {
    totalPrice,
    totalCO2,
    pricePerM2,
    kitCount,
    totalUnits,
    productCount,
  }
}
