'use client'

import { ProductForm } from '@/components/products/product-form'
import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import { generateProductKey } from '@/lib/utils/product-key'

interface ProductData {
  nom: string
  reference: string
  description?: string
  quantite: number
  surfaceM2: number
  image?: string
  prixAchatAchat?: number
  prixUnitaireAchat?: number
  prixVenteAchat?: number
  margeCoefficientAchat?: number
  prixAchatLocation1An?: number
  prixUnitaireLocation1An?: number
  prixVenteLocation1An?: number
  prixAchatLocation2Ans?: number
  prixUnitaireLocation2Ans?: number
  prixVenteLocation2Ans?: number
  prixAchatLocation3Ans?: number
  prixUnitaireLocation3Ans?: number
  prixVenteLocation3Ans?: number
  margeCoefficientLocation?: number
  rechauffementClimatiqueAchat?: number
  epuisementRessourcesAchat?: number
  acidificationAchat?: number
  eutrophisationAchat?: number
  rechauffementClimatiqueLocation?: number
  epuisementRessourcesLocation?: number
  acidificationLocation?: number
  eutrophisationLocation?: number
}

interface ProductEditWrapperProps {
  productId: string
  initialProduct: ProductData
}

export function ProductEditWrapper({
  productId,
  initialProduct,
}: ProductEditWrapperProps) {
  const searchParams = useSearchParams()
  const timestamp = searchParams.get('t')

  // Generate a key that includes timestamp for forcing remount
  const productKey = useMemo(() => {
    const dataKey = generateProductKey(productId, initialProduct)
    return timestamp ? `${dataKey}-${timestamp}` : dataKey
  }, [productId, timestamp, initialProduct])

  // Map database fields to form fields
  // Database uses prixAchatAchat (without period) but form expects prixAchatAchat1An
  const mappedInitialData = {
    ...initialProduct,
    // Map achat fields from DB (no period) to form (with 1An)
    prixAchatAchat1An: initialProduct.prixAchatAchat,
    prixUnitaireAchat1An: initialProduct.prixUnitaireAchat,
    prixVenteAchat1An: initialProduct.prixVenteAchat,
  }

  return (
    <>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
        Modifiez les informations de{' '}
        <span className="font-semibold text-[#30C1BD]">
          &quot;{initialProduct.nom}&quot;
        </span>
      </p>

      {/* Form with dynamic key for forcing remount on Vercel */}
      <ProductForm
        key={productKey}
        initialData={mappedInitialData}
        productId={productId}
      />
    </>
  )
}
