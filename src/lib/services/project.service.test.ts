import { describe, it, expect } from 'vitest';
import { calculateProjectTotals } from './project.service';
import { type Project } from '../types/project';

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

const makeProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  nom: 'Test Project',
  status: 'ACTIF' as never,
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
        {
          id: 'pk-1',
          projectId: 'proj-1',
          kitId: 'kit-1',
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
            kitProducts: [
              {
                id: 'kp-1',
                kitId: 'kit-1',
                productId: 'prod-1',
                quantite: 3,
                product: makeProduct() as never,
              },
            ],
          },
        },
      ],
    });

    const result = calculateProjectTotals(project);

    // prixVente=200, kitProduct.quantite=3, projectKit.quantite=2 => 200*3*2=1200
    expect(result.totalPrix).toBe(1200);
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
      projectKits: [
        {
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
        },
      ],
    });

    const result = calculateProjectTotals(project);

    expect(result.totalSurface).toBe(42);
  });

  it('calculates surface from kits when override is disabled', () => {
    const project = makeProject({
      surfaceOverride: false,
      projectKits: [
        {
          id: 'pk-1',
          projectId: 'proj-1',
          kitId: 'kit-1',
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
        },
      ],
    });

    const result = calculateProjectTotals(project);

    expect(result.totalSurface).toBe(30);
  });

  it('handles kit with null product gracefully', () => {
    const project = makeProject({
      projectKits: [
        {
          id: 'pk-1',
          projectId: 'proj-1',
          kitId: 'kit-1',
          quantite: 1,
          kit: {
            id: 'kit-1',
            nom: 'Kit 1',
            style: 'modern',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            createdById: 'user-1',
            updatedById: 'user-1',
            kitProducts: [
              {
                id: 'kp-1',
                kitId: 'kit-1',
                productId: 'prod-1',
                quantite: 1,
                product: undefined,
              },
            ],
          },
        },
      ],
    });

    const result = calculateProjectTotals(project);

    expect(result.totalPrix).toBe(0);
  });
});
