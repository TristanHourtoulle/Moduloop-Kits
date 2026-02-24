import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createKitAddedHistory, createKitQuantityUpdatedHistory } from '@/lib/services/project-history';
import { UserRole } from '@/lib/types/user';
import { isAdminOrDev } from '@/lib/utils/roles';

interface KitRequest {
  kitId: string;
  quantite: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { kits } = body;

    if (!kits || !Array.isArray(kits) || kits.length === 0) {
      return NextResponse.json(
        { error: 'Les kits sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        createdById: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Vérifier que tous les kits existent
    const kitIds = kits.map((k: KitRequest) => k.kitId);
    const existingKits = await prisma.kit.findMany({
      where: {
        id: { in: kitIds },
      },
    });

    if (existingKits.length !== kitIds.length) {
      return NextResponse.json(
        { error: "Certains kits n'existent pas" },
        { status: 400 }
      );
    }

    // Récupérer les kits existants du projet
    const existingProjectKits = await prisma.projectKit.findMany({
      where: {
        projectId,
      },
    });

    // Créer un map des kits existants pour un accès rapide
    const existingKitsMap = new Map();
    existingProjectKits.forEach((pk) => {
      existingKitsMap.set(pk.kitId, pk);
    });

    // Traiter chaque kit à ajouter
    const operations = [];
    const historyOperations = [];

    for (const kit of kits) {
      const existingKit = existingKitsMap.get(kit.kitId);
      const kitDetails = existingKits.find(k => k.id === kit.kitId);

      if (existingKit) {
        // Kit existe déjà : additionner les quantités
        const oldQuantity = existingKit.quantite;
        const newQuantity = existingKit.quantite + kit.quantite;
        
        operations.push(
          prisma.projectKit.update({
            where: { id: existingKit.id },
            data: { quantite: newQuantity },
          })
        );

        // Record quantity update history
        if (kitDetails) {
          historyOperations.push(
            createKitQuantityUpdatedHistory(
              session.user.id,
              projectId,
              kitDetails,
              oldQuantity,
              newQuantity
            )
          );
        }
      } else {
        // Nouveau kit : créer une nouvelle entrée
        operations.push(
          prisma.projectKit.create({
            data: {
              projectId,
              kitId: kit.kitId,
              quantite: kit.quantite,
            },
          })
        );

        // Record kit added history
        if (kitDetails) {
          historyOperations.push(
            createKitAddedHistory(
              session.user.id,
              projectId,
              kitDetails,
              kit.quantite
            )
          );
        }
      }
    }

    // Exécuter toutes les opérations
    const projectKits = await Promise.all(operations);

    // Record history (async, don't block response)
    Promise.all(historyOperations).catch(console.error);

    return NextResponse.json(projectKits, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout des kits au projet:", error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const role = (currentUser?.role as UserRole | undefined) ?? UserRole.USER;
    const isAdmin = isAdminOrDev(role);

    const project = await prisma.project.findFirst({
      where: isAdmin
        ? { id: projectId }
        : { id: projectId, createdById: session.user.id },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectKits = await prisma.projectKit.findMany({
      where: {
        projectId,
      },
      include: {
        kit: {
          include: {
            kitProducts: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(projectKits);
  } catch (error) {
    console.error('Erreur lors de la récupération des kits du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
