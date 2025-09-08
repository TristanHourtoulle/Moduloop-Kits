import type { Product } from "@/lib/types/project";
import type { PurchaseRentalMode, ProductPeriod } from "@/lib/schemas/product";

/**
 * Types pour les données de prix structurées
 */
export interface ProductPricing {
  prixAchat: number | null;
  prixUnitaire: number | null;
  prixVente: number | null;
  margeCoefficient: number | null;
}

export interface ProductEnvironmentalImpact {
  rechauffementClimatique: number | null;
  epuisementRessources: number | null;
  acidification: number | null;
  eutrophisation: number | null;
}

/**
 * Récupère les prix d'un produit pour un mode (achat/location) et une période donnés
 */
export function getProductPricing(
  product: Product, 
  mode: PurchaseRentalMode = 'achat', 
  period: ProductPeriod = '1an'
): ProductPricing {
  const suffix = `${mode === 'achat' ? 'Achat' : 'Location'}${period === '1an' ? '1An' : period === '2ans' ? '2Ans' : '3Ans'}` as const;
  
  // Essayer d'abord les nouveaux champs spécifiques au mode
  const prixAchatKey = `prixAchat${suffix}` as keyof Product;
  const prixUnitaireKey = `prixUnitaire${suffix}` as keyof Product;
  const prixVenteKey = `prixVente${suffix}` as keyof Product;
  const margeCoefficientKey = `margeCoefficient${mode === 'achat' ? 'Achat' : 'Location'}` as keyof Product;
  
  let prixAchat = product[prixAchatKey] as number | null;
  let prixUnitaire = product[prixUnitaireKey] as number | null;
  let prixVente = product[prixVenteKey] as number | null;
  let margeCoefficient = product[margeCoefficientKey] as number | null;
  
  // Fallback vers les champs legacy pour la compatibilité
  if (prixAchat === null || prixAchat === undefined) {
    const legacyKey = `prixAchat${period === '1an' ? '1An' : period === '2ans' ? '2Ans' : '3Ans'}` as keyof Product;
    prixAchat = product[legacyKey] as number | null;
  }
  
  if (prixUnitaire === null || prixUnitaire === undefined) {
    const legacyKey = `prixUnitaire${period === '1an' ? '1An' : period === '2ans' ? '2Ans' : '3Ans'}` as keyof Product;
    prixUnitaire = product[legacyKey] as number | null;
  }
  
  if (prixVente === null || prixVente === undefined) {
    const legacyKey = `prixVente${period === '1an' ? '1An' : period === '2ans' ? '2Ans' : '3Ans'}` as keyof Product;
    prixVente = product[legacyKey] as number | null;
  }
  
  if (margeCoefficient === null || margeCoefficient === undefined) {
    margeCoefficient = product.margeCoefficient || null;
  }
  
  // Si pas de prix spécifique pour 2/3 ans, utiliser le prix 1 an multiplié par la période
  if (period !== '1an' && prixAchat === null) {
    const prix1An = getProductPricing(product, mode, '1an');
    if (prix1An.prixAchat !== null) {
      const multiplier = period === '2ans' ? 2 : 3;
      prixAchat = prix1An.prixAchat * multiplier;
    }
  }
  
  if (period !== '1an' && prixUnitaire === null) {
    const prix1An = getProductPricing(product, mode, '1an');
    if (prix1An.prixUnitaire !== null) {
      const multiplier = period === '2ans' ? 2 : 3;
      prixUnitaire = prix1An.prixUnitaire * multiplier;
    }
  }
  
  if (period !== '1an' && prixVente === null) {
    const prix1An = getProductPricing(product, mode, '1an');
    if (prix1An.prixVente !== null) {
      const multiplier = period === '2ans' ? 2 : 3;
      prixVente = prix1An.prixVente * multiplier;
    }
  }
  
  return {
    prixAchat,
    prixUnitaire,
    prixVente,
    margeCoefficient,
  };
}

/**
 * Récupère l'impact environnemental d'un produit pour un mode donné
 */
export function getProductEnvironmentalImpact(
  product: Product, 
  mode: PurchaseRentalMode = 'achat'
): ProductEnvironmentalImpact {
  const suffix = mode === 'achat' ? 'Achat' : 'Location';
  
  // Essayer d'abord les nouveaux champs spécifiques au mode
  const rechauffementKey = `rechauffementClimatique${suffix}` as keyof Product;
  const epuisementKey = `epuisementRessources${suffix}` as keyof Product;
  const acidificationKey = `acidification${suffix}` as keyof Product;
  const eutrophisationKey = `eutrophisation${suffix}` as keyof Product;
  
  let rechauffementClimatique = product[rechauffementKey] as number | null;
  let epuisementRessources = product[epuisementKey] as number | null;
  let acidification = product[acidificationKey] as number | null;
  let eutrophisation = product[eutrophisationKey] as number | null;
  
  // Fallback vers les champs legacy pour la compatibilité
  if (rechauffementClimatique === null || rechauffementClimatique === undefined) {
    rechauffementClimatique = product.rechauffementClimatique || null;
  }
  
  if (epuisementRessources === null || epuisementRessources === undefined) {
    epuisementRessources = product.epuisementRessources || null;
  }
  
  if (acidification === null || acidification === undefined) {
    acidification = product.acidification || null;
  }
  
  if (eutrophisation === null || eutrophisation === undefined) {
    eutrophisation = product.eutrophisation || null;
  }
  
  return {
    rechauffementClimatique,
    epuisementRessources,
    acidification,
    eutrophisation,
  };
}

/**
 * Calcule la marge en pourcentage entre le prix d'achat et le prix unitaire
 */
export function calculateMarginPercentage(prixAchat: number, prixUnitaire: number): number {
  if (prixAchat <= 0) return 0;
  return ((prixUnitaire - prixAchat) / prixAchat) * 100;
}

/**
 * Vérifie si un produit a des données de prix pour un mode donné
 */
export function hasProductPricingData(product: Product, mode: PurchaseRentalMode): boolean {
  const pricing = getProductPricing(product, mode, '1an');
  return pricing.prixAchat !== null && pricing.prixUnitaire !== null && pricing.prixVente !== null;
}

/**
 * Vérifie si un produit a des données d'impact environnemental pour un mode donné
 */
export function hasProductEnvironmentalData(product: Product, mode: PurchaseRentalMode): boolean {
  const impact = getProductEnvironmentalImpact(product, mode);
  return (
    impact.rechauffementClimatique !== null && 
    impact.epuisementRessources !== null && 
    impact.acidification !== null && 
    impact.eutrophisation !== null
  );
}

/**
 * Détermine le mode par défaut à utiliser pour un produit
 * (basé sur quelles données sont disponibles)
 */
export function getDefaultProductMode(product: Product): PurchaseRentalMode {
  const hasAchatData = hasProductPricingData(product, 'achat');
  const hasLocationData = hasProductPricingData(product, 'location');
  
  // Si les deux modes ont des données, préférer l'achat
  if (hasAchatData && hasLocationData) return 'achat';
  
  // Sinon, utiliser le mode qui a des données
  if (hasAchatData) return 'achat';
  if (hasLocationData) return 'location';
  
  // Par défaut, utiliser l'achat (pour compatibilité avec les données legacy)
  return 'achat';
}

/**
 * Formats les prix pour l'affichage
 */
export function formatPrice(price: number | null): string {
  if (price === null) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats l'impact environnemental pour l'affichage
 */
export function formatEnvironmentalImpact(
  impact: number | null, 
  unit: 'kg' | 'MJ' | 'MOL' = 'kg'
): string {
  if (impact === null) return 'N/A';
  
  const formattedNumber = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(impact);
  
  const unitMap = {
    'kg': ' kg CO₂',
    'MJ': ' MJ',
    'MOL': ' MOL H⁺',
  };
  
  return `${formattedNumber}${unitMap[unit]}`;
}

/**
 * Migre les données legacy vers le nouveau format
 * (utilitaire pour la transition)
 */
export function migrateLegacyProductData(product: Product): Partial<Product> {
  // TODO: Fix field names after schema update - function temporarily disabled
  return {};
  
  /* const updates: Partial<Product> = {};
  
  // Migrer les prix legacy vers les champs achat
  if (product.prixAchat1An !== null && product.prixAchat1An !== undefined) {
    // TODO: Fix field names after schema update - function disabled
    return {};
  }
  if (product.prixAchat2Ans !== null && product.prixAchat2Ans !== undefined) {
    updates.prixAchatAchat2Ans = product.prixAchat2Ans;
  }
  if (product.prixAchat3Ans !== null && product.prixAchat3Ans !== undefined) {
    updates.prixAchatAchat3Ans = product.prixAchat3Ans;
  }
  
  if (product.prixUnitaire1An !== null && product.prixUnitaire1An !== undefined) {
    updates.prixUnitaireAchat1An = product.prixUnitaire1An;
  }
  if (product.prixUnitaire2Ans !== null && product.prixUnitaire2Ans !== undefined) {
    updates.prixUnitaireAchat2Ans = product.prixUnitaire2Ans;
  }
  if (product.prixUnitaire3Ans !== null && product.prixUnitaire3Ans !== undefined) {
    updates.prixUnitaireAchat3Ans = product.prixUnitaire3Ans;
  }
  
  if (product.prixVente1An !== null && product.prixVente1An !== undefined) {
    updates.prixVenteAchat1An = product.prixVente1An;
  }
  if (product.prixVente2Ans !== null && product.prixVente2Ans !== undefined) {
    updates.prixVenteAchat2Ans = product.prixVente2Ans;
  }
  if (product.prixVente3Ans !== null && product.prixVente3Ans !== undefined) {
    updates.prixVenteAchat3Ans = product.prixVente3Ans;
  }
  
  if (product.margeCoefficient !== null && product.margeCoefficient !== undefined) {
    updates.margeCoefficientAchat = product.margeCoefficient;
  }
  
  // Migrer l'impact environnemental legacy vers les champs achat
  if (product.rechauffementClimatique !== null && product.rechauffementClimatique !== undefined) {
    updates.rechauffementClimatiqueAchat = product.rechauffementClimatique;
  }
  if (product.epuisementRessources !== null && product.epuisementRessources !== undefined) {
    updates.epuisementRessourcesAchat = product.epuisementRessources;
  }
  if (product.acidification !== null && product.acidification !== undefined) {
    updates.acidificationAchat = product.acidification;
  }
  if (product.eutrophisation !== null && product.eutrophisation !== undefined) {
    updates.eutrophisationAchat = product.eutrophisation;
  }
  
  return updates;
  */
}