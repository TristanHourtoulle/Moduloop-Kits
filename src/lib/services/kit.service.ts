import { prisma } from '@/lib/db'

/**
 * Validates that all given product IDs exist in the database.
 * Returns the list of missing IDs if any are not found.
 */
export async function validateProductsExist(
  productIds: string[],
): Promise<{ valid: true } | { valid: false; missingIds: string[] }> {
  const existingProducts = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  })

  const existingIds = new Set(existingProducts.map((p) => p.id))
  const missingIds = productIds.filter((id) => !existingIds.has(id))

  if (missingIds.length > 0) {
    return { valid: false, missingIds }
  }

  return { valid: true }
}

/** Shared Prisma include shape for kit responses with full product details. */
export const KIT_WITH_PRODUCTS_INCLUDE = {
  createdBy: {
    select: { id: true, name: true, email: true },
  },
  updatedBy: {
    select: { id: true, name: true, email: true },
  },
  kitProducts: {
    include: {
      product: {
        select: {
          id: true,
          nom: true,
          reference: true,
          prixVente1An: true,
          prixVente2Ans: true,
          prixVente3Ans: true,
          rechauffementClimatique: true,
          epuisementRessources: true,
          acidification: true,
          eutrophisation: true,
        },
      },
    },
  },
} as const
