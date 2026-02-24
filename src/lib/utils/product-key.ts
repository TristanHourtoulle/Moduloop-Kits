/**
 * Generates a deterministic key for product components based on product data.
 * This ensures proper component remounting when product data changes on Vercel.
 *
 * The key is generated from:
 * - Product ID
 * - Product name and reference
 * - Product description
 * - Pricing data (all price fields)
 * - Quantities and surface
 * - Environmental impact values
 *
 * This approach ensures the component remounts when any significant data changes,
 * forcing a fresh render with updated props.
 */
export function generateProductKey(productId: string, productData: object): string {
  if (!productData) {
    return `product-${productId}-empty`;
  }

  const data = productData as Record<string, unknown>;

  // Create a deterministic string from product data
  const dataPoints = [
    productId,
    data.nom || '',
    data.reference || '',
    data.description || '',
    data.quantite || 0,
    data.surfaceM2 || 0,
    // Include all pricing data for both purchase and rental modes
    data.prixAchatAchat || 0,
    data.prixUnitaireAchat || 0,
    data.prixVenteAchat || 0,
    data.margeCoefficientAchat || 0,
    data.prixAchatLocation1An || 0,
    data.prixUnitaireLocation1An || 0,
    data.prixVenteLocation1An || 0,
    data.prixAchatLocation2Ans || 0,
    data.prixUnitaireLocation2Ans || 0,
    data.prixVenteLocation2Ans || 0,
    data.prixAchatLocation3Ans || 0,
    data.prixUnitaireLocation3Ans || 0,
    data.prixVenteLocation3Ans || 0,
    data.margeCoefficientLocation || 0,
    // Include environmental impact data
    data.rechauffementClimatiqueAchat || 0,
    data.epuisementRessourcesAchat || 0,
    data.acidificationAchat || 0,
    data.eutrophisationAchat || 0,
    data.rechauffementClimatiqueLocation || 0,
    data.epuisementRessourcesLocation || 0,
    data.acidificationLocation || 0,
    data.eutrophisationLocation || 0,
  ].join('-');

  // Simple hash function to create a shorter key
  let hash = 0;
  for (let i = 0; i < dataPoints.length; i++) {
    const char = dataPoints.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `product-${productId}-${Math.abs(hash)}`;
}