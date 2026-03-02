import { describe, it, expect } from 'vitest'
import type { Kit, KitProduct } from '@/lib/types/project'
import { makeKitProduct, makeKit, makeProjectKit, makeProject } from '../test-fixtures'

function makeOrphanKitProduct(): KitProduct {
  return {
    id: 'kp-orphan',
    kitId: 'kit-1',
    productId: 'prod-missing',
    quantite: 1,
  }
}
import {
  calculateProjectPriceTotals,
  calculateProjectPurchaseCosts,
  calculateProjectRentalCosts,
  getProjectKitBreakdown,
  calculateEnvironmentalSavings,
  calculateBreakEvenPoint,
  calculateExtendedRentalCost,
} from './calculations'

describe('calculateProjectPriceTotals', () => {
  it('returns all zeros when projectKits is undefined', () => {
    const project = { ...makeProject(), projectKits: undefined }
    const totals = calculateProjectPriceTotals(project)
    expect(totals).toEqual({
      achat: 0,
      location1an: 0,
      location2ans: 0,
      location3ans: 0,
    })
  })

  it('returns all zeros for empty projectKits', () => {
    const project = makeProject([])
    const totals = calculateProjectPriceTotals(project)
    expect(totals).toEqual({
      achat: 0,
      location1an: 0,
      location2ans: 0,
      location3ans: 0,
    })
  })

  it('calculates totals for single kit with single product', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 1000,
      prixVenteLocation1An: 50,
      prixVenteLocation2Ans: 40,
      prixVenteLocation3Ans: 30,
    })
    const kit = makeKit([kitProduct])
    const projectKit = makeProjectKit(1, kit)
    const project = makeProject([projectKit])

    const totals = calculateProjectPriceTotals(project)
    expect(totals.achat).toBe(1000)
    expect(totals.location1an).toBe(50)
    expect(totals.location2ans).toBe(40)
    expect(totals.location3ans).toBe(30)
  })

  it('applies quantity cascade: kitProduct.quantite * projectKit.quantite', () => {
    const kitProduct = makeKitProduct(3, {
      prixVenteAchat: 100,
      prixVenteLocation1An: 10,
    })
    const kit = makeKit([kitProduct])
    const projectKit = makeProjectKit(2, kit) // 2 kits * 3 products = 6 units
    const project = makeProject([projectKit])

    const totals = calculateProjectPriceTotals(project)
    expect(totals.achat).toBe(600) // 100 * 6
    expect(totals.location1an).toBe(60) // 10 * 6
  })

  it('sums across multiple kits', () => {
    const kit1 = makeKit([makeKitProduct(1, { prixVenteAchat: 100 })])
    const kit2 = makeKit([makeKitProduct(1, { prixVenteAchat: 200 })])

    const project = makeProject([makeProjectKit(1, kit1), makeProjectKit(1, kit2)])

    const totals = calculateProjectPriceTotals(project)
    expect(totals.achat).toBe(300)
  })

  it('skips kits without kitProducts', () => {
    const kit = { ...makeKit([]), kitProducts: undefined }
    const project = makeProject([makeProjectKit(1, kit as Kit)])

    const totals = calculateProjectPriceTotals(project)
    expect(totals.achat).toBe(0)
  })
})

describe('calculateProjectPurchaseCosts', () => {
  it('returns empty breakdown for project without kits', () => {
    const project = makeProject()
    const costs = calculateProjectPurchaseCosts(project)
    expect(costs).toEqual({ totalPrice: 0, totalCost: 0, totalMargin: 0 })
  })

  it('calculates price, cost, and margin', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 150,
      prixAchatAchat: 100,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const costs = calculateProjectPurchaseCosts(project)
    expect(costs.totalPrice).toBe(150)
    expect(costs.totalCost).toBe(100)
    expect(costs.totalMargin).toBe(50)
  })

  it('applies quantity cascade', () => {
    const kitProduct = makeKitProduct(2, {
      prixVenteAchat: 100,
      prixAchatAchat: 60,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(3, kit)]) // 2*3 = 6

    const costs = calculateProjectPurchaseCosts(project)
    expect(costs.totalPrice).toBe(600)
    expect(costs.totalCost).toBe(360)
    expect(costs.totalMargin).toBe(240)
  })

  it('skips kits without kitProducts', () => {
    const kit = { ...makeKit([]), kitProducts: undefined }
    const project = makeProject([makeProjectKit(1, kit as Kit)])
    const costs = calculateProjectPurchaseCosts(project)
    expect(costs).toEqual({ totalPrice: 0, totalCost: 0, totalMargin: 0 })
  })

  it('skips kitProducts without product data', () => {
    const kit = makeKit([makeOrphanKitProduct()])
    const project = makeProject([makeProjectKit(1, kit)])
    const costs = calculateProjectPurchaseCosts(project)
    expect(costs).toEqual({ totalPrice: 0, totalCost: 0, totalMargin: 0 })
  })
})

describe('calculateProjectRentalCosts', () => {
  it('calculates rental costs for 1an', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteLocation1An: 50,
      prixAchatLocation1An: 30,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const costs = calculateProjectRentalCosts(project, '1an')
    expect(costs.totalPrice).toBe(50)
    expect(costs.totalCost).toBe(30)
    expect(costs.totalMargin).toBe(20)
  })

  it('uses different prices per period', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteLocation1An: 50,
      prixVenteLocation3Ans: 30,
      prixAchatLocation1An: 30,
      prixAchatLocation3Ans: 20,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const costs1an = calculateProjectRentalCosts(project, '1an')
    const costs3ans = calculateProjectRentalCosts(project, '3ans')
    expect(costs1an.totalPrice).toBe(50)
    expect(costs3ans.totalPrice).toBe(30)
  })

  it('skips kits without kitProducts', () => {
    const kit = { ...makeKit([]), kitProducts: undefined }
    const project = makeProject([makeProjectKit(1, kit as Kit)])
    const costs = calculateProjectRentalCosts(project, '1an')
    expect(costs).toEqual({ totalPrice: 0, totalCost: 0, totalMargin: 0 })
  })
})

describe('getProjectKitBreakdown', () => {
  it('returns empty array when projectKits is undefined', () => {
    const project = { ...makeProject(), projectKits: undefined }
    expect(getProjectKitBreakdown(project, 'achat')).toEqual([])
  })

  it('returns per-kit breakdown', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 150,
      prixAchatAchat: 100,
    })
    const kit = makeKit([kitProduct], { nom: 'Kit A' })
    const project = makeProject([makeProjectKit(2, kit)])

    const breakdown = getProjectKitBreakdown(project, 'achat')
    expect(breakdown).toHaveLength(1)
    const first = breakdown[0]!
    expect(first.kitName).toBe('Kit A')
    expect(first.quantity).toBe(2)
    expect(first.totalPrice).toBe(300) // 150 * 1 * 2
    expect(first.totalCost).toBe(200) // 100 * 1 * 2
    expect(first.totalMargin).toBe(100)
  })

  it('calculates margin percentage', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 200,
      prixAchatAchat: 100,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const breakdown = getProjectKitBreakdown(project, 'achat')
    // margin% = (100 / 200) * 100 = 50%
    expect(breakdown[0]!.marginPercentage).toBe(50)
  })

  it('returns 0 margin percentage when totalPrice is 0', () => {
    const kitProduct = makeKitProduct(1, {}) // all prices default to 0 via legacy
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const breakdown = getProjectKitBreakdown(project, 'achat')
    expect(breakdown[0]!.marginPercentage).toBe(0)
  })

  it('filters out kits without kitProducts', () => {
    const kit = { ...makeKit([]), kitProducts: undefined }
    const project = makeProject([makeProjectKit(1, kit as Kit)])

    const breakdown = getProjectKitBreakdown(project, 'achat')
    expect(breakdown).toHaveLength(0)
  })
})

describe('calculateEnvironmentalSavings', () => {
  it('returns all zeros when projectKits is undefined', () => {
    const project = { ...makeProject(), projectKits: undefined }
    const savings = calculateEnvironmentalSavings(project)
    expect(savings).toEqual({
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
    })
  })

  it('aggregates location impact with Math.abs', () => {
    const kitProduct = makeKitProduct(1, {
      rechauffementClimatiqueLocation: -10,
      epuisementRessourcesLocation: 20,
      acidificationLocation: -30,
      eutrophisationLocation: 40,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const savings = calculateEnvironmentalSavings(project)
    expect(savings.rechauffementClimatique).toBe(10) // abs(-10)
    expect(savings.epuisementRessources).toBe(20)
    expect(savings.acidification).toBe(30) // abs(-30)
    expect(savings.eutrophisation).toBe(40)
  })

  it('applies quantity cascade', () => {
    const kitProduct = makeKitProduct(3, {
      rechauffementClimatiqueLocation: 5,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(2, kit)]) // 3*2 = 6

    const savings = calculateEnvironmentalSavings(project)
    expect(savings.rechauffementClimatique).toBe(30) // 5 * 6
  })

  it('uses location mode only, not achat', () => {
    const kitProduct = makeKitProduct(1, {
      rechauffementClimatiqueAchat: 100, // should be ignored
      rechauffementClimatiqueLocation: 5,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const savings = calculateEnvironmentalSavings(project)
    expect(savings.rechauffementClimatique).toBe(5)
  })

  it('skips kits without kitProducts', () => {
    const kit = { ...makeKit([]), kitProducts: undefined }
    const project = makeProject([makeProjectKit(1, kit as Kit)])
    const savings = calculateEnvironmentalSavings(project)
    expect(savings).toEqual({
      rechauffementClimatique: 0,
      epuisementRessources: 0,
      acidification: 0,
      eutrophisation: 0,
    })
  })

  it('skips kitProducts without product data', () => {
    const kit = makeKit([makeOrphanKitProduct()])
    const project = makeProject([makeProjectKit(1, kit)])
    const savings = calculateEnvironmentalSavings(project)
    expect(savings.rechauffementClimatique).toBe(0)
  })
})

describe('calculateExtendedRentalCost', () => {
  it('returns 0 for zero or negative inputs', () => {
    expect(calculateExtendedRentalCost(0, 3)).toBe(0)
    expect(calculateExtendedRentalCost(10, 0)).toBe(0)
    expect(calculateExtendedRentalCost(-5, 3)).toBe(0)
    expect(calculateExtendedRentalCost(10, -1)).toBe(0)
  })

  it('calculates cost for 3 years or less (full rate)', () => {
    // 9.09 * 12 * 3 = 327.24
    expect(calculateExtendedRentalCost(9.09, 3)).toBe(327.24)
    // 9.09 * 12 * 1 = 109.08
    expect(calculateExtendedRentalCost(9.09, 1)).toBe(109.08)
  })

  it('calculates cost for 4 years (3yr full + 1yr at 20%)', () => {
    // Base 3yr: ceilPrice(9.09 * 12 * 3) = 327.24
    // Post-3yr monthly: ceilPrice(9.09 * 0.20) = ceilPrice(1.818) = 1.82
    // Post-3yr 1yr: ceilPrice(1.82 * 12 * 1) = ceilPrice(21.84) = 21.84
    // Total: ceilPrice(327.24 + 21.84) = 349.08
    const result = calculateExtendedRentalCost(9.09, 4)
    expect(result).toBeGreaterThan(327.24)
    expect(result).toBeLessThan(360)
  })

  it('calculates cost for 5 years (3yr full + 2yr at 20%)', () => {
    const result = calculateExtendedRentalCost(9.09, 5)
    const resultFor4 = calculateExtendedRentalCost(9.09, 4)
    expect(result).toBeGreaterThan(resultFor4)
  })
})

describe('calculateBreakEvenPoint', () => {
  it('returns null when all rental prices are 0', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 1000,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    expect(calculateBreakEvenPoint(project)).toBeNull()
  })

  it('returns null when purchase price is 0', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 0,
      prixVenteLocation1An: 100,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    expect(calculateBreakEvenPoint(project)).toBeNull()
  })

  it('returns null for project without kits', () => {
    const project = makeProject()
    expect(calculateBreakEvenPoint(project)).toBeNull()
  })

  it('returns structured BreakEvenResult with phase 3ans+ when purchase >> rental', () => {
    // Purchase = 8420.89, Location 3ans annual = 109.08 (9.09/month * 12)
    // We use prixVente as annual prices in the schema
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 8420.89,
      prixVenteLocation1An: 109.08,
      prixVenteLocation2Ans: 109.08,
      prixVenteLocation3Ans: 109.08,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const result = calculateBreakEvenPoint(project)
    expect(result).not.toBeNull()
    expect(result!.phase).toBe('3ans+')
    expect(result!.breakEvenYears).toBeGreaterThan(3)
    expect(result!.breakEvenMonths).toBe(result!.breakEvenYears * 12)
  })

  it('returns phase 0-1an when purchase < 1 year rental', () => {
    // Purchase = 50, Location 1an annual = 1200 -> monthly = 100
    // 50 - 100*12 = 50 - 1200 < 0 -> phase 0-1an
    // months = 50 / 100 = 0.5 months
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 50,
      prixVenteLocation1An: 1200,
      prixVenteLocation2Ans: 600,
      prixVenteLocation3Ans: 400,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const result = calculateBreakEvenPoint(project)
    expect(result).not.toBeNull()
    expect(result!.phase).toBe('0-1an')
    expect(result!.breakEvenMonths).toBeLessThan(12)
    expect(result!.breakEvenYears).toBeLessThan(1)
  })

  it('returns phase 1-2ans when break-even is between 1 and 2 years', () => {
    // Purchase = 1500
    // Location 1an annual = 1200 -> monthly = 100 -> 1500 - 1200 = 300 > 0
    // Location 2ans annual = 900 -> monthly = 75 -> 1500 - 75*12*2 = 1500 - 1800 = -300 < 0
    // months = 1500 / 75 = 20 months (between 12 and 24)
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 1500,
      prixVenteLocation1An: 1200,
      prixVenteLocation2Ans: 900,
      prixVenteLocation3Ans: 600,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const result = calculateBreakEvenPoint(project)
    expect(result).not.toBeNull()
    expect(result!.phase).toBe('1-2ans')
    expect(result!.breakEvenMonths).toBeGreaterThanOrEqual(12)
    expect(result!.breakEvenMonths).toBeLessThan(24)
  })

  it('returns phase 2-3ans when break-even is between 2 and 3 years', () => {
    // Purchase = 2000
    // Location 1an annual = 1200 -> monthly = 100 -> 2000 - 1200 = 800 > 0
    // Location 2ans annual = 900 -> monthly = 75 -> 2000 - 75*12*2 = 2000 - 1800 = 200 > 0
    // Location 3ans annual = 720 -> monthly = 60 -> 2000 - 60*12*3 = 2000 - 2160 = -160 < 0
    // Not reached by case 2.2.2 since remaining after 3yr < 0
    // months = 2000 / 60 = 33.33 (between 24 and 36)
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 2000,
      prixVenteLocation1An: 1200,
      prixVenteLocation2Ans: 900,
      prixVenteLocation3Ans: 720,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const result = calculateBreakEvenPoint(project)
    expect(result).not.toBeNull()
    expect(result!.phase).toBe('2-3ans')
    expect(result!.breakEvenMonths).toBeGreaterThanOrEqual(24)
    expect(result!.breakEvenMonths).toBeLessThan(36)
  })

  it('handles same price across all rental periods (fallback)', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 5000,
      prixVenteLocation1An: 120,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const result = calculateBreakEvenPoint(project)
    expect(result).not.toBeNull()
    // With same rate, 3yr total = 10*12*3 = 360, purchase 5000 - 360 > 0 -> phase 3ans+
    expect(result!.phase).toBe('3ans+')
    expect(result!.breakEvenYears).toBeGreaterThan(3)
  })
})
