import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProductEditWrapper } from "@/components/products/product-edit-wrapper";
import { Package, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db";

// Disable all caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductData {
  nom: string;
  reference: string;
  description?: string;
  quantite: number;
  surfaceM2: number;
  image?: string;
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

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id: productId } = await params;
  // Await searchParams to opt into dynamic rendering (Next.js requirement)
  await searchParams;

  const productData = await getProductById(productId);

  if (!productData) {
    notFound();
  }

  const transformedProduct: ProductData = {
    nom: productData.nom,
    reference: productData.reference,
    description: productData.description || undefined,
    quantite: productData.quantite || 0,
    surfaceM2: productData.surfaceM2 || 0,
    image: productData.image || undefined,
    prixAchatAchat: productData.prixAchatAchat ?? undefined,
    prixUnitaireAchat: productData.prixUnitaireAchat ?? undefined,
    prixVenteAchat: productData.prixVenteAchat ?? undefined,
    margeCoefficientAchat: productData.margeCoefficientAchat ?? undefined,
    prixAchatLocation1An: productData.prixAchatLocation1An ?? undefined,
    prixUnitaireLocation1An: productData.prixUnitaireLocation1An ?? undefined,
    prixVenteLocation1An: productData.prixVenteLocation1An ?? undefined,
    prixAchatLocation2Ans: productData.prixAchatLocation2Ans ?? undefined,
    prixUnitaireLocation2Ans: productData.prixUnitaireLocation2Ans ?? undefined,
    prixVenteLocation2Ans: productData.prixVenteLocation2Ans ?? undefined,
    prixAchatLocation3Ans: productData.prixAchatLocation3Ans ?? undefined,
    prixUnitaireLocation3Ans: productData.prixUnitaireLocation3Ans ?? undefined,
    prixVenteLocation3Ans: productData.prixVenteLocation3Ans ?? undefined,
    margeCoefficientLocation: productData.margeCoefficientLocation ?? undefined,
    rechauffementClimatiqueAchat: productData.rechauffementClimatiqueAchat ?? undefined,
    epuisementRessourcesAchat: productData.epuisementRessourcesAchat ?? undefined,
    acidificationAchat: productData.acidificationAchat ?? undefined,
    eutrophisationAchat: productData.eutrophisationAchat ?? undefined,
    rechauffementClimatiqueLocation: productData.rechauffementClimatiqueLocation ?? undefined,
    epuisementRessourcesLocation: productData.epuisementRessourcesLocation ?? undefined,
    acidificationLocation: productData.acidificationLocation ?? undefined,
    eutrophisationLocation: productData.eutrophisationLocation ?? undefined,
  };

  const productKey = `${productId}-${String(productData.updatedAt ?? 'initial')}`;

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 w-full">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#30C1BD] to-[#30C1BD]/80 rounded-2xl mb-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Modifier le produit
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">
                Calculs automatiques mis à jour en temps réel
              </span>
            </div>
          </div>

          <ProductEditWrapper
            key={productKey}
            productId={productId}
            initialProduct={transformedProduct}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
