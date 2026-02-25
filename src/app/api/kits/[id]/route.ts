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
import { groupDuplicateProducts } from "@/lib/utils/kit/group-products";
import { validateProductsExist, KIT_WITH_PRODUCTS_INCLUDE } from "@/lib/services/kit.service";

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

    const groupedProducts = groupDuplicateProducts(validatedData.products);

    const validation = await validateProductsExist(
      groupedProducts.map((p) => p.productId),
    );
    if (!validation.valid) {
      return NextResponse.json(
        { error: `Produits introuvables: ${validation.missingIds.join(", ")}` },
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
        include: KIT_WITH_PRODUCTS_INCLUDE,
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
