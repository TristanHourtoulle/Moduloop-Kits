import { z } from 'zod'

export const connexionSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email('Adresse e-mail invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

export const inscriptionSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    email: z
      .string()
      .min(1, "L'adresse e-mail est requise")
      .email('Adresse e-mail invalide'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
      ),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

export const motDePasseOublieSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email('Adresse e-mail invalide'),
})

/** Server-side schema for sign-up action (maps to Better Auth fields) */
export const registerActionSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  firstName: z.string().min(1),
  password: z.string().min(8),
})

export type ConnexionFormData = z.infer<typeof connexionSchema>
export type InscriptionFormData = z.infer<typeof inscriptionSchema>
export type MotDePasseOublieFormData = z.infer<typeof motDePasseOublieSchema>
export type RegisterActionData = z.infer<typeof registerActionSchema>
