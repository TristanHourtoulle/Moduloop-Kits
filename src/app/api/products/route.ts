import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { productSchema, productFilterSchema } from "@/lib/schemas/product";
import { UserRole } from "@/lib/types/user";
import { prisma } from "@/lib/db";
import { invalidateProducts, CACHE_CONFIG } from "@/lib/cache";

interface UserWithRole {
  role?: UserRole;
}

// GET /api/products - Liste des produits avec filtres
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterParams = Object.fromEntries(searchParams);

    // Convertir les paramètres de requête en nombres si nécessaire
    const processedParams = {
      ...filterParams,
      minPrix: filterParams.minPrix ? Number(filterParams.minPrix) : undefined,
      maxPrix: filterParams.maxPrix ? Number(filterParams.maxPrix) : undefined,
      minQuantite: filterParams.minQuantite
        ? Number(filterParams.minQuantite)
        : undefined,
      maxQuantite: filterParams.maxQuantite
        ? Number(filterParams.maxQuantite)
        : undefined,
      page: filterParams.page ? Number(filterParams.page) : undefined,
      limit: filterParams.limit ? Number(filterParams.limit) : undefined,
    };

    const filters = productFilterSchema.parse(processedParams);

    // Construire les conditions de filtrage
    const where: Prisma.ProductWhereInput = {};

    if (filters.search) {
      where.OR = [
        { nom: { contains: filters.search, mode: "insensitive" } },
        { reference: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.reference) {
      where.reference = { contains: filters.reference, mode: "insensitive" };
    }

    if (filters.minPrix || filters.maxPrix) {
      where.prixVente1An = {};
      if (filters.minPrix) where.prixVente1An.gte = filters.minPrix;
      if (filters.maxPrix) where.prixVente1An.lte = filters.maxPrix;
    }

    if (filters.minQuantite || filters.maxQuantite) {
      where.quantite = {};
      if (filters.minQuantite) where.quantite.gte = filters.minQuantite;
      if (filters.maxQuantite) where.quantite.lte = filters.maxQuantite;
    }

    if (filters.createdBy) {
      where.createdById = filters.createdBy;
    }

    // Check if we need to return all products (for client-side filtering)
    const fetchAll = searchParams.get('all') === 'true';

    if (fetchAll) {
      // Return all products without pagination
      const products = await prisma.product.findMany({
        where: {}, // No filtering on server for client-side filtering
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          updatedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json({
        products,
        pagination: {
          page: 1,
          limit: products.length,
          total: products.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    // Calculer l'offset pour la pagination
    const offset = (filters.page - 1) * filters.limit;

    // Récupérer les produits avec pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          updatedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: {
          [filters.sortBy]: filters.sortOrder,
        },
        skip: offset,
        take: filters.limit,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / filters.limit);

    // Configure cache for this response
    const response = NextResponse.json({
      products,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
      },
    });

    // Longer cache for products (change less frequently)
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${
        CACHE_CONFIG.PRODUCTS.revalidate
      }, stale-while-revalidate=${CACHE_CONFIG.PRODUCTS.revalidate * 2}`
    );

    return response;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/products - Créer un nouveau produit
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
            "Accès refusé. Seuls les développeurs et administrateurs peuvent créer des produits.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Vérifier que la référence n'existe pas déjà
    const existingProduct = await prisma.product.findUnique({
      where: { reference: validatedData.reference },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Cette référence existe déjà" },
        { status: 409 }
      );
    }

    // Préparer les données en supprimant seulement les valeurs undefined non requises
    // et en fournissant des valeurs par défaut pour les champs legacy requis
    const createData: any = {
      // Champs de base (toujours présents depuis la validation)
      nom: validatedData.nom,
      reference: validatedData.reference,
      description: validatedData.description || "",
      
      // Valeurs par défaut pour les champs legacy requis par Prisma
      prixAchat1An: validatedData.prixAchat1An ?? 0,
      prixUnitaire1An: validatedData.prixUnitaire1An ?? 0,
      prixVente1An: validatedData.prixVente1An ?? 0,
      margeCoefficient: validatedData.margeCoefficient ?? 1,
      rechauffementClimatique: validatedData.rechauffementClimatique ?? 0,
      epuisementRessources: validatedData.epuisementRessources ?? 0,
      acidification: validatedData.acidification ?? 0,
      eutrophisation: validatedData.eutrophisation ?? 0,
      
      // Métadonnées
      createdById: session.user.id,
      updatedById: session.user.id,
    };

    // Ajouter tous les autres champs non-undefined du schema validé
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined && !createData.hasOwnProperty(key)) {
        createData[key] = value;
      }
    });

    const product = await prisma.product.create({
      data: createData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Invalider le cache des produits après création
    await invalidateProducts();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
