import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const { kits } = body;

    if (!kits || !Array.isArray(kits) || kits.length === 0) {
      return NextResponse.json(
        { error: "Les kits sont requis" },
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
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
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

    // Supprimer les anciens kits du projet
    await prisma.projectKit.deleteMany({
      where: {
        projectId,
      },
    });

    // Ajouter les nouveaux kits
    const projectKits = await Promise.all(
      kits.map((kit: KitRequest) =>
        prisma.projectKit.create({
          data: {
            projectId,
            kitId: kit.kitId,
            quantite: kit.quantite,
          },
        })
      )
    );

    return NextResponse.json(projectKits, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout des kits au projet:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
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
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: projectId } = await params;

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
    console.error("Erreur lors de la récupération des kits du projet:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
