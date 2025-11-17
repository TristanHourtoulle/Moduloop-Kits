import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { KitEditWrapper } from "@/components/kits/kit-edit-wrapper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package2, Sparkles, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { getKitById } from "@/lib/db";

// Disable all caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface KitData {
  nom: string;
  style: string;
  description?: string;
  surfaceM2?: number;
  products: Array<{
    productId: string;
    quantite: number;
  }>;
}

// Fetch kit data directly from database
async function getKit(kitId: string): Promise<any | null> {
  try {
    console.log("[EditKitPage Server] Fetching kit from DB:", kitId);

    const kit = await getKitById(kitId);

    if (!kit) {
      console.error("[EditKitPage Server] Kit not found:", kitId);
      return null;
    }

    console.log("[EditKitPage Server] Kit data fetched:", {
      kitId,
      nom: kit.nom,
      productsCount: kit.kitProducts?.length || 0,
    });

    return kit;
  } catch (error) {
    console.error("[EditKitPage Server] Error fetching kit:", error);
    return null;
  }
}

export default async function EditKitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id: kitId } = await params;
  const { t: timestamp } = await searchParams;

  console.log("[EditKitPage Server] Rendering page:", {
    kitId,
    timestamp,
    isProduction: process.env.NODE_ENV === "production",
  });

  // Fetch kit data server-side
  const kitData = await getKit(kitId);

  if (!kitData) {
    notFound();
  }

  // Transform data for the form
  const transformedKit: KitData = {
    nom: kitData.nom,
    style: kitData.style,
    description: kitData.description || undefined,
    surfaceM2: kitData.surfaceM2 || undefined,
    products: kitData.kitProducts.map(
      (kp: { product: { id: string }; quantite: number }) => ({
        productId: kp.product.id,
        quantite: kp.quantite,
      }),
    ),
  };

  // Generate a unique key based on kit data + updatedAt timestamp
  // This forces remount when data changes
  const kitKey = `${kitId}-${kitData.updatedAt || Date.now()}`;

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 w-full">
        <div className="container mx-auto px-6">
          {/* Header moderne */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#30C1BD] to-[#30C1BD]/80 rounded-2xl mb-4">
              <Package2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Modifier le kit
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">
                Calculs automatiques mis à jour en temps réel
              </span>
            </div>
          </div>

          {/* Client wrapper for form - key forces remount on data change */}
          <KitEditWrapper
            key={kitKey}
            kitId={kitId}
            initialKit={transformedKit}
            kitName={kitData.nom}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
