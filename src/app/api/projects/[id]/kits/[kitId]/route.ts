import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createKitQuantityUpdatedHistory, createKitRemovedHistory } from '@/lib/services/project-history';
import { requireAuth, handleApiError } from '@/lib/api/middleware';

// PATCH - Mettre à jour la quantité d'un kit dans un projet
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; kitId: string }> },
) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    const { id, kitId } = await params;
    const { quantite } = await request.json();

    if (!quantite || quantite < 1) {
      return NextResponse.json(
        { error: 'La quantité doit être supérieure à 0' },
        { status: 400 },
      );
    }

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: auth.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Récupérer l'état actuel pour l'historique
    const existingProjectKit = await prisma.projectKit.findFirst({
      where: {
        id: kitId,
        projectId: id,
      },
      include: {
        kit: true,
      },
    });

    if (!existingProjectKit) {
      return NextResponse.json({ error: 'Kit non trouvé dans le projet' }, { status: 404 });
    }

    const oldQuantity = existingProjectKit.quantite;

    // Mettre à jour la quantité du kit dans le projet
    const updatedProjectKit = await prisma.projectKit.update({
      where: {
        id: kitId,
        projectId: id,
      },
      data: {
        quantite: quantite,
      },
    });

    // Record history if quantity changed
    if (oldQuantity !== quantite) {
      createKitQuantityUpdatedHistory(
        auth.user.id,
        id,
        existingProjectKit.kit,
        oldQuantity,
        quantite,
      ).catch(console.error);
    }

    return NextResponse.json(updatedProjectKit);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer un kit d'un projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; kitId: string }> },
) {
  try {
    const auth = await requireAuth(request);
    if (auth.response) return auth.response;

    const { id, kitId } = await params;

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: auth.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Récupérer les détails du kit avant suppression pour l'historique
    const projectKitToDelete = await prisma.projectKit.findFirst({
      where: {
        id: kitId,
        projectId: id,
      },
      include: {
        kit: true,
      },
    });

    if (!projectKitToDelete) {
      return NextResponse.json({ error: 'Kit non trouvé dans le projet' }, { status: 404 });
    }

    // Supprimer le kit du projet
    await prisma.projectKit.delete({
      where: {
        id: kitId,
        projectId: id,
      },
    });

    // Record removal history
    createKitRemovedHistory(
      auth.user.id,
      id,
      projectKitToDelete.kit,
      projectKitToDelete.quantite,
    ).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
