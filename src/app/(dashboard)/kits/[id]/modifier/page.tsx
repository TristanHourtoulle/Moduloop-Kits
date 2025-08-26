import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { KitForm } from "@/components/kits/kit-form";
import { Package2, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";

interface EditKitPageProps {
  params: Promise<{ id: string }>;
}

async function getKit(id: string) {
  try {
    const kit = await prisma.kit.findUnique({
      where: { id },
      include: {
        kitProducts: {
          include: {
            product: {
              select: {
                id: true,
                nom: true,
                reference: true,
                prixVente1An: true,
                prixVente2Ans: true,
                prixVente3Ans: true,
                rechauffementClimatique: true,
                epuisementRessources: true,
                acidification: true,
                eutrophisation: true,
              },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return kit;
  } catch (error) {
    console.error("Erreur lors du chargement du kit:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: EditKitPageProps): Promise<Metadata> {
  const { id } = await params;
  const kit = await getKit(id);

  return {
    title: kit
      ? `Modifier ${kit.nom} - Moduloop Kits`
      : "Kit non trouvé - Moduloop Kits",
    description: kit
      ? `Modifier le kit ${kit.nom}`
      : "Le kit demandé n'a pas été trouvé",
  };
}

export default async function EditKitPage({ params }: EditKitPageProps) {
  const { id } = await params;
  const kit = await getKit(id);

  if (!kit) {
    notFound();
  }

  // Transformer les données pour le formulaire
  const initialData = {
    nom: kit.nom,
    style: kit.style,
    description: kit.description || undefined,
    products: kit.kitProducts.map(
      (kp: { product: { id: string }; quantite: number }) => ({
        productId: kp.product.id,
        quantite: kp.quantite,
      })
    ),
  };

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
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Modifiez les détails de votre kit et ses produits associés
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">
                Calculs automatiques mis à jour en temps réel
              </span>
            </div>
          </div>

          {/* Formulaire */}
          <KitForm initialData={initialData} kitId={id} />
        </div>
      </div>
    </RoleGuard>
  );
}
