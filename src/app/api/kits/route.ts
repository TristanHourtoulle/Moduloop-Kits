import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kitSchema } from "@/lib/schemas/kit";
import { UserRole } from "@/lib/types/user";
import { getKits, prisma } from "@/lib/db";
import { invalidateKits, CACHE_CONFIG } from "@/lib/cache";

interface UserWithRole {
  role?: UserRole;
}

// GET /api/kits - Liste des kits
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Extract query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const style = searchParams.get("style") || undefined;

    // Use cached function for better performance with optional filters
    const kits = await getKits({ search, style });

    // Configure cache headers for this response
    const response = NextResponse.json(kits);

    // On Vercel production, disable cache for list to ensure fresh data
    if (process.env.NODE_ENV === "production") {
      response.headers.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate, max-age=0",
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      console.log("[API] Serving kits list with no-cache headers for Vercel");
    } else {
      // In development, use normal cache headers
      response.headers.set(
        "Cache-Control",
        `public, s-maxage=${
          CACHE_CONFIG.KITS.revalidate
        }, stale-while-revalidate=${CACHE_CONFIG.KITS.revalidate * 5}`,
      );
    }

    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération des kits:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

// POST /api/kits - Créer un nouveau kit
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est DEV ou ADMIN
    const userRole = (session.user as UserWithRole)?.role || UserRole.USER;
    if (userRole !== UserRole.DEV && userRole !== UserRole.ADMIN) {
      return NextResponse.json(
        {
          error:
            "Accès refusé. Seuls les développeurs et administrateurs peuvent créer des kits.",
        },
        { status: 403 },
      );
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
        createdById: session.user.id,
        updatedById: session.user.id,
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
    console.error("Erreur lors de la création du kit:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
