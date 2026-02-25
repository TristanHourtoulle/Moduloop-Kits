/**
 * Merges duplicate product entries by summing their quantities.
 * Used by kit creation and update routes to normalize input.
 */
export function groupDuplicateProducts<
  T extends { productId: string; quantite: number },
>(products: T[]): T[] {
  const grouped = new Map<string, T>()

  for (const product of products) {
    const existing = grouped.get(product.productId)
    if (existing) {
      grouped.set(product.productId, {
        ...existing,
        quantite: existing.quantite + product.quantite,
      })
    } else {
      grouped.set(product.productId, { ...product })
    }
  }

  return Array.from(grouped.values())
}
