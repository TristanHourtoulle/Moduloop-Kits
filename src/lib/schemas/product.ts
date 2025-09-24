import { z } from "zod";

export const productSchema = z.object({
  nom: z
    .string("Le nom est requis")
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),

  reference: z
    .string("La référence est requise")
    .min(1, "La référence est requise")
    .max(50, "La référence ne peut pas dépasser 50 caractères")
    .trim(),

  description: z
    .string()
    .max(1000, "La description ne peut pas dépasser 1000 caractères")
    .trim()
    .nullable()
    .transform((val) => val === "" ? null : val),

  // ========== LEGACY FIELDS (pour compatibilité) ==========
  // Prix d'achat fournisseur (LEGACY)
  prixAchat1An: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .nullable()
    .optional(),

  prixAchat2Ans: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .optional(),

  prixAchat3Ans: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .optional(),

  // Prix unitaire Moduloop (LEGACY)
  prixUnitaire1An: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  prixUnitaire2Ans: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  prixUnitaire3Ans: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  // Prix de vente total Moduloop (LEGACY)
  prixVente1An: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  prixVente2Ans: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  prixVente3Ans: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  // Marge appliquée (LEGACY)
  margeCoefficient: z
    .number()
    .min(1, "Le coefficient de marge doit être au minimum de 1 (0% de marge)")
    .max(10, "Le coefficient de marge ne peut pas dépasser 10 (900% de marge)")
    .optional(),

  // Impact environnemental (LEGACY)
  rechauffementClimatique: z
    .number()
    .min(0, "L'impact de réchauffement climatique doit être positif")
    .optional(),

  epuisementRessources: z
    .number()
    .min(0, "L'impact d'épuisement des ressources doit être positif")
    .optional(),

  acidification: z
    .number()
    .min(0, "L'impact d'acidification doit être positif")
    .optional(),

  eutrophisation: z
    .number()
    .min(0, "L'impact d'eutrophisation doit être positif")
    .optional(),

  // ========== NOUVEAUX CHAMPS - PRIX ACHAT ==========
  // Prix d'achat fournisseur pour l'ACHAT (1, 2, 3 ans)
  prixAchatAchat1An: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .optional(),

  prixAchatAchat2Ans: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .optional(),

  prixAchatAchat3Ans: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .optional(),

  // Prix unitaire Moduloop pour l'ACHAT (1, 2, 3 ans)
  prixUnitaireAchat1An: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  prixUnitaireAchat2Ans: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  prixUnitaireAchat3Ans: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  // Prix de vente total Moduloop pour l'ACHAT (1, 2, 3 ans)
  prixVenteAchat1An: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  prixVenteAchat2Ans: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  prixVenteAchat3Ans: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  // Marge appliquée pour l'ACHAT (coefficient)
  margeCoefficientAchat: z
    .number()
    .min(1, "Le coefficient de marge doit être au minimum de 1 (0% de marge)")
    .max(10, "Le coefficient de marge ne peut pas dépasser 10 (900% de marge)")
    .optional(),

  // ========== NOUVEAUX CHAMPS - PRIX LOCATION ==========
  // Prix d'achat fournisseur pour la LOCATION (1, 2, 3 ans)
  prixAchatLocation1An: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .optional(),

  prixAchatLocation2Ans: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .optional(),

  prixAchatLocation3Ans: z
    .number()
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€")
    .optional(),

  // Prix unitaire Moduloop pour la LOCATION (1, 2, 3 ans)
  prixUnitaireLocation1An: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  prixUnitaireLocation2Ans: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  prixUnitaireLocation3Ans: z
    .number()
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€")
    .optional(),

  // Prix de vente total Moduloop pour la LOCATION (1, 2, 3 ans)
  prixVenteLocation1An: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  prixVenteLocation2Ans: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  prixVenteLocation3Ans: z
    .number()
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€")
    .optional(),

  // Marge appliquée pour la LOCATION (coefficient)
  margeCoefficientLocation: z
    .number()
    .min(1, "Le coefficient de marge doit être au minimum de 1 (0% de marge)")
    .max(10, "Le coefficient de marge ne peut pas dépasser 10 (900% de marge)")
    .optional(),

  // ========== NOUVEAUX CHAMPS - IMPACT ENVIRONNEMENTAL ACHAT ==========
  rechauffementClimatiqueAchat: z
    .number()
    .min(0, "L'impact de réchauffement climatique doit être positif")
    .optional(),

  epuisementRessourcesAchat: z
    .number()
    .min(0, "L'impact d'épuisement des ressources doit être positif")
    .optional(),

  acidificationAchat: z
    .number()
    .min(0, "L'impact d'acidification doit être positif")
    .optional(),

  eutrophisationAchat: z
    .number()
    .min(0, "L'impact d'eutrophisation doit être positif")
    .optional(),

  // ========== NOUVEAUX CHAMPS - IMPACT ENVIRONNEMENTAL LOCATION ==========
  rechauffementClimatiqueLocation: z
    .number()
    .min(0, "L'impact de réchauffement climatique doit être positif")
    .optional(),

  epuisementRessourcesLocation: z
    .number()
    .min(0, "L'impact d'épuisement des ressources doit être positif")
    .optional(),

  acidificationLocation: z
    .number()
    .min(0, "L'impact d'acidification doit être positif")
    .optional(),

  eutrophisationLocation: z
    .number()
    .min(0, "L'impact d'eutrophisation doit être positif")
    .optional(),

  // ========== CHAMPS COMMUNS ==========
  // Surface occupée (m²) - optionnel pour les produits, requis pour les kits
  surfaceM2: z
    .number()
    .min(0, "La surface doit être positive")
    .max(10000, "La surface ne peut pas dépasser 10,000 m²")
    .optional(),

  // Quantité - optionnel pour les produits, requis pour les kits
  quantite: z
    .number()
    .int("La quantité doit être un nombre entier")
    .min(0, "La quantité doit être positive")
    .max(999999, "La quantité ne peut pas dépasser 999,999")
    .optional(),

  // Image (base64)
  image: z
    .string()
    .startsWith("data:image/", "L'image doit être au format base64 valide")
    .optional(),
});

export const productUpdateSchema = productSchema.partial().extend({
  id: z.string().cuid("ID de produit invalide"),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;

// Types pour les modes achat/location
export type PurchaseRentalMode = 'achat' | 'location';
export type ProductPeriod = '1an' | '2ans' | '3ans';

// Schéma pour la recherche et les filtres
export const productFilterSchema = z.object({
  search: z.string().optional(),
  reference: z.string().optional(),
  minPrix: z.number().min(0).optional(),
  maxPrix: z.number().min(0).optional(),
  minQuantite: z.number().int().min(0).optional(),
  maxQuantite: z.number().int().min(0).optional(),
  createdBy: z.string().optional(),
  sortBy: z
    .enum(["nom", "reference", "prixVente1An", "quantite", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type ProductFilter = z.infer<typeof productFilterSchema>;

// Schémas spécialisés pour l'achat et la location (pour les formulaires)
export const productAchatSchema = z.object({
  // Champs communs
  nom: productSchema.shape.nom,
  reference: productSchema.shape.reference,
  description: productSchema.shape.description,
  surfaceM2: productSchema.shape.surfaceM2,
  quantite: productSchema.shape.quantite,
  image: productSchema.shape.image,

  // Prix achat (au moins 1 an requis)
  prixAchatAchat1An: z
    .number("Le prix d'achat est requis")
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€"),
  
  prixAchatAchat2Ans: productSchema.shape.prixAchatAchat2Ans,
  prixAchatAchat3Ans: productSchema.shape.prixAchatAchat3Ans,

  prixUnitaireAchat1An: z
    .number("Le prix unitaire est requis")
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€"),
    
  prixUnitaireAchat2Ans: productSchema.shape.prixUnitaireAchat2Ans,
  prixUnitaireAchat3Ans: productSchema.shape.prixUnitaireAchat3Ans,

  prixVenteAchat1An: z
    .number("Le prix de vente est requis")
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€"),
    
  prixVenteAchat2Ans: productSchema.shape.prixVenteAchat2Ans,
  prixVenteAchat3Ans: productSchema.shape.prixVenteAchat3Ans,

  margeCoefficientAchat: z
    .number("Le coefficient de marge est requis")
    .min(1, "Le coefficient de marge doit être au minimum de 1 (0% de marge)")
    .max(10, "Le coefficient de marge ne peut pas dépasser 10 (900% de marge)"),

  // Impact environnemental achat (requis)
  rechauffementClimatiqueAchat: z
    .number("L'impact de réchauffement climatique est requis")
    .min(0, "L'impact de réchauffement climatique doit être positif"),

  epuisementRessourcesAchat: z
    .number("L'impact d'épuisement des ressources est requis")
    .min(0, "L'impact d'épuisement des ressources doit être positif"),

  acidificationAchat: z
    .number("L'impact d'acidification est requis")
    .min(0, "L'impact d'acidification doit être positif"),

  eutrophisationAchat: z
    .number("L'impact d'eutrophisation est requis")
    .min(0, "L'impact d'eutrophisation doit être positif"),
});

export const productLocationSchema = z.object({
  // Champs communs
  nom: productSchema.shape.nom,
  reference: productSchema.shape.reference,
  description: productSchema.shape.description,
  surfaceM2: productSchema.shape.surfaceM2,
  quantite: productSchema.shape.quantite,
  image: productSchema.shape.image,

  // Prix location (au moins 1 an requis)
  prixAchatLocation1An: z
    .number("Le prix d'achat est requis")
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€"),
    
  prixAchatLocation2Ans: productSchema.shape.prixAchatLocation2Ans,
  prixAchatLocation3Ans: productSchema.shape.prixAchatLocation3Ans,

  prixUnitaireLocation1An: z
    .number("Le prix unitaire est requis")
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€"),
    
  prixUnitaireLocation2Ans: productSchema.shape.prixUnitaireLocation2Ans,
  prixUnitaireLocation3Ans: productSchema.shape.prixUnitaireLocation3Ans,

  prixVenteLocation1An: z
    .number("Le prix de vente est requis")
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€"),
    
  prixVenteLocation2Ans: productSchema.shape.prixVenteLocation2Ans,
  prixVenteLocation3Ans: productSchema.shape.prixVenteLocation3Ans,

  margeCoefficientLocation: z
    .number("Le coefficient de marge est requis")
    .min(1, "Le coefficient de marge doit être au minimum de 1 (0% de marge)")
    .max(10, "Le coefficient de marge ne peut pas dépasser 10 (900% de marge)"),

  // Impact environnemental location (requis)
  rechauffementClimatiqueLocation: z
    .number("L'impact de réchauffement climatique est requis")
    .min(0, "L'impact de réchauffement climatique doit être positif"),

  epuisementRessourcesLocation: z
    .number("L'impact d'épuisement des ressources est requis")
    .min(0, "L'impact d'épuisement des ressources doit être positif"),

  acidificationLocation: z
    .number("L'impact d'acidification est requis")
    .min(0, "L'impact d'acidification doit être positif"),

  eutrophisationLocation: z
    .number("L'impact d'eutrophisation est requis")
    .min(0, "L'impact d'eutrophisation doit être positif"),
});

export type ProductAchatData = z.infer<typeof productAchatSchema>;
export type ProductLocationData = z.infer<typeof productLocationSchema>;