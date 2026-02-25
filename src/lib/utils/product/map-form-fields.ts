/**
 * Maps product form field names (with period suffix) to database column names (without period).
 * Handles the mid-migration schema where form uses `prixAchatAchat1An` but DB uses `prixAchatAchat`.
 */
const FIELD_REMAP: Record<string, string> = {
  prixAchatAchat1An: 'prixAchatAchat',
  prixUnitaireAchat1An: 'prixUnitaireAchat',
  prixVenteAchat1An: 'prixVenteAchat',
}

export function remapProductFormFields(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...data }

  for (const [formField, dbField] of Object.entries(FIELD_REMAP)) {
    if (formField in result) {
      result[dbField] = result[formField]
      delete result[formField]
    }
  }

  return result
}
