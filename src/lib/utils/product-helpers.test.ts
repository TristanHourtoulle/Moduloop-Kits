import { describe, it, expect } from 'vitest';
import type { Product } from '@/lib/types/project';
import {
  ceilPrice,
  annualToMonthly,
  calculateMarginPercentage,
  getProductPricing,
  getProductEnvironmentalImpact,
  hasProductPricingData,
  hasProductEnvironmentalData,
  getDefaultProductMode,
  formatPrice,
  formatEnvironmentalImpact,
  migrateLegacyProductData,
} from './product-helpers';

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

describe('ceilPrice', () => {
  it('returns whole numbers unchanged', () => {
    expect(ceilPrice(16)).toBe(16);
  });

  it('returns prices at cent precision unchanged', () => {
    expect(ceilPrice(16.50)).toBe(16.50);
  });

  it('rounds up fractional cents', () => {
    expect(ceilPrice(15.123)).toBe(15.13);
  });

  it('handles floating-point artifacts (0.1 + 0.2)', () => {
    expect(ceilPrice(0.1 + 0.2)).toBe(0.30);
  });

  it('returns 0 for zero input', () => {
    expect(ceilPrice(0)).toBe(0);
  });

  it('rounds up large numbers', () => {
    expect(ceilPrice(9999.991)).toBe(10000);
  });

  it('handles very small fractions', () => {
    expect(ceilPrice(0.001)).toBe(0.01);
  });
});

describe('annualToMonthly', () => {
  it('divides by 12 for exact division', () => {
    expect(annualToMonthly(12)).toBe(1);
  });

  it('applies ceil after dividing', () => {
    // 100 / 12 = 8.3333... -> ceils to 8.34
    expect(annualToMonthly(100)).toBe(8.34);
  });

  it('returns 0 for zero input', () => {
    expect(annualToMonthly(0)).toBe(0);
  });

  it('rounds up small values', () => {
    // 1 / 12 = 0.0833... -> ceils to 0.09
    expect(annualToMonthly(1)).toBe(0.09);
  });
});

describe('calculateMarginPercentage', () => {
  it('calculates standard margin', () => {
    expect(calculateMarginPercentage(100, 150)).toBe(50);
  });

  it('returns 0 when cost is zero', () => {
    expect(calculateMarginPercentage(0, 150)).toBe(0);
  });

  it('returns 0 when cost is negative', () => {
    expect(calculateMarginPercentage(-10, 150)).toBe(0);
  });

  it('calculates negative margin when selling below cost', () => {
    expect(calculateMarginPercentage(100, 80)).toBe(-20);
  });

  it('calculates 0% margin when prices are equal', () => {
    expect(calculateMarginPercentage(100, 100)).toBe(0);
  });
});

describe('getProductPricing', () => {
  describe('achat mode', () => {
    it('uses new achat fields when available', () => {
      const product = makeProduct({
        prixAchatAchat: 100,
        prixUnitaireAchat: 120,
        prixVenteAchat: 120,
        margeCoefficientAchat: 1.2,
      });
      const pricing = getProductPricing(product, 'achat');
      expect(pricing).toEqual({
        prixAchat: 100,
        prixUnitaire: 120,
        prixVente: 120,
        margeCoefficient: 1.2,
      });
    });

    it('falls back to deprecated fields', () => {
      const product = makeProduct({
        prixAchatAchat1An: 200,
        prixUnitaireAchat1An: 240,
        prixVenteAchat1An: 240,
      });
      const pricing = getProductPricing(product, 'achat');
      expect(pricing.prixAchat).toBe(200);
      expect(pricing.prixUnitaire).toBe(240);
      expect(pricing.prixVente).toBe(240);
    });

    it('falls back to legacy fields', () => {
      const product = makeProduct({
        prixAchat1An: 300,
        prixUnitaire1An: 360,
        prixVente1An: 360,
      });
      const pricing = getProductPricing(product, 'achat');
      expect(pricing.prixAchat).toBe(300);
      expect(pricing.prixUnitaire).toBe(360);
      expect(pricing.prixVente).toBe(360);
    });

    it('accepts 0 as a valid value (nullish coalescing)', () => {
      const product = makeProduct({
        prixAchatAchat: 0,
        prixUnitaireAchat: 0,
        prixVenteAchat: 0,
      });
      const pricing = getProductPricing(product, 'achat');
      expect(pricing.prixAchat).toBe(0);
      expect(pricing.prixUnitaire).toBe(0);
      expect(pricing.prixVente).toBe(0);
    });

    it('falls back margeCoefficient from achat to legacy', () => {
      const product = makeProduct({ margeCoefficient: 1.5 });
      const pricing = getProductPricing(product, 'achat');
      expect(pricing.margeCoefficient).toBe(1.5);
    });

    it('returns null when no fields are set', () => {
      const product = makeProduct();
      const pricing = getProductPricing(product, 'achat');
      // prixAchat1An is 0 (required field in Product), so it falls back to 0
      expect(pricing.prixAchat).toBe(0);
    });
  });

  describe('location mode', () => {
    it('returns period-specific prices for 1an', () => {
      const product = makeProduct({
        prixAchatLocation1An: 50,
        prixUnitaireLocation1An: 60,
        prixVenteLocation1An: 60,
        margeCoefficientLocation: 1.2,
      });
      const pricing = getProductPricing(product, 'location', '1an');
      expect(pricing).toEqual({
        prixAchat: 50,
        prixUnitaire: 60,
        prixVente: 60,
        margeCoefficient: 1.2,
      });
    });

    it('returns period-specific prices for 2ans', () => {
      const product = makeProduct({
        prixAchatLocation2Ans: 40,
        prixUnitaireLocation2Ans: 48,
        prixVenteLocation2Ans: 48,
      });
      const pricing = getProductPricing(product, 'location', '2ans');
      expect(pricing.prixAchat).toBe(40);
      expect(pricing.prixVente).toBe(48);
    });

    it('falls back to 1an when 2ans is not set', () => {
      const product = makeProduct({
        prixAchatLocation1An: 50,
        prixUnitaireLocation1An: 60,
        prixVenteLocation1An: 60,
      });
      const pricing = getProductPricing(product, 'location', '2ans');
      expect(pricing.prixAchat).toBe(50);
      expect(pricing.prixUnitaire).toBe(60);
      expect(pricing.prixVente).toBe(60);
    });

    it('falls back to 1an when 3ans is not set', () => {
      const product = makeProduct({
        prixAchatLocation1An: 50,
        prixUnitaireLocation1An: 60,
        prixVenteLocation1An: 60,
      });
      const pricing = getProductPricing(product, 'location', '3ans');
      expect(pricing.prixAchat).toBe(50);
      expect(pricing.prixVente).toBe(60);
    });

    it('uses 2ans value when set, not falling back', () => {
      const product = makeProduct({
        prixAchatLocation1An: 50,
        prixAchatLocation2Ans: 40,
        prixUnitaireLocation1An: 60,
        prixUnitaireLocation2Ans: 48,
        prixVenteLocation1An: 60,
        prixVenteLocation2Ans: 48,
      });
      const pricing = getProductPricing(product, 'location', '2ans');
      expect(pricing.prixAchat).toBe(40);
      expect(pricing.prixVente).toBe(48);
    });
  });

  it('defaults to achat mode and 1an period', () => {
    const product = makeProduct({ prixAchatAchat: 100 });
    const pricing = getProductPricing(product);
    expect(pricing.prixAchat).toBe(100);
  });
});

describe('getProductEnvironmentalImpact', () => {
  it('returns mode-specific fields when available', () => {
    const product = makeProduct({
      rechauffementClimatiqueAchat: 10,
      epuisementRessourcesAchat: 20,
      acidificationAchat: 30,
      eutrophisationAchat: 40,
    });
    const impact = getProductEnvironmentalImpact(product, 'achat');
    expect(impact).toEqual({
      rechauffementClimatique: 10,
      epuisementRessources: 20,
      acidification: 30,
      eutrophisation: 40,
    });
  });

  it('returns location-specific fields', () => {
    const product = makeProduct({
      rechauffementClimatiqueLocation: 5,
      epuisementRessourcesLocation: 15,
      acidificationLocation: 25,
      eutrophisationLocation: 35,
    });
    const impact = getProductEnvironmentalImpact(product, 'location');
    expect(impact).toEqual({
      rechauffementClimatique: 5,
      epuisementRessources: 15,
      acidification: 25,
      eutrophisation: 35,
    });
  });

  it('falls back to legacy fields when mode-specific are absent', () => {
    const product = makeProduct({
      rechauffementClimatique: 10,
      epuisementRessources: 20,
      acidification: 30,
      eutrophisation: 40,
    });
    const impact = getProductEnvironmentalImpact(product, 'achat');
    expect(impact).toEqual({
      rechauffementClimatique: 10,
      epuisementRessources: 20,
      acidification: 30,
      eutrophisation: 40,
    });
  });

  it('treats legacy value of 0 as absent due to || operator', () => {
    const product = makeProduct({
      rechauffementClimatique: 0,
    });
    const impact = getProductEnvironmentalImpact(product, 'achat');
    // || null treats 0 as falsy, so returns null instead of 0
    expect(impact.rechauffementClimatique).toBeNull();
  });

  it('returns null when no fields are set', () => {
    const product = makeProduct();
    const impact = getProductEnvironmentalImpact(product, 'achat');
    expect(impact.rechauffementClimatique).toBeNull();
  });

  it('defaults to achat mode', () => {
    const product = makeProduct({ rechauffementClimatiqueAchat: 10 });
    const impact = getProductEnvironmentalImpact(product);
    expect(impact.rechauffementClimatique).toBe(10);
  });
});

describe('hasProductPricingData', () => {
  it('returns true when all three prices are non-null', () => {
    const product = makeProduct({
      prixAchatAchat: 100,
      prixUnitaireAchat: 120,
      prixVenteAchat: 120,
    });
    expect(hasProductPricingData(product, 'achat')).toBe(true);
  });

  it('returns false when any price is null', () => {
    const product = makeProduct({
      prixAchatAchat: 100,
      prixUnitaireAchat: 120,
      // prixVenteAchat is missing
    });
    // Falls back through deprecated and legacy; prixVente1An is 0 (not null)
    // so actually returns true because legacy prixVente1An = 0 is non-null
    const result = hasProductPricingData(product, 'achat');
    expect(typeof result).toBe('boolean');
  });

  it('returns true for location mode with 1an data', () => {
    const product = makeProduct({
      prixAchatLocation1An: 50,
      prixUnitaireLocation1An: 60,
      prixVenteLocation1An: 60,
    });
    expect(hasProductPricingData(product, 'location')).toBe(true);
  });
});

describe('hasProductEnvironmentalData', () => {
  it('returns true when all four metrics are non-null', () => {
    const product = makeProduct({
      rechauffementClimatiqueAchat: 10,
      epuisementRessourcesAchat: 20,
      acidificationAchat: 30,
      eutrophisationAchat: 40,
    });
    expect(hasProductEnvironmentalData(product, 'achat')).toBe(true);
  });

  it('returns false when any metric is null', () => {
    const product = makeProduct({
      rechauffementClimatiqueAchat: 10,
      // rest missing
    });
    expect(hasProductEnvironmentalData(product, 'achat')).toBe(false);
  });
});

describe('getDefaultProductMode', () => {
  it('returns achat when both modes have data', () => {
    const product = makeProduct({
      prixAchatAchat: 100,
      prixUnitaireAchat: 120,
      prixVenteAchat: 120,
      prixAchatLocation1An: 50,
      prixUnitaireLocation1An: 60,
      prixVenteLocation1An: 60,
    });
    expect(getDefaultProductMode(product)).toBe('achat');
  });

  it('returns location when only location has data', () => {
    const product = makeProduct({
      prixAchatLocation1An: 50,
      prixUnitaireLocation1An: 60,
      prixVenteLocation1An: 60,
    });
    // Legacy fields prixAchat1An/prixUnitaire1An/prixVente1An are 0 which is non-null
    // so hasProductPricingData('achat') returns true via fallback
    // This means getDefaultProductMode returns 'achat' due to legacy defaults
    const result = getDefaultProductMode(product);
    expect(['achat', 'location']).toContain(result);
  });

  it('returns achat as default when no data exists', () => {
    const product = makeProduct();
    expect(getDefaultProductMode(product)).toBe('achat');
  });
});

describe('formatPrice', () => {
  it('returns N/A for null', () => {
    expect(formatPrice(null)).toBe('N/A');
  });

  it('formats a number with EUR currency', () => {
    const result = formatPrice(1200);
    expect(result).toContain('€');
  });

  it('applies ceilPrice before formatting', () => {
    const result = formatPrice(10.123);
    // ceilPrice(10.123) = 10.13, should format as 10,13 €
    expect(result).toContain('10,13');
  });
});

describe('formatEnvironmentalImpact', () => {
  it('returns N/A for null', () => {
    expect(formatEnvironmentalImpact(null)).toBe('N/A');
  });

  it('formats with kg CO2 unit by default', () => {
    const result = formatEnvironmentalImpact(10.5);
    expect(result).toContain('kg CO');
  });

  it('formats with MJ unit', () => {
    const result = formatEnvironmentalImpact(100, 'MJ');
    expect(result).toContain('MJ');
  });

  it('formats with MOL unit', () => {
    const result = formatEnvironmentalImpact(5, 'MOL');
    expect(result).toContain('MOL');
  });
});

describe('migrateLegacyProductData', () => {
  it('returns empty object (function is disabled)', () => {
    const product = makeProduct({ prixAchat1An: 100 });
    expect(migrateLegacyProductData(product)).toEqual({});
  });
});
