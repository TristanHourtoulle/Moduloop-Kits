import { NextRequest, NextResponse } from "next/server";
import { kitSchema } from "@/lib/schemas/kit";
import { UserRole } from "@/lib/types/user";
import { getKitById, prisma } from "@/lib/db";
import { invalidateKit, invalidateKits, CACHE_CONFIG } from "@/lib/cache";
import {
  requireAuth,
  requireRole,
  handleApiError,
  setResourceCacheHeaders,
} from "@/lib/api/middleware";

// GET /api/kits/[id] - Récupérer un kit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    const { id } = await params;

    // Use cached function for better performance
    const kit = await getKitById(id);

    if (!kit) {
      return NextResponse.json({ error: "Kit non trouvé" }, { status: 404 });
    }

    // Configure cache headers for this response
    const response = NextResponse.json(kit);
    setResourceCacheHeaders(response, CACHE_CONFIG.KITS, 5);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/kits/[id] - Mettre à jour un kit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(request, [UserRole.DEV, UserRole.ADMIN]);
    if (auth.response) return auth.response;

    const { id } = await params;

    // Vérifier que le kit existe
    const existingKit = await prisma.kit.findUnique({
      where: { id },
      include: {
        kitProducts: true,
      },
    });

    if (!existingKit) {
      return NextResponse.json({ error: "Kit non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = kitSchema.parse(body);

    // Regrouper les produits identiques côté serveur aussi
    const groupedProducts = validatedData.products.reduce(
      (acc, product) => {
        const existingProduct = acc.find(
          (p) => p.productId === product.productId,
        );
        if (existingProduct) {
          existingProduct.quantite += product.quantite;
        } else {
          acc.push({ ...product });
        }
        return acc;
      },
      [] as typeof validatedData.products,
    );

    // Vérifier que tous les produits existent
    const productIds = groupedProducts.map((p) => p.productId);
    const existingProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });

    const existingProductIds = existingProducts.map(
      (p: { id: string }) => p.id,
    );
    const missingProducts = productIds.filter(
      (id) => !existingProductIds.includes(id),
    );

    if (missingProducts.length > 0) {
      return NextResponse.json(
        { error: `Produits introuvables: ${missingProducts.join(", ")}` },
        { status: 400 },
      );
    }

    // Mettre à jour le kit avec transaction
    const updatedKit = await prisma.$transaction(async (tx) => {
      // Supprimer les anciens produits du kit
      await tx.kitProduct.deleteMany({
        where: { kitId: id },
      });

      // Mettre à jour le kit et créer les nouveaux produits
      return await tx.kit.update({
        where: { id },
        data: {
          nom: validatedData.nom,
          style: validatedData.style,
          description: validatedData.description,
          surfaceM2: validatedData.surfaceM2,
          updatedById: auth.user.id,
          kitProducts: {
            create: groupedProducts.map((p) => ({
              productId: p.productId,
              quantite: p.quantite,
            })),
          },
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          updatedBy: {
            select: { id: true, name: true, email: true },
          },
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
        },
      });
    });

    // Invalider le cache des kits après modification
    invalidateKit(id);

    return NextResponse.json(updatedKit);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/kits/[id] - Supprimer un kit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(request, [UserRole.DEV, UserRole.ADMIN]);
    if (auth.response) return auth.response;

    const { id } = await params;
    // Vérifier que le kit existe
    const existingKit = await prisma.kit.findUnique({
      where: { id },
    });

    if (!existingKit) {
      return NextResponse.json({ error: "Kit non trouvé" }, { status: 404 });
    }

    // Supprimer le kit (les kitProducts seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.kit.delete({
      where: { id },
    });

    // Invalider le cache des kits après suppression
    invalidateKits();

    return NextResponse.json({ message: "Kit supprimé avec succès" });
  } catch (error) {
    return handleApiError(error);
  }
}
