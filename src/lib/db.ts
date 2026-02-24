import { PrismaClient } from '@prisma/client';
import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { type Kit, type Product, type Project, ProjectStatus } from './types/project';
import { getProductPricing, getProductEnvironmentalImpact } from './utils/product-helpers';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Product select object with all fields (legacy + mode-specific)
const productSelectFields = {
  id: true,
  nom: true,
  reference: true,
  surfaceM2: true,
  // Legacy pricing fields
  prixAchat1An: true,
  prixAchat2Ans: true,
  prixAchat3Ans: true,
  prixVente1An: true,
  prixVente2Ans: true,
  prixVente3Ans: true,
  // Mode-specific pricing fields
  prixAchatAchat1An: true,
  prixAchatAchat2Ans: true,
  prixAchatAchat3Ans: true,
  prixVenteAchat1An: true,
  prixVenteAchat2Ans: true,
  prixVenteAchat3Ans: true,
  prixAchatLocation1An: true,
  prixAchatLocation2Ans: true,
  prixAchatLocation3Ans: true,
  prixVenteLocation1An: true,
  prixVenteLocation2Ans: true,
  prixVenteLocation3Ans: true,
  // Legacy environmental fields
  rechauffementClimatique: true,
  epuisementRessources: true,
  acidification: true,
  eutrophisation: true,
  // Mode-specific environmental fields
  rechauffementClimatiqueAchat: true,
  epuisementRessourcesAchat: true,
  acidificationAchat: true,
  eutrophisationAchat: true,
  rechauffementClimatiqueLocation: true,
  epuisementRessourcesLocation: true,
  acidificationLocation: true,
  eutrophisationLocation: true,
} as const;

// Helper to transform Prisma data to match frontend types
const transformDates = (data: unknown): unknown => {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map((item) => transformDates(item));
  }

  if (typeof data === 'object') {
    const transformed: Record<string, unknown> = {};
    Object.keys(data as Record<string, unknown>).forEach((key) => {
      const value = (data as Record<string, unknown>)[key];
      if (value instanceof Date) {
        transformed[key] = value.toISOString();
      } else if (value === null && key === 'description') {
        // Convert null to undefined for description fields
        transformed[key] = undefined;
      } else if (typeof value === 'object' && value !== null) {
        transformed[key] = transformDates(value);
      } else {
        transformed[key] = value;
      }
    });
    return transformed;
  }

  return data;
};

// Data fetching functions - with noStore() to disable Next.js Data Cache
export const getKits = async (filters?: { search?: string; style?: string }) => {
  noStore(); // Disable Next.js Data Cache for fresh data

  // Build where clause dynamically based on filters
  const whereClause: {
    nom?: { contains: string; mode: 'insensitive' };
    style?: string;
  } = {};

  if (filters?.search) {
    whereClause.nom = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  if (filters?.style) {
    whereClause.style = filters.style;
  }

  const kits = await prisma.kit.findMany({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
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
            select: productSelectFields,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return transformDates(kits) as Kit[];
};

export const getKitById = async (id: string) => {
  noStore(); // Disable Next.js Data Cache for fresh data
  return await prisma.kit.findUnique({
    where: { id },
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
            select: productSelectFields,
          },
        },
      },
    },
  });
};

export const getProducts = async () => {
  noStore(); // Disable Next.js Data Cache for fresh data
  const products = await prisma.product.findMany({
    orderBy: {
      nom: 'asc',
    },
  });
  return transformDates(products) as Product[];
};

export const getProductById = async (id: string) => {
  noStore(); // Disable Next.js Data Cache for fresh data
  return await prisma.product.findUnique({
    where: { id },
  });
};

// Preload functions for eager loading
export const preloadKits = () => {
  void getKits();
};

export const preloadKit = (id: string) => {
  void getKitById(id);
};

export const preloadProducts = () => {
  void getProducts();
};

export const preloadProduct = (id: string) => {
  void getProductById(id);
};

// Project-related functions
export const getProjects = async (userId: string) => {
  noStore(); // Disable Next.js Data Cache for fresh data
  const projects = await prisma.project.findMany({
    where: {
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      projectKits: {
        include: {
          kit: {
            include: {
              kitProducts: {
                include: {
                  product: {
                    select: productSelectFields,
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return transformDates(projects) as Project[];
};

export const getProjectById = async (id: string, userId: string) => {
  noStore(); // Disable Next.js Data Cache for fresh data
  return await prisma.project.findFirst({
    where: {
      id,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      projectKits: {
        include: {
          kit: {
            include: {
              kitProducts: {
                include: {
                  product: {
                    select: productSelectFields,
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

export const createProject = async (data: {
  nom: string;
  description?: string;
  status?: string;
  userId: string;
}) => {
  return await prisma.project.create({
    data: {
      nom: data.nom,
      description: data.description,
      status: (data.status as ProjectStatus) || ProjectStatus.ACTIF,
      createdById: data.userId,
    },
    include: {
      projectKits: true,
    },
  });
};

export const updateProject = async (
  id: string,
  userId: string,
  data: {
    nom?: string;
    description?: string;
    status?: string;
  }
) => {
  return await prisma.project.updateMany({
    where: {
      id,
      createdById: userId,
    },
    data: {
      ...data,
      status: data.status ? (data.status as ProjectStatus) : undefined,
    },
  });
};

export const deleteProject = async (id: string, userId: string) => {
  return await prisma.project.deleteMany({
    where: {
      id,
      createdById: userId,
    },
  });
};

// Utility functions for calculations
export const calculateProjectTotals = (project: Project) => {
  let totalPrix = 0;
  const totalImpact = {
    rechauffementClimatique: 0,
    epuisementRessources: 0,
    acidification: 0,
    eutrophisation: 0,
  };
  let totalSurface = 0;

  // Calculate surface: use manual override if enabled, otherwise calculate from kits
  if (project.surfaceOverride && project.surfaceManual != null) {
    // Use manual override value
    totalSurface = project.surfaceManual;
  } else {
    // Calculate automatically from kits
    if (project.projectKits) {
      project.projectKits.forEach((projectKit) => {
        const kit = projectKit.kit;
        if (kit) {
          // Surface totale du kit (définie au niveau du kit, pas des produits)
          totalSurface += (kit.surfaceM2 || 0) * projectKit.quantite;
        }
      });
    }
  }

  // Calculate price and environmental impact for all kits (independent of surface mode)
  if (project.projectKits) {
    project.projectKits.forEach((projectKit) => {
      const kit = projectKit.kit;
      if (kit && kit.kitProducts) {
        kit.kitProducts.forEach((kitProduct) => {
          const product = kitProduct.product;
          if (product) {
            // Utiliser les helpers pour les champs mode-specific (mode achat par défaut)
            const pricing = getProductPricing(product, 'achat', '1an');
            const environmentalImpact = getProductEnvironmentalImpact(product, 'achat');

            // Prix total pour ce produit dans ce kit * quantité du kit dans le projet
            const prixProduit =
              (pricing.prixVente || 0) * kitProduct.quantite * projectKit.quantite;
            totalPrix += prixProduit;

            // Impact environnemental
            totalImpact.rechauffementClimatique +=
              (environmentalImpact.rechauffementClimatique || 0) *
              kitProduct.quantite *
              projectKit.quantite;
            totalImpact.epuisementRessources +=
              (environmentalImpact.epuisementRessources || 0) *
              kitProduct.quantite *
              projectKit.quantite;
            totalImpact.acidification +=
              (environmentalImpact.acidification || 0) * kitProduct.quantite * projectKit.quantite;
            totalImpact.eutrophisation +=
              (environmentalImpact.eutrophisation || 0) *
              kitProduct.quantite *
              projectKit.quantite;
          }
        });
      }
    });
  }

  return {
    totalPrix,
    totalImpact,
    totalSurface,
  };
};

// Preload functions for projects
export const preloadProjects = (userId: string) => {
  void getProjects(userId);
};

export const preloadProject = (id: string, userId: string) => {
  void getProjectById(id, userId);
};
