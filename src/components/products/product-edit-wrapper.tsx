"use client";

import { ProductForm } from "@/components/products/product-form";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProductData {
  nom: string;
  reference: string;
  description?: string;
  quantite: number;
  surfaceM2: number;
  prixAchatAchat?: number;
  prixUnitaireAchat?: number;
  prixVenteAchat?: number;
  margeCoefficientAchat?: number;
  prixAchatLocation1An?: number;
  prixUnitaireLocation1An?: number;
  prixVenteLocation1An?: number;
  prixAchatLocation2Ans?: number;
  prixUnitaireLocation2Ans?: number;
  prixVenteLocation2Ans?: number;
  prixAchatLocation3Ans?: number;
  prixUnitaireLocation3Ans?: number;
  prixVenteLocation3Ans?: number;
  margeCoefficientLocation?: number;
  rechauffementClimatiqueAchat?: number;
  epuisementRessourcesAchat?: number;
  acidificationAchat?: number;
  eutrophisationAchat?: number;
  rechauffementClimatiqueLocation?: number;
  epuisementRessourcesLocation?: number;
  acidificationLocation?: number;
  eutrophisationLocation?: number;
}

interface ProductEditWrapperProps {
  productId: string;
  initialProduct: ProductData;
  productName: string;
}

export function ProductEditWrapper({ productId, initialProduct, productName }: ProductEditWrapperProps) {
  const searchParams = useSearchParams();
  const timestamp = searchParams.get("t");

  // Generate a key that includes timestamp for forcing remount
  const [productKey, setProductKey] = useState("");

  useEffect(() => {
    // Generate key based on product data AND timestamp from URL
    const fullKey = timestamp ? `product-${productId}-${timestamp}` : `product-${productId}`;
    setProductKey(fullKey);

    console.log("[ProductEditWrapper] Component mounted with:", {
      productId,
      productName,
      timestamp,
      key: fullKey,
    });
  }, [productId, timestamp]);

  return (
    <>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
        Modifiez les informations de{" "}
        <span className="font-semibold text-[#30C1BD]">
          &quot;{productName}&quot;
        </span>
      </p>

      {/* Form with dynamic key for forcing remount on Vercel */}
      <ProductForm
        key={productKey}
        initialData={initialProduct}
        productId={productId}
      />
    </>
  );
}