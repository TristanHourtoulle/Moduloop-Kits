import { describe, it, expect } from 'vitest';
import type { Product, KitProduct, Kit, ProjectKit, Project } from '@/lib/types/project';
import { ProjectStatus } from '@/lib/types/project';
import {
  calculateProjectPriceTotals,
  calculateProjectPurchaseCosts,
  calculateProjectRentalCosts,
  getProjectKitBreakdown,
  calculateEnvironmentalSavings,
  calculateBreakEvenPoint,
} from './calculations';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
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

function makeKitProduct(
  quantite: number,
  productOverrides: Partial<Product> = {}
): KitProduct {
  return {
    id: `kp-${Math.random()}`,
    kitId: 'kit-1',
    productId: 'prod-1',
    quantite,
    product: makeProduct(productOverrides),
  };
}

function makeKit(kitProducts: KitProduct[], overrides: Partial<Kit> = {}): Kit {
  return {
    id: 'kit-1',
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

function makeProjectKit(
  quantite: number,
  kit: Kit,
  overrides: Partial<ProjectKit> = {}
): ProjectKit {
  return {
    id: `pk-${Math.random()}`,
    projectId: 'project-1',
    kitId: kit.id,
    quantite,
    kit,
    ...overrides,
  };
}

function makeProject(projectKits: ProjectKit[] = []): Project {
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

describe('calculateProjectPriceTotals', () => {
  it('returns all zeros when projectKits is undefined', () => {
    const project = { ...makeProject(), projectKits: undefined };
    const totals = calculateProjectPriceTotals(project);
    expect(totals).toEqual({ achat: 0, location1an: 0, location2ans: 0, location3ans: 0 });
  });

  it('returns all zeros for empty projectKits', () => {
    const project = makeProject([]);
    const totals = calculateProjectPriceTotals(project);
    expect(totals).toEqual({ achat: 0, location1an: 0, location2ans: 0, location3ans: 0 });
  });

  it('calculates totals for single kit with single product', () => {
    const product = makeProduct({
      prixVenteAchat: 1000,
      prixVenteLocation1An: 50,   // 50€/month, 1-year commitment
      prixVenteLocation2Ans: 40,  // 40€/month, 2-year commitment
      prixVenteLocation3Ans: 30,  // 30€/month, 3-year commitment
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const projectKit = makeProjectKit(1, kit);
    const project = makeProject([projectKit]);

    const totals = calculateProjectPriceTotals(project);
    expect(totals.achat).toBe(1000);
    expect(totals.location1an).toBe(50);
    expect(totals.location2ans).toBe(40);
    expect(totals.location3ans).toBe(30);
  });

  it('applies quantity cascade: kitProduct.quantite * projectKit.quantite', () => {
    const product = makeProduct({
      prixVenteAchat: 100,
      prixVenteLocation1An: 10,
    });
    const kitProduct = makeKitProduct(3, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const projectKit = makeProjectKit(2, kit); // 2 kits * 3 products = 6 units
    const project = makeProject([projectKit]);

    const totals = calculateProjectPriceTotals(project);
    expect(totals.achat).toBe(600);      // 100 * 6
    expect(totals.location1an).toBe(60); // 10 * 6
  });

  it('sums across multiple kits', () => {
    const product1 = makeProduct({ prixVenteAchat: 100 });
    const product2 = makeProduct({ prixVenteAchat: 200 });

    const kit1 = makeKit([makeKitProduct(1, product1)]);
    const kit2 = makeKit([makeKitProduct(1, product2)]);

    const project = makeProject([
      makeProjectKit(1, kit1),
      makeProjectKit(1, kit2),
    ]);

    const totals = calculateProjectPriceTotals(project);
    expect(totals.achat).toBe(300);
  });

  it('skips kits without kitProducts', () => {
    const kit = { ...makeKit([]), kitProducts: undefined };
    const project = makeProject([makeProjectKit(1, kit as Kit)]);

    const totals = calculateProjectPriceTotals(project);
    expect(totals.achat).toBe(0);
  });
});

describe('calculateProjectPurchaseCosts', () => {
  it('returns empty breakdown for project without kits', () => {
    const project = makeProject();
    const costs = calculateProjectPurchaseCosts(project);
    expect(costs).toEqual({ totalPrice: 0, totalCost: 0, totalMargin: 0 });
  });

  it('calculates price, cost, and margin', () => {
    const product = makeProduct({
      prixVenteAchat: 150,
      prixAchatAchat: 100,
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const costs = calculateProjectPurchaseCosts(project);
    expect(costs.totalPrice).toBe(150);
    expect(costs.totalCost).toBe(100);
    expect(costs.totalMargin).toBe(50);
  });

  it('applies quantity cascade', () => {
    const product = makeProduct({
      prixVenteAchat: 100,
      prixAchatAchat: 60,
    });
    const kitProduct = makeKitProduct(2, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(3, kit)]); // 2*3 = 6

    const costs = calculateProjectPurchaseCosts(project);
    expect(costs.totalPrice).toBe(600);
    expect(costs.totalCost).toBe(360);
    expect(costs.totalMargin).toBe(240);
  });
});

describe('calculateProjectRentalCosts', () => {
  it('calculates rental costs for 1an', () => {
    const product = makeProduct({
      prixVenteLocation1An: 50,
      prixAchatLocation1An: 30,
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const costs = calculateProjectRentalCosts(project, '1an');
    expect(costs.totalPrice).toBe(50);
    expect(costs.totalCost).toBe(30);
    expect(costs.totalMargin).toBe(20);
  });

  it('uses different prices per period', () => {
    const product = makeProduct({
      prixVenteLocation1An: 50,
      prixVenteLocation3Ans: 30,
      prixAchatLocation1An: 30,
      prixAchatLocation3Ans: 20,
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const costs1an = calculateProjectRentalCosts(project, '1an');
    const costs3ans = calculateProjectRentalCosts(project, '3ans');
    expect(costs1an.totalPrice).toBe(50);
    expect(costs3ans.totalPrice).toBe(30);
  });
});

describe('getProjectKitBreakdown', () => {
  it('returns empty array when projectKits is undefined', () => {
    const project = { ...makeProject(), projectKits: undefined };
    expect(getProjectKitBreakdown(project, 'achat')).toEqual([]);
  });

  it('returns per-kit breakdown', () => {
    const product = makeProduct({
      prixVenteAchat: 150,
      prixAchatAchat: 100,
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct], { nom: 'Kit A' });
    const project = makeProject([makeProjectKit(2, kit)]);

    const breakdown = getProjectKitBreakdown(project, 'achat');
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].kitName).toBe('Kit A');
    expect(breakdown[0].quantity).toBe(2);
    expect(breakdown[0].totalPrice).toBe(300);  // 150 * 1 * 2
    expect(breakdown[0].totalCost).toBe(200);    // 100 * 1 * 2
    expect(breakdown[0].totalMargin).toBe(100);
  });

  it('calculates margin percentage', () => {
    const product = makeProduct({
      prixVenteAchat: 200,
      prixAchatAchat: 100,
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const breakdown = getProjectKitBreakdown(project, 'achat');
    // margin% = (100 / 200) * 100 = 50%
    expect(breakdown[0].marginPercentage).toBe(50);
  });

  it('returns 0 margin percentage when totalPrice is 0', () => {
    const product = makeProduct(); // all prices default to 0 via legacy
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const breakdown = getProjectKitBreakdown(project, 'achat');
    expect(breakdown[0].marginPercentage).toBe(0);
  });

  it('filters out kits without kitProducts', () => {
    const kit = { ...makeKit([]), kitProducts: undefined };
    const project = makeProject([makeProjectKit(1, kit as Kit)]);

    const breakdown = getProjectKitBreakdown(project, 'achat');
    expect(breakdown).toHaveLength(0);
  });
});

describe('calculateEnvironmentalSavings', () => {
  it('returns all zeros when projectKits is undefined', () => {
    const project = { ...makeProject(), projectKits: undefined };
    const savings = calculateEnvironmentalSavings(project);
    expect(savings).toEqual({
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
    });
  });

  it('aggregates location impact with Math.abs', () => {
    const product = makeProduct({
      rechauffementClimatiqueLocation: -10,
      epuisementRessourcesLocation: 20,
      acidificationLocation: -30,
      eutrophisationLocation: 40,
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const savings = calculateEnvironmentalSavings(project);
    expect(savings.rechauffementClimatique).toBe(10);  // abs(-10)
    expect(savings.epuisementRessources).toBe(20);
    expect(savings.acidification).toBe(30);             // abs(-30)
    expect(savings.eutrophisation).toBe(40);
  });

  it('applies quantity cascade', () => {
    const product = makeProduct({
      rechauffementClimatiqueLocation: 5,
    });
    const kitProduct = makeKitProduct(3, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(2, kit)]); // 3*2 = 6

    const savings = calculateEnvironmentalSavings(project);
    expect(savings.rechauffementClimatique).toBe(30); // 5 * 6
  });

  it('uses location mode only, not achat', () => {
    const product = makeProduct({
      rechauffementClimatiqueAchat: 100, // should be ignored
      rechauffementClimatiqueLocation: 5,
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const savings = calculateEnvironmentalSavings(project);
    expect(savings.rechauffementClimatique).toBe(5);
  });
});

describe('calculateBreakEvenPoint', () => {
  it('returns null when rental price is 0', () => {
    const product = makeProduct({
      prixVenteAchat: 1000,
      // no location price = falls back to 0
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    expect(calculateBreakEvenPoint(project)).toBeNull();
  });

  it('calculates break-even as purchase / rental', () => {
    const product = makeProduct({
      prixVenteAchat: 1200,
      prixVenteLocation1An: 100, // 100€/month
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const breakEven = calculateBreakEvenPoint(project);
    // 1200 / 100 = 12
    expect(breakEven).toBe(12);
  });

  it('returns fractional break-even values', () => {
    const product = makeProduct({
      prixVenteAchat: 1000,
      prixVenteLocation1An: 300,
    });
    const kitProduct = makeKitProduct(1, product);
    Object.assign(kitProduct, { product });
    const kit = makeKit([kitProduct]);
    const project = makeProject([makeProjectKit(1, kit)]);

    const breakEven = calculateBreakEvenPoint(project);
    expect(breakEven).toBeCloseTo(3.333, 2);
  });

  it('returns null for project without kits', () => {
    const project = makeProject();
    // Both purchase and rental are 0, so rental = 0 → null
    expect(calculateBreakEvenPoint(project)).toBeNull();
  });
});
