import { describe, it, expect } from 'vitest';
import type { Product, KitProduct } from '@/lib/types/project';
import { calculateKitPrice, calculateKitImpact } from './calculations';

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

describe('calculateKitPrice', () => {
  it('returns 0 for empty array', () => {
    expect(calculateKitPrice([], 'achat')).toBe(0);
  });

  it('returns 0 for null-ish input', () => {
    expect(calculateKitPrice(null as unknown as KitProduct[], 'achat')).toBe(0);
    expect(calculateKitPrice(undefined as unknown as KitProduct[], 'achat')).toBe(0);
  });

  it('calculates price for single product in achat mode', () => {
    const kitProducts = [
      makeKitProduct(1, { prixVenteAchat: 100 }),
    ];
    expect(calculateKitPrice(kitProducts, 'achat')).toBe(100);
  });

  it('multiplies by quantity', () => {
    const kitProducts = [
      makeKitProduct(3, { prixVenteAchat: 100 }),
    ];
    expect(calculateKitPrice(kitProducts, 'achat')).toBe(300);
  });

  it('sums multiple products', () => {
    const kitProducts = [
      makeKitProduct(2, { prixVenteAchat: 100 }),
      makeKitProduct(1, { prixVenteAchat: 50 }),
    ];
    expect(calculateKitPrice(kitProducts, 'achat')).toBe(250);
  });

  it('uses location prices with period', () => {
    const kitProducts = [
      makeKitProduct(1, { prixVenteLocation1An: 50 }),
    ];
    // DB stores monthly prices; 50 = 50€/month for 1-year commitment
    expect(calculateKitPrice(kitProducts, 'location', '1an')).toBe(50);
  });

  it('uses location 3ans prices', () => {
    const kitProducts = [
      makeKitProduct(2, { prixVenteLocation3Ans: 30 }),
    ];
    // 30€/month for 3-year commitment * 2 units
    expect(calculateKitPrice(kitProducts, 'location', '3ans')).toBe(60);
  });

  it('skips products without product data', () => {
    const kitProducts: KitProduct[] = [
      {
        id: 'kp-1',
        kitId: 'kit-1',
        productId: 'prod-1',
        quantite: 1,
        // product is undefined
      },
      makeKitProduct(1, { prixVenteAchat: 100 }),
    ];
    expect(calculateKitPrice(kitProducts, 'achat')).toBe(100);
  });

  it('treats null prixVente as 0', () => {
    const kitProducts = [
      makeKitProduct(1, {}), // no price fields set except legacy 0
    ];
    // prixVente falls back to legacy prixVente1An = 0
    expect(calculateKitPrice(kitProducts, 'achat')).toBe(0);
  });
});

describe('calculateKitImpact', () => {
  it('returns all zeros for empty array', () => {
    const impact = calculateKitImpact([], 'achat');
    expect(impact).toEqual({
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
      surface: 0,
    });
  });

  it('returns all zeros for null input', () => {
    const impact = calculateKitImpact(null as unknown as KitProduct[], 'achat');
    expect(impact.rechauffementClimatique).toBe(0);
    expect(impact.surface).toBe(0);
  });

  it('aggregates impact for single product', () => {
    const kitProducts = [
      makeKitProduct(2, {
        rechauffementClimatiqueAchat: 10,
        epuisementRessourcesAchat: 20,
        acidificationAchat: 30,
        eutrophisationAchat: 40,
        surfaceM2: 5,
      }),
    ];
    const impact = calculateKitImpact(kitProducts, 'achat');
    expect(impact.rechauffementClimatique).toBe(20); // 10 * 2
    expect(impact.epuisementRessources).toBe(40);    // 20 * 2
    expect(impact.acidification).toBe(60);            // 30 * 2
    expect(impact.eutrophisation).toBe(80);           // 40 * 2
    expect(impact.surface).toBe(10);                  // 5 * 2
  });

  it('sums impact across multiple products', () => {
    const kitProducts = [
      makeKitProduct(1, {
        rechauffementClimatiqueAchat: 10,
        surfaceM2: 5,
      }),
      makeKitProduct(3, {
        rechauffementClimatiqueAchat: 5,
        surfaceM2: 2,
      }),
    ];
    const impact = calculateKitImpact(kitProducts, 'achat');
    expect(impact.rechauffementClimatique).toBe(25); // 10*1 + 5*3
    expect(impact.surface).toBe(11);                 // 5*1 + 2*3
  });

  it('skips products without product data', () => {
    const kitProducts: KitProduct[] = [
      { id: 'kp-1', kitId: 'kit-1', productId: 'prod-1', quantite: 1 },
      makeKitProduct(1, { rechauffementClimatiqueAchat: 10 }),
    ];
    const impact = calculateKitImpact(kitProducts, 'achat');
    expect(impact.rechauffementClimatique).toBe(10);
  });

  it('treats null impact values as 0', () => {
    const kitProducts = [
      makeKitProduct(1, {}), // no impact fields
    ];
    const impact = calculateKitImpact(kitProducts, 'achat');
    expect(impact.rechauffementClimatique).toBe(0);
  });

  it('defaults surfaceM2 to 0 when missing', () => {
    const kitProducts = [
      makeKitProduct(1, { rechauffementClimatiqueAchat: 10 }),
    ];
    const impact = calculateKitImpact(kitProducts, 'achat');
    expect(impact.surface).toBe(0);
  });

  it('uses location-mode impact fields', () => {
    const kitProducts = [
      makeKitProduct(2, {
        rechauffementClimatiqueLocation: 8,
        epuisementRessourcesLocation: 16,
        acidificationLocation: 24,
        eutrophisationLocation: 32,
      }),
    ];
    const impact = calculateKitImpact(kitProducts, 'location');
    expect(impact.rechauffementClimatique).toBe(16); // 8 * 2
    expect(impact.epuisementRessources).toBe(32);
  });
});
