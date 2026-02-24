import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma, calculateProjectTotals } from '@/lib/db';
import { Project } from '@/lib/types/project';
import { UserRole } from '@/lib/types/user';
import { createProjectUpdatedHistory, createProjectDeletedHistory } from '@/lib/services/project-history';

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
    const { nom, description, status, surfaceManual, surfaceOverride } = body;

    // Validate surfaceManual if provided
    if (surfaceManual !== undefined && surfaceManual !== null && surfaceManual < 0) {
      return NextResponse.json(
        { error: 'La surface doit être un nombre positif' },
        { status: 400 }
      );
    }

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

    // Use transaction to update project and record history
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: Record<string, unknown> = {};
      if (nom !== undefined) updateData.nom = nom;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (surfaceManual !== undefined) updateData.surfaceManual = surfaceManual;
      if (surfaceOverride !== undefined) updateData.surfaceOverride = surfaceOverride;

      // Mettre à jour le projet
      const updatedProject = await tx.project.update({
        where: { id },
        data: updateData,
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

      // Record history (async, don't block transaction)
      createProjectUpdatedHistory(
        session.user.id,
        id,
        existingProject,
        updatedProject
      ).catch(console.error);

      return updatedProject;
    });

    // Revalidate the project detail page
    revalidatePath(`/projects/${id}`);

    // Calculer les totaux
    const totals = calculateProjectTotals(result as unknown as Project);

    return NextResponse.json({
      ...result,
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

    // Get existing project for history
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        createdById: session.user.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

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

    // Record history (async)
    createProjectUpdatedHistory(
      session.user.id,
      id,
      existingProject,
      project
    ).catch(console.error);

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
    
    // Get project data before deletion for history
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Record history before deletion
    await createProjectDeletedHistory(session.user.id, project);

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
