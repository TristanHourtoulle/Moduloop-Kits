import { describe, it, expect } from 'vitest'
import { stripCostFieldsFromProduct, stripCostFieldsDeep } from './strip-cost-fields'

describe('stripCostFieldsFromProduct', () => {
  it('removes prixAchat* fields', () => {
    const product = {
      id: '1',
      nom: 'Product A',
      prixAchatAchat: 100,
      prixAchatLocation1An: 50,
      prixAchatLocation2Ans: 40,
      prixAchatLocation3Ans: 30,
    }

    const result = stripCostFieldsFromProduct(product)

    expect(result).toEqual({ id: '1', nom: 'Product A' })
    expect('prixAchatAchat' in result).toBe(false)
    expect('prixAchatLocation1An' in result).toBe(false)
  })

  it('removes prixUnitaire* fields', () => {
    const product = {
      id: '1',
      prixUnitaireAchat: 200,
      prixUnitaireLocation1An: 80,
      reference: 'REF-001',
    }

    const result = stripCostFieldsFromProduct(product)

    expect(result).toEqual({ id: '1', reference: 'REF-001' })
  })

  it('removes margeCoefficient* fields', () => {
    const product = {
      id: '1',
      margeCoefficientAchat: 1.5,
      margeCoefficientLocation: 1.3,
      nom: 'Product B',
    }

    const result = stripCostFieldsFromProduct(product)

    expect(result).toEqual({ id: '1', nom: 'Product B' })
  })

  it('preserves non-cost fields', () => {
    const product = {
      id: '1',
      nom: 'Product C',
      reference: 'REF-002',
      prixVenteAchat: 300,
      surface: 10,
    }

    const result = stripCostFieldsFromProduct(product)

    expect(result).toEqual({
      id: '1',
      nom: 'Product C',
      reference: 'REF-002',
      prixVenteAchat: 300,
      surface: 10,
    })
  })

  it('returns empty object for product with only cost fields', () => {
    const product = {
      prixAchatAchat: 100,
      prixUnitaireAchat: 200,
      margeCoefficientAchat: 1.5,
    }

    const result = stripCostFieldsFromProduct(product)

    expect(result).toEqual({})
  })

  it('does not mutate the original object', () => {
    const product = { id: '1', prixAchatAchat: 100 }
    const original = { ...product }

    stripCostFieldsFromProduct(product)

    expect(product).toEqual(original)
  })
})

describe('stripCostFieldsDeep', () => {
  it('returns null as-is', () => {
    expect(stripCostFieldsDeep(null)).toBeNull()
  })

  it('returns undefined as-is', () => {
    expect(stripCostFieldsDeep(undefined)).toBeUndefined()
  })

  it('returns primitives as-is', () => {
    expect(stripCostFieldsDeep('hello')).toBe('hello')
    expect(stripCostFieldsDeep(42)).toBe(42)
    expect(stripCostFieldsDeep(true)).toBe(true)
  })

  it('strips cost fields from a flat product object', () => {
    const product = {
      id: '1',
      nom: 'Product',
      prixAchatAchat: 100,
      prixUnitaireAchat: 200,
      margeCoefficientAchat: 1.5,
    }

    const result = stripCostFieldsDeep(product)

    expect(result).toEqual({ id: '1', nom: 'Product' })
  })

  it('strips cost fields from nested product key', () => {
    const kitProduct = {
      id: 'kp1',
      quantite: 2,
      product: {
        id: 'p1',
        nom: 'Product A',
        prixAchatAchat: 100,
        prixVenteAchat: 300,
      },
    }

    const result = stripCostFieldsDeep(kitProduct)

    expect(result.product).toEqual({
      id: 'p1',
      nom: 'Product A',
      prixVenteAchat: 300,
    })
    expect('prixAchatAchat' in (result.product as Record<string, unknown>)).toBe(false)
  })

  it('strips cost fields from kitProducts array', () => {
    const kit = {
      id: 'k1',
      nom: 'Kit A',
      kitProducts: [
        {
          id: 'kp1',
          product: {
            id: 'p1',
            prixAchatAchat: 100,
            prixVenteAchat: 300,
          },
        },
        {
          id: 'kp2',
          product: {
            id: 'p2',
            prixAchatAchat: 50,
            prixVenteAchat: 150,
          },
        },
      ],
    }

    const result = stripCostFieldsDeep(kit) as typeof kit

    expect(result.kitProducts[0]?.product).toEqual({ id: 'p1', prixVenteAchat: 300 })
    expect(result.kitProducts[1]?.product).toEqual({ id: 'p2', prixVenteAchat: 150 })
  })

  it('strips cost fields from projectKits -> kit -> kitProducts -> product', () => {
    const project = {
      id: 'proj1',
      nom: 'Project',
      projectKits: [
        {
          id: 'pk1',
          kit: {
            id: 'k1',
            kitProducts: [
              {
                id: 'kp1',
                product: {
                  id: 'p1',
                  nom: 'Product',
                  prixAchatAchat: 100,
                  prixUnitaireAchat: 200,
                  margeCoefficientAchat: 1.5,
                  prixVenteAchat: 300,
                },
              },
            ],
          },
        },
      ],
    }

    const result = stripCostFieldsDeep(project) as typeof project

    const product = result.projectKits[0]?.kit.kitProducts[0]?.product
    expect(product).toBeDefined()
    expect(product).toEqual({ id: 'p1', nom: 'Product', prixVenteAchat: 300 })
    expect('prixAchatAchat' in product!).toBe(false)
    expect('prixUnitaireAchat' in product!).toBe(false)
    expect('margeCoefficientAchat' in product!).toBe(false)
  })

  it('handles arrays at the top level', () => {
    const products = [
      { id: '1', prixAchatAchat: 100, nom: 'A' },
      { id: '2', prixAchatAchat: 200, nom: 'B' },
    ]

    const result = stripCostFieldsDeep(products)

    expect(result).toEqual([
      { id: '1', nom: 'A' },
      { id: '2', nom: 'B' },
    ])
  })

  it('handles empty arrays', () => {
    expect(stripCostFieldsDeep([])).toEqual([])
  })

  it('handles empty objects', () => {
    expect(stripCostFieldsDeep({})).toEqual({})
  })

  it('preserves non-cost nested objects', () => {
    const data = {
      id: '1',
      metadata: {
        createdAt: '2024-01-01',
        tags: ['a', 'b'],
      },
    }

    const result = stripCostFieldsDeep(data)

    expect(result).toEqual(data)
  })

  it('strips cost fields from unknown nested keys (fallback behavior)', () => {
    const data = {
      id: '1',
      someNewRelation: {
        id: 'r1',
        prixAchatAchat: 999,
        prixVenteAchat: 500,
        nom: 'Surprise product',
      },
    }

    const result = stripCostFieldsDeep(data) as typeof data

    expect(result.someNewRelation).toEqual({
      id: 'r1',
      prixVenteAchat: 500,
      nom: 'Surprise product',
    })
    expect('prixAchatAchat' in result.someNewRelation).toBe(false)
  })

  it('does not mutate the original data', () => {
    const product = {
      id: '1',
      prixAchatAchat: 100,
      nested: { product: { id: 'p1', prixAchatAchat: 50 } },
    }
    const original = JSON.parse(JSON.stringify(product))

    stripCostFieldsDeep(product)

    expect(product).toEqual(original)
  })
})
