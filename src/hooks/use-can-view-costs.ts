'use client'

import { useRole } from './use-role'

/**
 * Returns whether the current user can view internal cost and margin data.
 * Only ADMIN and DEV roles have access to prixAchat, prixUnitaire, and margeCoefficient fields.
 */
export function useCanViewCosts(): boolean {
  const { isDevOrAdmin } = useRole()
  return isDevOrAdmin
}
