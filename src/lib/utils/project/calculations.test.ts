import { describe, it, expect } from 'vitest'
import type { Kit, KitProduct } from '@/lib/types/project'
import {
  makeKitProduct,
  makeKit,
  makeProjectKit,
  makeProject,
} from '../test-fixtures'

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

    const project = makeProject([
      makeProjectKit(1, kit1),
      makeProjectKit(1, kit2),
    ])

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

describe('calculateBreakEvenPoint', () => {
  it('returns null when rental price is 0', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 1000,
      // no location price = falls back to 0
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    expect(calculateBreakEvenPoint(project)).toBeNull()
  })

  it('calculates break-even as purchase / rental', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 1200,
      prixVenteLocation1An: 100,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const breakEven = calculateBreakEvenPoint(project)
    // 1200 / 100 = 12
    expect(breakEven).toBe(12)
  })

  it('returns fractional break-even values', () => {
    const kitProduct = makeKitProduct(1, {
      prixVenteAchat: 1000,
      prixVenteLocation1An: 300,
    })
    const kit = makeKit([kitProduct])
    const project = makeProject([makeProjectKit(1, kit)])

    const breakEven = calculateBreakEvenPoint(project)
    expect(breakEven).toBeCloseTo(3.333, 2)
  })

  it('returns null for project without kits', () => {
    const project = makeProject()
    // Both purchase and rental are 0, so rental = 0 -> null
    expect(calculateBreakEvenPoint(project)).toBeNull()
  })
})
