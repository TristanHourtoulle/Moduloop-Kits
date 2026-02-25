import { NextRequest, NextResponse } from "next/server";
import { productUpdateSchema } from "@/lib/schemas/product";
import { UserRole } from "@/lib/types/user";
import { getProductById, prisma } from "@/lib/db";
import { invalidateProduct, invalidateProducts, CACHE_CONFIG } from "@/lib/cache";
import {
  requireAuth,
  requireRole,
  handleApiError,
  setResourceCacheHeaders,
} from "@/lib/api/middleware";

// GET /api/products/[id] - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    const { id } = await params;

    // Use cached function for better performance
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    }

    // Configure cache headers for this response
    const response = NextResponse.json(product);
    setResourceCacheHeaders(response, CACHE_CONFIG.PRODUCTS);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/products/[id] - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(request, [UserRole.DEV, UserRole.ADMIN]);
    if (auth.response) return auth.response;

    const { id } = await params;
    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validatedData = productUpdateSchema.parse({ ...body, id });

    // Retirer l'ID des données à mettre à jour
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = validatedData;

    // Vérifier que la référence n'existe pas déjà (si elle est modifiée)
    if (
      updateData.reference &&
      updateData.reference !== existingProduct.reference
    ) {
      const referenceExists = await prisma.product.findUnique({
        where: { reference: updateData.reference },
      });

      if (referenceExists) {
        return NextResponse.json(
          { error: "Cette référence existe déjà" },
          { status: 409 },
        );
      }
    }

    // Filtrer les valeurs undefined pour éviter les erreurs Prisma
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_key, value]) => {
        return value !== undefined;
      }),
    );

    // Traiter spécialement la description pour gérer les chaînes vides
    if ('description' in updateData) {
      filteredUpdateData.description = updateData.description || "";
    }

    // Map form fields to database fields for achat prices
    // Form uses prixAchatAchat1An but DB uses prixAchatAchat (no period)
    if ('prixAchatAchat1An' in filteredUpdateData) {
      filteredUpdateData.prixAchatAchat = filteredUpdateData.prixAchatAchat1An;
      delete filteredUpdateData.prixAchatAchat1An;
    }
    if ('prixUnitaireAchat1An' in filteredUpdateData) {
      filteredUpdateData.prixUnitaireAchat = filteredUpdateData.prixUnitaireAchat1An;
      delete filteredUpdateData.prixUnitaireAchat1An;
    }
    if ('prixVenteAchat1An' in filteredUpdateData) {
      filteredUpdateData.prixVenteAchat = filteredUpdateData.prixVenteAchat1An;
      delete filteredUpdateData.prixVenteAchat1An;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...filteredUpdateData,
        updatedById: auth.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Invalider le cache des produits après modification
    invalidateProduct(id);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/products/[id] - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(request, [UserRole.DEV, UserRole.ADMIN]);
    if (auth.response) return auth.response;

    const { id } = await params;
    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 },
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    // Invalider le cache des produits après suppression
    invalidateProducts();

    return NextResponse.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    return handleApiError(error);
  }
}
