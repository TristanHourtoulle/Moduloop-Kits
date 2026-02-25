import { View, Text, Image } from '@react-pdf/renderer'
import { tw, formatPricePdf } from '../tw-config'
import type { ProjectKit } from '@/lib/types/project'
import type { ProductPeriod } from '@/lib/schemas/product'
import { getProductPricing, annualToMonthly } from '@/lib/utils/product-helpers'
import { calculateKitPrice } from '@/lib/utils/kit/calculations'

interface PdfKitListSectionProps {
  projectKits: ProjectKit[]
}

const LOCATION_PERIODS: { key: ProductPeriod; label: string }[] = [
  { key: '1an', label: '1 an' },
  { key: '2ans', label: '2 ans' },
  { key: '3ans', label: '3 ans' },
]

function PdfKitCard({
  projectKit,
  index,
}: {
  projectKit: ProjectKit
  index: number
}) {
  const kit = projectKit.kit
  if (!kit) return null

  const kitProducts = kit.kitProducts ?? []

  return (
    <View
      style={{
        ...tw('mb-6'),
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
      }}
    >
      {/* Kit header — keep together with at least some content after it */}
      <View
        style={{
          ...tw('py-3 px-4'),
          backgroundColor: '#f3f4f6',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
        wrap={false}
        minPresenceAhead={80}
      >
        <View style={tw('flex-row items-center justify-between mb-1')}>
          <View style={tw('flex-row items-center')}>
            <Text style={tw('text-sm font-bold text-gray-800')}>
              {index + 1}. {kit.nom}
            </Text>
            {kit.style && (
              <View
                style={{
                  ...tw('ml-2 px-2 py-0.5'),
                  backgroundColor: '#30C1BD',
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{ fontSize: 8, color: '#ffffff', fontWeight: 'bold' }}
                >
                  {kit.style}
                </Text>
              </View>
            )}
          </View>
          <View
            style={{
              ...tw('px-3 py-1'),
              backgroundColor: '#374151',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 9, color: '#ffffff', fontWeight: 'bold' }}>
              Quantité : {projectKit.quantite}
            </Text>
          </View>
        </View>

        {kit.description && (
          <Text style={tw('text-xs text-gray-500 mt-1')}>
            {kit.description}
          </Text>
        )}

        {kit.surfaceM2 != null && kit.surfaceM2 > 0 && (
          <Text style={tw('text-xs text-gray-500 mt-1')}>
            Surface totale : {(kit.surfaceM2 * projectKit.quantite).toFixed(1)}{' '}
            m²
          </Text>
        )}
      </View>

      {/* Kit pricing summary (location) */}
      <View
        style={{
          ...tw('flex-row py-3 px-4'),
          backgroundColor: '#f9fafb',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}
        wrap={false}
      >
        {LOCATION_PERIODS.map((period) => {
          const kitTotal = calculateKitPrice(
            kitProducts,
            'location',
            period.key,
          )
          const totalForQuantity = kitTotal * projectKit.quantite
          const monthly = annualToMonthly(totalForQuantity)

          return (
            <View key={period.key} style={{ ...tw('items-center'), flex: 1 }}>
              <Text style={{ fontSize: 8, color: '#6b7280', marginBottom: 2 }}>
                {period.label}
              </Text>
              <Text style={tw('text-xs font-bold text-gray-800')}>
                {formatPricePdf(monthly)}/mois
              </Text>
              <Text style={{ fontSize: 8, color: '#9ca3af', marginTop: 3 }}>
                {formatPricePdf(totalForQuantity)}/an
              </Text>
            </View>
          )
        })}
      </View>

      {/* Products list */}
      {kitProducts.length > 0 && (
        <View style={tw('py-3 px-4')}>
          <Text
            style={{
              fontSize: 9,
              fontWeight: 'bold',
              color: '#374151',
              marginBottom: 8,
            }}
          >
            Produits ({kitProducts.length})
          </Text>

          {/* Products header */}
          <View
            style={{
              ...tw('flex-row py-2 px-2 mb-1'),
              backgroundColor: '#f9fafb',
              borderRadius: 4,
            }}
            wrap={false}
            minPresenceAhead={40}
          >
            <Text
              style={{
                fontSize: 8,
                fontWeight: 'bold',
                color: '#6b7280',
                width: '35%',
              }}
            >
              Produit
            </Text>
            <Text
              style={{
                fontSize: 8,
                fontWeight: 'bold',
                color: '#6b7280',
                width: '10%',
                textAlign: 'center',
              }}
            >
              Qté
            </Text>
            <Text
              style={{
                fontSize: 8,
                fontWeight: 'bold',
                color: '#6b7280',
                width: '18.33%',
                textAlign: 'right',
              }}
            >
              1 an
            </Text>
            <Text
              style={{
                fontSize: 8,
                fontWeight: 'bold',
                color: '#6b7280',
                width: '18.33%',
                textAlign: 'right',
              }}
            >
              2 ans
            </Text>
            <Text
              style={{
                fontSize: 8,
                fontWeight: 'bold',
                color: '#6b7280',
                width: '18.33%',
                textAlign: 'right',
              }}
            >
              3 ans
            </Text>
          </View>

          {/* Product rows */}
          {kitProducts.map((kitProduct, productIndex) => {
            const product = kitProduct.product
            if (!product) return null

            const pricing1an = getProductPricing(product, 'location', '1an')
            const pricing2ans = getProductPricing(product, 'location', '2ans')
            const pricing3ans = getProductPricing(product, 'location', '3ans')

            const price1an = (pricing1an.prixVente ?? 0) * kitProduct.quantite
            const price2ans = (pricing2ans.prixVente ?? 0) * kitProduct.quantite
            const price3ans = (pricing3ans.prixVente ?? 0) * kitProduct.quantite

            const isLast = productIndex === kitProducts.length - 1

            return (
              <View
                key={kitProduct.id}
                style={{
                  ...tw('flex-row items-center py-3 px-2'),
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: '#f3f4f6',
                }}
                wrap={false}
              >
                {/* Product name + image */}
                <View
                  style={{
                    width: '35%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  {product.image && (
                    <Image
                      src={product.image}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 4,
                        marginRight: 6,
                        objectFit: 'cover' as const,
                      }}
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={tw('text-xs text-gray-800')}>
                      {product.nom}
                    </Text>
                    {product.reference && (
                      <Text
                        style={{ fontSize: 7, color: '#9ca3af', marginTop: 3 }}
                      >
                        Réf: {product.reference}
                      </Text>
                    )}
                  </View>
                </View>

                <Text
                  style={{
                    fontSize: 9,
                    color: '#374151',
                    width: '10%',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {kitProduct.quantite}
                </Text>

                <Text
                  style={{
                    fontSize: 9,
                    color: '#374151',
                    width: '18.33%',
                    textAlign: 'right',
                  }}
                >
                  {formatPricePdf(price1an)}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: '#374151',
                    width: '18.33%',
                    textAlign: 'right',
                  }}
                >
                  {formatPricePdf(price2ans)}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: '#374151',
                    width: '18.33%',
                    textAlign: 'right',
                  }}
                >
                  {formatPricePdf(price3ans)}
                </Text>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

export function PdfKitListSection({ projectKits }: PdfKitListSectionProps) {
  if (!projectKits || projectKits.length === 0) {
    return (
      <View style={tw('mb-8')}>
        <Text style={tw('text-base font-bold text-gray-800 mb-4')}>
          Kits du projet
        </Text>
        <Text style={tw('text-sm text-gray-400')}>
          Aucun kit dans ce projet.
        </Text>
      </View>
    )
  }

  return (
    <View style={tw('mb-8')}>
      <Text style={tw('text-base font-bold text-gray-800 mb-4')}>
        Kits du projet ({projectKits.length})
      </Text>
      {projectKits.map((projectKit, index) => (
        <PdfKitCard key={projectKit.id} projectKit={projectKit} index={index} />
      ))}
    </View>
  )
}
