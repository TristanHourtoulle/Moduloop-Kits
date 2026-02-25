import { describe, it, expect } from 'vitest';
import { calculateProjectTotals } from './project.service';
import { type Project, type ProjectKit, type KitProduct, ProjectStatus } from '../types/project';
import { ceilPrice } from '../utils/product-helpers';

const makeProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 'prod-1',
  nom: 'Product 1',
  reference: 'REF-1',
  prixAchat1An: 100,
  prixUnitaire1An: 50,
  prixVente1An: 200,
  prixAchatAchat: 100,
  prixVenteAchat: 200,
  rechauffementClimatiqueAchat: 10,
  epuisementRessourcesAchat: 20,
  acidificationAchat: 5,
  eutrophisationAchat: 3,
  ...overrides,
});

const makeKitProduct = (overrides: Partial<KitProduct> = {}): KitProduct => ({
  id: 'kp-1',
  kitId: 'kit-1',
  productId: 'prod-1',
  quantite: 1,
  product: makeProduct() as KitProduct['product'],
  ...overrides,
});

const makeProjectKit = (overrides: Partial<ProjectKit> = {}): ProjectKit => ({
  id: 'pk-1',
  projectId: 'proj-1',
  kitId: 'kit-1',
  quantite: 1,
  kit: {
    id: 'kit-1',
    nom: 'Kit 1',
    style: 'modern',
    surfaceM2: 15,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    createdById: 'user-1',
    updatedById: 'user-1',
    kitProducts: [],
  },
  ...overrides,
});

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  nom: 'Test Project',
  status: ProjectStatus.ACTIF,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdById: 'user-1',
  projectKits: [],
  ...overrides,
});

describe('calculateProjectTotals', () => {
  it('returns zeros for project with no kits', () => {
    const result = calculateProjectTotals(makeProject());

    expect(result).toEqual({
      totalPrix: 0,
      totalImpact: {
        rechauffementClimatique: 0,
        epuisementRessources: 0,
        acidification: 0,
        eutrophisation: 0,
      },
      totalSurface: 0,
    });
  });

  it('returns zeros for project with undefined projectKits', () => {
    const result = calculateProjectTotals(makeProject({ projectKits: undefined }));

    expect(result).toEqual({
      totalPrix: 0,
      totalImpact: {
        rechauffementClimatique: 0,
        epuisementRessources: 0,
        acidification: 0,
        eutrophisation: 0,
      },
      totalSurface: 0,
    });
  });

  it('calculates totals from kit products', () => {
    const project = makeProject({
      projectKits: [
        makeProjectKit({
          quantite: 2,
          kit: {
            id: 'kit-1',
            nom: 'Kit 1',
            style: 'modern',
            surfaceM2: 15,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            createdById: 'user-1',
            updatedById: 'user-1',
            kitProducts: [makeKitProduct({ quantite: 3 })],
          },
        }),
      ],
    });

    const result = calculateProjectTotals(project);

    // prixVente=200, kitProduct.quantite=3, projectKit.quantite=2 => ceilPrice(200*3*2)=1200
    expect(result.totalPrix).toBe(ceilPrice(200 * 3 * 2));
    // surfaceM2=15, projectKit.quantite=2 => 15*2=30
    expect(result.totalSurface).toBe(30);
    // rechauffement=10, kitProduct.quantite=3, projectKit.quantite=2 => 10*3*2=60
    expect(result.totalImpact.rechauffementClimatique).toBe(60);
    expect(result.totalImpact.epuisementRessources).toBe(120);
    expect(result.totalImpact.acidification).toBe(30);
    expect(result.totalImpact.eutrophisation).toBe(18);
  });

  it('uses manual surface override when enabled', () => {
    const project = makeProject({
      surfaceOverride: true,
      surfaceManual: 42,
      projectKits: [makeProjectKit()],
    });

    const result = calculateProjectTotals(project);

    expect(result.totalSurface).toBe(42);
  });

  it('calculates surface from kits when override is disabled', () => {
    const project = makeProject({
      surfaceOverride: false,
      projectKits: [
        makeProjectKit({
          quantite: 3,
          kit: {
            id: 'kit-1',
            nom: 'Kit 1',
            style: 'modern',
            surfaceM2: 10,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            createdById: 'user-1',
            updatedById: 'user-1',
            kitProducts: [],
          },
        }),
      ],
    });

    const result = calculateProjectTotals(project);

    expect(result.totalSurface).toBe(30);
  });

  it('handles kit with null product gracefully', () => {
    const project = makeProject({
      projectKits: [
        makeProjectKit({
          kit: {
            id: 'kit-1',
            nom: 'Kit 1',
            style: 'modern',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            createdById: 'user-1',
            updatedById: 'user-1',
            kitProducts: [makeKitProduct({ product: undefined })],
          },
        }),
      ],
    });

    const result = calculateProjectTotals(project);

    expect(result.totalPrix).toBe(0);
  });

  it('aggregates totals across multiple kits with different products', () => {
    const productA = makeProduct({
      id: 'prod-a',
      prixVenteAchat: 100,
      prixVente1An: 100,
      rechauffementClimatiqueAchat: 5,
      epuisementRessourcesAchat: 10,
      acidificationAchat: 2,
      eutrophisationAchat: 1,
    });
    const productB = makeProduct({
      id: 'prod-b',
      prixVenteAchat: 300,
      prixVente1An: 300,
      rechauffementClimatiqueAchat: 15,
      epuisementRessourcesAchat: 30,
      acidificationAchat: 8,
      eutrophisationAchat: 4,
    });

    const project = makeProject({
      projectKits: [
        makeProjectKit({
          id: 'pk-1',
          quantite: 1,
          kit: {
            id: 'kit-1',
            nom: 'Kit A',
            style: 'modern',
            surfaceM2: 10,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            createdById: 'user-1',
            updatedById: 'user-1',
            kitProducts: [
              makeKitProduct({ id: 'kp-a', productId: 'prod-a', quantite: 2, product: productA as KitProduct['product'] }),
            ],
          },
        }),
        makeProjectKit({
          id: 'pk-2',
          kitId: 'kit-2',
          quantite: 3,
          kit: {
            id: 'kit-2',
            nom: 'Kit B',
            style: 'classic',
            surfaceM2: 5,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            createdById: 'user-1',
            updatedById: 'user-1',
            kitProducts: [
              makeKitProduct({ id: 'kp-b', kitId: 'kit-2', productId: 'prod-b', quantite: 1, product: productB as KitProduct['product'] }),
            ],
          },
        }),
      ],
    });

    const result = calculateProjectTotals(project);

    // Kit A: ceilPrice(100*2*1)=200, Kit B: ceilPrice(300*1*3)=900 => 1100
    expect(result.totalPrix).toBe(ceilPrice(100 * 2 * 1) + ceilPrice(300 * 1 * 3));
    // Surface: kit-1(10*1) + kit-2(5*3) = 25
    expect(result.totalSurface).toBe(25);
    // Rechauffement: 5*2*1 + 15*1*3 = 10+45 = 55
    expect(result.totalImpact.rechauffementClimatique).toBe(55);
    // Epuisement: 10*2*1 + 30*1*3 = 20+90 = 110
    expect(result.totalImpact.epuisementRessources).toBe(110);
    // Acidification: 2*2*1 + 8*1*3 = 4+24 = 28
    expect(result.totalImpact.acidification).toBe(28);
    // Eutrophisation: 1*2*1 + 4*1*3 = 2+12 = 14
    expect(result.totalImpact.eutrophisation).toBe(14);
  });
});
