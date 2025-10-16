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
export function generateProductKey(productId: string, productData: any): string {
  if (!productData) {
    return `product-${productId}-empty`;
  }

  // Create a deterministic string from product data
  const dataPoints = [
    productId,
    productData.nom || '',
    productData.reference || '',
    productData.description || '',
    productData.quantite || 0,
    productData.surfaceM2 || 0,
    // Include all pricing data for both purchase and rental modes
    productData.prixAchatAchat || 0,
    productData.prixUnitaireAchat || 0,
    productData.prixVenteAchat || 0,
    productData.margeCoefficientAchat || 0,
    productData.prixAchatLocation1An || 0,
    productData.prixUnitaireLocation1An || 0,
    productData.prixVenteLocation1An || 0,
    productData.prixAchatLocation2Ans || 0,
    productData.prixUnitaireLocation2Ans || 0,
    productData.prixVenteLocation2Ans || 0,
    productData.prixAchatLocation3Ans || 0,
    productData.prixUnitaireLocation3Ans || 0,
    productData.prixVenteLocation3Ans || 0,
    productData.margeCoefficientLocation || 0,
    // Include environmental impact data
    productData.rechauffementClimatiqueAchat || 0,
    productData.epuisementRessourcesAchat || 0,
    productData.acidificationAchat || 0,
    productData.eutrophisationAchat || 0,
    productData.rechauffementClimatiqueLocation || 0,
    productData.epuisementRessourcesLocation || 0,
    productData.acidificationLocation || 0,
    productData.eutrophisationLocation || 0,
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