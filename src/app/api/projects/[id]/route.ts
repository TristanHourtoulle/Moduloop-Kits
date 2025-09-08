import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma, calculateProjectTotals } from '@/lib/db';
import { Project } from '@/lib/types/project';
import { UserRole } from '@/lib/types/user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer le rôle de l'utilisateur connecté
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.DEV;

    const { id } = await params;
    
    // Si l'utilisateur est admin/dev, il peut voir tous les projets
    // Sinon, il ne peut voir que ses propres projets
    const whereClause = isAdmin 
      ? { id }
      : { id, createdById: session.user.id };

    const project = await prisma.project.findFirst({
      where: whereClause,
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
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Calculer les totaux
    const totals = calculateProjectTotals(project as unknown as Project);

    return NextResponse.json({
      ...project,
      ...totals,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nom, description, status } = body;

    // Vérifier que le projet appartient à l'utilisateur
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        createdById: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Mettre à jour le projet
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        nom,
        description,
        status,
      },
      include: {
        projectKits: {
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
        },
      },
    });

    // Calculer les totaux
    const totals = calculateProjectTotals(updatedProject as unknown as Project);

    return NextResponse.json({
      ...updatedProject,
      ...totals,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nom, description, status } = body;

    const project = await prisma.project.update({
      where: {
        id,
        createdById: session.user.id,
      },
      data: {
        nom,
        description,
        status,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 500 });
    }

    const { id } = await params;
    await prisma.project.delete({
      where: {
        id,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
