import { z } from 'zod'

const projectStatusEnum = z.enum(['ACTIF', 'TERMINE', 'EN_PAUSE', 'ARCHIVE'])

export const createProjectSchema = z.object({
  nom: z
    .string()
    .min(1, 'Le nom du projet est requis')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères'),
  description: z.string().max(2000, 'La description est trop longue').optional().nullable(),
  status: projectStatusEnum.optional(),
})

export const updateProjectSchema = z.object({
  nom: z
    .string()
    .min(1, 'Le nom du projet est requis')
    .max(200, 'Le nom ne peut pas dépasser 200 caractères')
    .optional(),
  description: z.string().max(2000, 'La description est trop longue').optional().nullable(),
  status: projectStatusEnum.optional(),
  surfaceManual: z.number().min(0, 'La surface doit être positive').nullable().optional(),
  surfaceOverride: z.boolean().optional(),
})

const projectKitItemSchema = z.object({
  kitId: z.string().min(1, "L'identifiant du kit est requis"),
  quantite: z.coerce.number().int().min(1, 'La quantité doit être au moins 1'),
})

export const projectKitsSchema = z.object({
  kits: z.array(projectKitItemSchema).min(1, 'Au moins un kit est requis'),
})

export type CreateProjectData = z.infer<typeof createProjectSchema>
export type UpdateProjectData = z.infer<typeof updateProjectSchema>
export type ProjectKitsData = z.infer<typeof projectKitsSchema>
