import { type Project } from '../types/project';
import { getProductPricing, getProductEnvironmentalImpact } from '../utils/product-helpers';

export const calculateProjectTotals = (project: Project) => {
  let totalPrix = 0;
  const totalImpact = {
    rechauffementClimatique: 0,
    epuisementRessources: 0,
    acidification: 0,
    eutrophisation: 0,
  };
  let totalSurface = 0;

  // Calculate surface: use manual override if enabled, otherwise calculate from kits
  if (project.surfaceOverride && project.surfaceManual != null) {
    totalSurface = project.surfaceManual;
  } else {
    if (project.projectKits) {
      project.projectKits.forEach((projectKit) => {
        const kit = projectKit.kit;
        if (kit) {
          totalSurface += (kit.surfaceM2 || 0) * projectKit.quantite;
        }
      });
    }
  }

  // Calculate price and environmental impact for all kits
  if (project.projectKits) {
    project.projectKits.forEach((projectKit) => {
      const kit = projectKit.kit;
      if (kit && kit.kitProducts) {
        kit.kitProducts.forEach((kitProduct) => {
          const product = kitProduct.product;
          if (product) {
            const pricing = getProductPricing(product, 'achat', '1an');
            const environmentalImpact = getProductEnvironmentalImpact(product, 'achat');

            const prixProduit =
              (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
            totalPrix += prixProduit;

            totalImpact.rechauffementClimatique +=
              (environmentalImpact.rechauffementClimatique || 0) *
              kitProduct.quantite *
              projectKit.quantite;
            totalImpact.epuisementRessources +=
              (environmentalImpact.epuisementRessources || 0) *
              kitProduct.quantite *
              projectKit.quantite;
            totalImpact.acidification +=
              (environmentalImpact.acidification || 0) * kitProduct.quantite * projectKit.quantite;
            totalImpact.eutrophisation +=
              (environmentalImpact.eutrophisation || 0) *
              kitProduct.quantite *
              projectKit.quantite;
          }
        });
      }
    });
  }

  return {
    totalPrix,
    totalImpact,
    totalSurface,
  };
};
