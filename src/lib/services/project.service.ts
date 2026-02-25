import { type Project, type EnvironmentalImpact } from '../types/project'
import {
  getProductPricing,
  getProductEnvironmentalImpact,
  ceilPrice,
} from '../utils/product-helpers'

interface ProjectTotals {
  totalPrix: number
  totalImpact: EnvironmentalImpact
  totalSurface: number
}

/**
 * Aggregates pricing, environmental impact, and surface area across all kits in a project.
 * Uses manual surface override when enabled, otherwise calculates from kit surfaces.
 * All price aggregations are ceiled to the next cent for profitability.
 *
 * @param project - The project with optional nested projectKits, kits, and products
 * @returns Aggregated totals for price, environmental impact, and surface
 */
export function calculateProjectTotals(project: Project): ProjectTotals {
  let totalPrix = 0
  const totalImpact: EnvironmentalImpact = {
    rechauffementClimatique: 0,
    epuisementRessources: 0,
    acidification: 0,
    eutrophisation: 0,
  }
  let totalSurface = 0

  if (project.surfaceOverride && project.surfaceManual != null) {
    totalSurface = project.surfaceManual
  } else {
    for (const projectKit of project.projectKits ?? []) {
      const kit = projectKit.kit
      if (!kit?.kitProducts) continue

      const kitSurface = kit.kitProducts.reduce((acc, kp) => {
        return acc + (kp.product?.surfaceM2 ?? 0) * kp.quantite
      }, 0)
      totalSurface += kitSurface * projectKit.quantite
    }
  }

  for (const projectKit of project.projectKits ?? []) {
    const kit = projectKit.kit
    if (!kit?.kitProducts) continue

    for (const kitProduct of kit.kitProducts) {
      const product = kitProduct.product
      if (!product) continue

      const pricing = getProductPricing(product, 'achat', '1an')
      const environmentalImpact = getProductEnvironmentalImpact(product, 'achat')

      const prixProduit = ceilPrice(
        (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite,
      )
      totalPrix += prixProduit

      totalImpact.rechauffementClimatique +=
        (environmentalImpact.rechauffementClimatique || 0) *
        kitProduct.quantite *
        projectKit.quantite
      totalImpact.epuisementRessources +=
        (environmentalImpact.epuisementRessources || 0) * kitProduct.quantite * projectKit.quantite
      totalImpact.acidification +=
        (environmentalImpact.acidification || 0) * kitProduct.quantite * projectKit.quantite
      totalImpact.eutrophisation +=
        (environmentalImpact.eutrophisation || 0) * kitProduct.quantite * projectKit.quantite
    }
  }

  return {
    totalPrix,
    totalImpact,
    totalSurface,
  }
}
