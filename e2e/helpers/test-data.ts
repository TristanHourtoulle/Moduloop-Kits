export function createProductData(overrides: Record<string, unknown> = {}) {
  const id = Date.now()
  return {
    nom: `E2E Product ${id}`,
    reference: `E2E-REF-${id}`,
    description: 'Test product created by E2E',
    quantite: 10,
    surfaceM2: 1.5,
    prixAchat1An: 100,
    prixUnitaire1An: 120,
    prixVente1An: 150,
    margeCoefficient: 1.2,
    ...overrides,
  }
}

export function createKitData(overrides: Record<string, unknown> = {}) {
  const id = Date.now()
  return {
    nom: `E2E Kit ${id}`,
    style: 'Moderne',
    description: 'Test kit created by E2E',
    ...overrides,
  }
}

export function createProjectData(overrides: Record<string, unknown> = {}) {
  const id = Date.now()
  return {
    nom: `E2E Project ${id}`,
    description: 'Test project created by E2E',
    ...overrides,
  }
}
