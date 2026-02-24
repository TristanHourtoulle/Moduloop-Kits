/**
 * Nettoie les données venant de la base de données pour les formulaires
 * Convertit null en undefined pour les champs optionnels
 */
export function cleanProductDataForForm(data: Record<string, unknown>) {
  if (!data) return undefined;

  const cleanedData = { ...data };

  // Liste des champs numériques optionnels qui peuvent être null dans la DB
  const optionalNumericFields = [
    // Legacy fields
    'prixAchat1An', 'prixAchat2Ans', 'prixAchat3Ans',
    'prixUnitaire1An', 'prixUnitaire2Ans', 'prixUnitaire3Ans', 
    'prixVente1An', 'prixVente2Ans', 'prixVente3Ans',
    'margeCoefficient',
    'rechauffementClimatique', 'epuisementRessources', 'acidification', 'eutrophisation',
    'quantite', 'surfaceM2',
    
    // New fields
    'prixAchatAchat1An', 'prixAchatAchat2Ans', 'prixAchatAchat3Ans',
    'prixUnitaireAchat1An', 'prixUnitaireAchat2Ans', 'prixUnitaireAchat3Ans',
    'prixVenteAchat1An', 'prixVenteAchat2Ans', 'prixVenteAchat3Ans',
    'margeCoefficientAchat',
    
    'prixAchatLocation1An', 'prixAchatLocation2Ans', 'prixAchatLocation3Ans',
    'prixUnitaireLocation1An', 'prixUnitaireLocation2Ans', 'prixUnitaireLocation3Ans',
    'prixVenteLocation1An', 'prixVenteLocation2Ans', 'prixVenteLocation3Ans',
    'margeCoefficientLocation',
    
    'rechauffementClimatiqueAchat', 'epuisementRessourcesAchat', 'acidificationAchat', 'eutrophisationAchat',
    'rechauffementClimatiqueLocation', 'epuisementRessourcesLocation', 'acidificationLocation', 'eutrophisationLocation'
  ];

  // Convertir null en undefined pour ces champs
  for (const field of optionalNumericFields) {
    if (cleanedData[field] === null) {
      cleanedData[field] = undefined;
    }
  }

  // Pour la description, on convertit null en string vide pour le formulaire
  if (cleanedData.description === null) {
    cleanedData.description = "";
  }

  // Pour l'image, null devient undefined
  if (cleanedData.image === null) {
    cleanedData.image = undefined;
  }

  return cleanedData;
}

/**
 * Prépare les données pour l'envoi à l'API
 * Convertit undefined en null pour certains champs si nécessaire
 */
export function prepareProductDataForAPI(data: Record<string, unknown>) {
  // Pour l'instant, on laisse tel quel
  // L'API gère déjà la conversion undefined -> null
  return data;
}