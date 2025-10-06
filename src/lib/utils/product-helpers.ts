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
  // MODE ACHAT : un seul prix, pas de périodes
  if (mode === 'achat') {
    // Priorité: nouveaux champs -> deprecated avec périodes -> legacy
    // Utiliser ?? (nullish coalescing) pour accepter 0 comme valeur valide
    const prixAchat = product.prixAchatAchat ?? product.prixAchatAchat1An ?? product.prixAchat1An ?? null;
    const prixUnitaire = product.prixUnitaireAchat ?? product.prixUnitaireAchat1An ?? product.prixUnitaire1An ?? null;
    const prixVente = product.prixVenteAchat ?? product.prixVenteAchat1An ?? product.prixVente1An ?? null;
    const margeCoefficient = product.margeCoefficientAchat ?? product.margeCoefficient ?? null;

    return {
      prixAchat,
      prixUnitaire,
      prixVente,
      margeCoefficient,
    };
  }

  // MODE LOCATION : avec périodes 1an, 2ans, 3ans
  const suffix = `${period === '1an' ? '1An' : period === '2ans' ? '2Ans' : '3Ans'}` as const;
  const prixAchatKey = `prixAchatLocation${suffix}` as keyof Product;
  const prixUnitaireKey = `prixUnitaireLocation${suffix}` as keyof Product;
  const prixVenteKey = `prixVenteLocation${suffix}` as keyof Product;

  let prixAchat = product[prixAchatKey] as number | null;
  let prixUnitaire = product[prixUnitaireKey] as number | null;
  let prixVente = product[prixVenteKey] as number | null;
  let margeCoefficient = product.margeCoefficientLocation as number | null;

  // Fallback : si pas de prix spécifique pour 2/3 ans, utiliser le prix 1 an
  if (period !== '1an' && (prixAchat === null || prixAchat === undefined)) {
    const prix1An = getProductPricing(product, mode, '1an');
    prixAchat = prix1An.prixAchat;
  }

  if (period !== '1an' && (prixUnitaire === null || prixUnitaire === undefined)) {
    const prix1An = getProductPricing(product, mode, '1an');
    prixUnitaire = prix1An.prixUnitaire;
  }

  if (period !== '1an' && (prixVente === null || prixVente === undefined)) {
    const prix1An = getProductPricing(product, mode, '1an');
    prixVente = prix1An.prixVente;
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