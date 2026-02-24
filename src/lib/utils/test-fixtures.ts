import type { Product, KitProduct, Kit, ProjectKit, Project } from '@/lib/types/project';
import { ProjectStatus } from '@/lib/types/project';

let idCounter = 0;

export function resetIdCounter(): void {
  idCounter = 0;
}

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: `prod-${++idCounter}`,
    nom: 'Test Product',
    reference: 'REF-001',
    prixAchat1An: 0,
    prixUnitaire1An: 0,
    prixVente1An: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdById: 'user-1',
    updatedById: 'user-1',
    ...overrides,
  };
}

export function makeKitProduct(
  quantite: number,
  productOverrides: Partial<Product> = {}
): KitProduct {
  const product = makeProduct(productOverrides);
  return {
    id: `kp-${++idCounter}`,
    kitId: 'kit-1',
    productId: product.id,
    quantite,
    product,
  };
}

export function makeKit(
  kitProducts: KitProduct[],
  overrides: Partial<Kit> = {}
): Kit {
  return {
    id: `kit-${++idCounter}`,
    nom: 'Test Kit',
    style: 'modern',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdById: 'user-1',
    updatedById: 'user-1',
    kitProducts,
    ...overrides,
  };
}

export function makeProjectKit(
  quantite: number,
  kit: Kit,
  overrides: Partial<ProjectKit> = {}
): ProjectKit {
  return {
    id: `pk-${++idCounter}`,
    projectId: 'project-1',
    kitId: kit.id,
    quantite,
    kit,
    ...overrides,
  };
}

export function makeProject(projectKits: ProjectKit[] = []): Project {
  return {
    id: 'project-1',
    nom: 'Test Project',
    status: ProjectStatus.ACTIF,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdById: 'user-1',
    projectKits,
  };
}
