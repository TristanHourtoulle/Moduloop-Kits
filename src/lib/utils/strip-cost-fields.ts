/**
 * Strips internal cost and margin fields from product data before sending to non-admin users.
 * Defense in depth: ensures prixAchat*, prixUnitaire*, and margeCoefficient* fields
 * are never exposed to USER-role users, even if frontend checks are bypassed.
 */

const COST_FIELD_PREFIXES = ['prixAchat', 'prixUnitaire', 'margeCoefficient'] as const

function isCostField(key: string): boolean {
  return COST_FIELD_PREFIXES.some((prefix) => key.startsWith(prefix))
}

/**
 * Strips cost/margin fields from a single product-like object.
 * Returns a new object without prixAchat*, prixUnitaire*, margeCoefficient* fields.
 */
export function stripCostFieldsFromProduct<T extends Record<string, unknown>>(product: T): T {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(product)) {
    if (!isCostField(key)) {
      result[key] = value
    }
  }

  return result as T
}

/**
 * Recursively strips cost/margin fields from any data structure containing products.
 * Handles all nesting patterns:
 * - Direct product objects (with prixAchat* fields)
 * - kitProducts[].product
 * - projectKits[].kit.kitProducts[].product
 * - products[] arrays
 */
export function stripCostFieldsDeep<T>(data: T): T {
  if (data === null || data === undefined || typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => stripCostFieldsDeep(item)) as T
  }

  const obj = data as Record<string, unknown>
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (key === 'product' && value !== null && typeof value === 'object') {
      result[key] = stripCostFieldsFromProduct(value as Record<string, unknown>)
    } else if (key === 'products' && Array.isArray(value)) {
      result[key] = value.map((p) =>
        p !== null && typeof p === 'object'
          ? stripCostFieldsFromProduct(p as Record<string, unknown>)
          : p,
      )
    } else if ((key === 'kitProducts' || key === 'projectKits') && Array.isArray(value)) {
      result[key] = value.map((item) => stripCostFieldsDeep(item))
    } else if (key === 'kit' && value !== null && typeof value === 'object') {
      result[key] = stripCostFieldsDeep(value)
    } else {
      result[key] = value
    }
  }

  return result as T
}
