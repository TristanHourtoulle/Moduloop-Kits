import { z } from "zod";

export const kitProductSchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  quantite: z.number().int().min(1, "La quantité doit être au moins 1"),
});

export const kitSchema = z.object({
  nom: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  style: z
    .string()
    .min(1, "Le style est requis")
    .max(50, "Le style ne peut pas dépasser 50 caractères"),
  description: z.string().optional(),
  products: z.array(kitProductSchema).min(1, "Au moins un produit est requis"),
});

export type KitFormData = z.infer<typeof kitSchema>;
export type KitProductData = z.infer<typeof kitProductSchema>;
