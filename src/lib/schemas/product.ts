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
    .optional(),

  // Prix d'achat fournisseur
  prixAchat1An: z
    .number("Le prix d'achat est requis")
    .min(0, "Le prix d'achat doit être positif")
    .max(999999, "Le prix d'achat ne peut pas dépasser 999,999€"),

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

  // Prix unitaire Moduloop
  prixUnitaire1An: z
    .number("Le prix unitaire est requis")
    .min(0, "Le prix unitaire doit être positif")
    .max(999999, "Le prix unitaire ne peut pas dépasser 999,999€"),

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

  // Prix de vente total Moduloop
  prixVente1An: z
    .number("Le prix de vente est requis")
    .min(0, "Le prix de vente doit être positif")
    .max(999999, "Le prix de vente ne peut pas dépasser 999,999€"),

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

  // Marge appliquée
  margeCoefficient: z
    .number("Le coefficient de marge est requis")
    .min(1, "Le coefficient de marge doit être au minimum de 1 (0% de marge)")
    .max(10, "Le coefficient de marge ne peut pas dépasser 10 (900% de marge)"),

  // Surface occupée (optionnel pour les produits, requis pour les kits)
  surfaceM2: z
    .number()
    .min(0, "La surface doit être positive")
    .max(10000, "La surface ne peut pas dépasser 10,000 m²")
    .optional(),

  // Impact environnemental
  rechauffementClimatique: z
    .number("L'impact de réchauffement climatique est requis")
    .min(0, "L'impact de réchauffement climatique doit être positif"),

  epuisementRessources: z
    .number("L'impact d'épuisement des ressources est requis")
    .min(0, "L'impact d'épuisement des ressources doit être positif"),

  acidification: z
    .number("L'impact d'acidification est requis")
    .min(0, "L'impact d'acidification doit être positif"),

  eutrophisation: z
    .number("L'impact d'eutrophisation est requis")
    .min(0, "L'impact d'eutrophisation doit être positif"),

  // Quantité (optionnel pour les produits, requis pour les kits)
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
