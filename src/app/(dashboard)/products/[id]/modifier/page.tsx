import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProductEditWrapper } from "@/components/products/product-edit-wrapper";
import { Package, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";

// Force dynamic rendering since we use headers() for authentication
export const dynamic = 'force-dynamic';

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

// Fetch product data server-side with aggressive no-cache for Vercel
async function getProduct(productId: string): Promise<any | null> {
  try {
    // Get the base URL from headers or environment
    const headersList = headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Get cookies for authentication
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    console.log("[EditProductPage Server] Fetching product:", productId);

    const response = await fetch(`${baseUrl}/api/products/${productId}`, {
      cache: "no-store", // Force fresh data on Vercel
      headers: {
        Cookie: cookieHeader, // Pass cookies for authentication
      },
    });

    if (!response.ok) {
      console.error(
        "[EditProductPage Server] Failed to fetch product:",
        response.status,
      );
      return null;
    }

    const data = await response.json();

    console.log("[EditProductPage Server] Product data fetched:", {
      productId,
      nom: data.nom,
      reference: data.reference,
    });

    return data;
  } catch (error) {
    console.error("[EditProductPage Server] Error fetching product:", error);
    return null;
  }
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const productId = params.id;
  const timestamp = searchParams.t;

  console.log("[EditProductPage Server] Rendering page:", {
    productId,
    timestamp,
    isProduction: process.env.NODE_ENV === "production",
  });

  // Fetch product data server-side
  const productData = await getProduct(productId);

  if (!productData) {
    notFound();
  }

  // Transform data for the form
  const transformedProduct: ProductData = {
    nom: productData.nom,
    reference: productData.reference,
    description: productData.description || undefined,
    quantite: productData.quantite || 0,
    surfaceM2: productData.surfaceM2 || 0,
    image: productData.image || undefined,
    prixAchatAchat: productData.prixAchatAchat,
    prixUnitaireAchat: productData.prixUnitaireAchat,
    prixVenteAchat: productData.prixVenteAchat,
    margeCoefficientAchat: productData.margeCoefficientAchat,
    prixAchatLocation1An: productData.prixAchatLocation1An,
    prixUnitaireLocation1An: productData.prixUnitaireLocation1An,
    prixVenteLocation1An: productData.prixVenteLocation1An,
    prixAchatLocation2Ans: productData.prixAchatLocation2Ans,
    prixUnitaireLocation2Ans: productData.prixUnitaireLocation2Ans,
    prixVenteLocation2Ans: productData.prixVenteLocation2Ans,
    prixAchatLocation3Ans: productData.prixAchatLocation3Ans,
    prixUnitaireLocation3Ans: productData.prixUnitaireLocation3Ans,
    prixVenteLocation3Ans: productData.prixVenteLocation3Ans,
    margeCoefficientLocation: productData.margeCoefficientLocation,
    rechauffementClimatiqueAchat: productData.rechauffementClimatiqueAchat,
    epuisementRessourcesAchat: productData.epuisementRessourcesAchat,
    acidificationAchat: productData.acidificationAchat,
    eutrophisationAchat: productData.eutrophisationAchat,
    rechauffementClimatiqueLocation: productData.rechauffementClimatiqueLocation,
    epuisementRessourcesLocation: productData.epuisementRessourcesLocation,
    acidificationLocation: productData.acidificationLocation,
    eutrophisationLocation: productData.eutrophisationLocation,
  };

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 w-full">
        <div className="container mx-auto px-6">
          {/* Header moderne */}
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

          {/* Client wrapper for form */}
          <ProductEditWrapper
            productId={productId}
            initialProduct={transformedProduct}
            productName={productData.nom}
          />
        </div>
      </div>
    </RoleGuard>
  );
}