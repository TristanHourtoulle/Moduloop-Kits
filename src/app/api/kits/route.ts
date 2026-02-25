import { NextRequest, NextResponse } from "next/server";
import { kitSchema } from "@/lib/schemas/kit";
import { UserRole } from "@/lib/types/user";
import { getKits, prisma } from "@/lib/db";
import { invalidateKits, CACHE_CONFIG } from "@/lib/cache";
import {
  requireAuth,
  requireRole,
  handleApiError,
  setResourceCacheHeaders,
} from "@/lib/api/middleware";

// GET /api/kits - Liste des kits
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    // Extract query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const style = searchParams.get("style") || undefined;

    // Use cached function for better performance with optional filters
    const kits = await getKits({ search, style });

    // Configure cache headers for this response
    const response = NextResponse.json(kits);
    setResourceCacheHeaders(response, CACHE_CONFIG.KITS, 5);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/kits - Créer un nouveau kit
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, [UserRole.DEV, UserRole.ADMIN]);
    if (auth.response) return auth.response;

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

    const existingProductIds = existingProducts.map((p) => p.id);
    const missingProducts = productIds.filter(
      (id) => !existingProductIds.includes(id),
    );

    if (missingProducts.length > 0) {
      return NextResponse.json(
        { error: `Produits introuvables: ${missingProducts.join(", ")}` },
        { status: 400 },
      );
    }

    // Créer le kit avec ses produits
    const kit = await prisma.kit.create({
      data: {
        nom: validatedData.nom,
        style: validatedData.style,
        description: validatedData.description,
        surfaceM2: validatedData.surfaceM2,
        createdById: auth.user.id,
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

    // Invalider le cache des kits après création
    invalidateKits();

    return NextResponse.json(kit, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
