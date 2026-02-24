
/**
 * Pricing mode for project cards
 * Location is always displayed for 3 years period
 */
export type ProjectCardPricingMode = 'achat' | 'location';

/**
 * Calculated metrics for a project card
 */
export interface ProjectCardMetrics {
  /** Total price for the selected mode (€) */
  totalPrice: number;
  /** Total CO2 impact (kg) - positive for savings in location mode */
  totalCO2: number;
  /** Price per square meter (€/m²) - null if no surface */
  pricePerM2: number | null;
  /** Number of unique kits */
  kitCount: number;
  /** Total number of kit units */
  totalUnits: number;
  /** Number of unique products across all kits */
  productCount: number;
}

/**
 * Surface display mode
 */
export type SurfaceMode = 'manual' | 'auto' | null;

/**
 * Project card display data
 */
export interface ProjectCardDisplayData {
  id: string;
  nom: string;
  description?: string;
  status: string;
  createdAt: string;
  totalSurface: number;
  surfaceMode: SurfaceMode;
  metrics: ProjectCardMetrics;
}
