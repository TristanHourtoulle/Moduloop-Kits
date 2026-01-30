import type { KitProduct } from '@/lib/types/project';
import type { PurchaseRentalMode, ProductPeriod } from '@/lib/schemas/product';
import {
  getProductPricing,
  getProductEnvironmentalImpact,
} from '@/lib/utils/product-helpers';

export interface KitImpactResult {
  rechauffementClimatique: number;
  epuisementRessources: number;
  acidification: number;
  eutrophisation: number;
  surface: number;
}

const EMPTY_IMPACT: KitImpactResult = {
  rechauffementClimatique: 0,
  epuisementRessources: 0,
  acidification: 0,
  eutrophisation: 0,
  surface: 0,
};

/**
 * Aggregate environmental impact for all products in a kit.
 * @param kitProducts - The list of products with quantities in the kit
 * @param mode - Purchase or rental mode
 * @returns Aggregated environmental impact values and surface
 */
export function calculateKitImpact(
  kitProducts: KitProduct[],
  mode: PurchaseRentalMode
): KitImpactResult {
  if (!kitProducts || kitProducts.length === 0) {
    return { ...EMPTY_IMPACT };
  }

  return kitProducts.reduce<KitImpactResult>(
    (acc, kitProduct) => {
      const product = kitProduct.product;
      if (!product) return acc;

      const impact = getProductEnvironmentalImpact(product, mode);

      return {
        rechauffementClimatique:
          acc.rechauffementClimatique +
          (impact.rechauffementClimatique || 0) * kitProduct.quantite,
        epuisementRessources:
          acc.epuisementRessources +
          (impact.epuisementRessources || 0) * kitProduct.quantite,
        acidification:
          acc.acidification +
          (impact.acidification || 0) * kitProduct.quantite,
        eutrophisation:
          acc.eutrophisation +
          (impact.eutrophisation || 0) * kitProduct.quantite,
        surface:
          acc.surface + (product.surfaceM2 || 0) * kitProduct.quantite,
      };
    },
    { ...EMPTY_IMPACT }
  );
}

/**
 * Aggregate sale price for all products in a kit.
 * @param kitProducts - The list of products with quantities in the kit
 * @param mode - Purchase or rental mode
 * @param period - Rental period (ignored for purchase mode)
 * @returns Total sale price for the kit
 */
export function calculateKitPrice(
  kitProducts: KitProduct[],
  mode: PurchaseRentalMode,
  period: ProductPeriod = '1an'
): number {
  if (!kitProducts || kitProducts.length === 0) return 0;

  return kitProducts.reduce((acc, kitProduct) => {
    const product = kitProduct.product;
    if (!product) return acc;

    const pricing = getProductPricing(product, mode, period);
    return acc + (pricing.prixVente || 0) * kitProduct.quantite;
  }, 0);
}
