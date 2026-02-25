import { z } from 'zod'

const projectStatusEnum = z.enum(['ACTIF', 'TERMINE', 'EN_PAUSE', 'ARCHIVE'])

export const createProjectSchema = z.object({
  nom: z
    .string()
    .min(1, 'Project name is required')
    .max(200, 'Project name must not exceed 200 characters'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  status: projectStatusEnum.optional(),
})

export const replaceProjectSchema = z.object({
  nom: z
    .string()
    .min(1, 'Project name is required')
    .max(200, 'Project name must not exceed 200 characters'),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  status: projectStatusEnum.optional(),
})

export const updateProjectSchema = z.object({
  nom: z
    .string()
    .min(1, 'Project name is required')
    .max(200, 'Project name must not exceed 200 characters')
    .optional(),
  description: z.string().max(2000, 'Description is too long').optional().nullable(),
  status: projectStatusEnum.optional(),
  surfaceManual: z.number().min(0, 'Surface must be positive').nullable().optional(),
  surfaceOverride: z.boolean().optional(),
})

export const updateProjectKitSchema = z.object({
  quantite: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
})

const projectKitItemSchema = z.object({
  kitId: z.string().min(1, 'Kit identifier is required'),
  quantite: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
})

export const projectKitsSchema = z.object({
  kits: z.array(projectKitItemSchema).min(1, 'At least one kit is required'),
})

export type CreateProjectData = z.infer<typeof createProjectSchema>
export type ReplaceProjectData = z.infer<typeof replaceProjectSchema>
export type UpdateProjectData = z.infer<typeof updateProjectSchema>
export type UpdateProjectKitData = z.infer<typeof updateProjectKitSchema>
export type ProjectKitsData = z.infer<typeof projectKitsSchema>
