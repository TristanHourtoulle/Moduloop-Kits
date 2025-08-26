import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

// PATCH - Mettre à jour la quantité d'un kit dans un projet
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; kitId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { quantite } = await request.json();

    if (!quantite || quantite < 1) {
      return NextResponse.json(
        { error: 'La quantité doit être supérieure à 0' },
        { status: 400 }
      );
    }

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        createdById: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Mettre à jour la quantité du kit dans le projet
    const updatedProjectKit = await prisma.projectKit.update({
      where: {
        id: params.kitId,
        projectId: params.id,
      },
      data: {
        quantite: quantite,
      },
    });

    return NextResponse.json(updatedProjectKit);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du kit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un kit d'un projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; kitId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que le projet appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        createdById: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 });
    }

    // Supprimer le kit du projet
    await prisma.projectKit.delete({
      where: {
        id: params.kitId,
        projectId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du kit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
