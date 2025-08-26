import { PrismaClient } from '@prisma/client';
import { cache } from 'react';
import 'server-only';
import { Project, ProjectStatus } from './types/project';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Cached data fetching functions
export const getKits = cache(async () => {
  return await prisma.kit.findMany({
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
    orderBy: {
      createdAt: 'desc',
    },
  });
});

export const getKitById = cache(async (id: string) => {
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

export const getProducts = cache(async () => {
  return await prisma.product.findMany({
    orderBy: {
      nom: 'asc',
    },
  });
});

export const getProductById = cache(async (id: string) => {
  return await prisma.product.findUnique({
    where: { id },
  });
});

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
export const getProjects = cache(async (userId: string) => {
  return await prisma.project.findMany({
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
                      surfaceM2: true,
                    },
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
});

export const getProjectById = cache(async (id: string, userId: string) => {
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
                      surfaceM2: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});

export const createProject = cache(
  async (data: {
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
  }
);

export const updateProject = cache(
  async (
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
  }
);

export const deleteProject = cache(async (id: string, userId: string) => {
  return await prisma.project.deleteMany({
    where: {
      id,
      createdById: userId,
    },
  });
});

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

  if (project.projectKits) {
    project.projectKits.forEach((projectKit) => {
      const kit = projectKit.kit;
      if (kit && kit.kitProducts) {
        kit.kitProducts.forEach((kitProduct) => {
          const product = kitProduct.product;
          if (product) {
            // Prix total pour ce produit dans ce kit * quantité du kit dans le projet
            const prixProduit =
              product.prixVente1An * kitProduct.quantite * projectKit.quantite;
            totalPrix += prixProduit;

            // Impact environnemental
            totalImpact.rechauffementClimatique +=
              product.rechauffementClimatique *
              kitProduct.quantite *
              projectKit.quantite;
            totalImpact.epuisementRessources +=
              product.epuisementRessources *
              kitProduct.quantite *
              projectKit.quantite;
            totalImpact.acidification +=
              product.acidification * kitProduct.quantite * projectKit.quantite;
            totalImpact.eutrophisation +=
              product.eutrophisation *
              kitProduct.quantite *
              projectKit.quantite;

            // Surface totale
            totalSurface +=
              product.surfaceM2 * kitProduct.quantite * projectKit.quantite;
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
