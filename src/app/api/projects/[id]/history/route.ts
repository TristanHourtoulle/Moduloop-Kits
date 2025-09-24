import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getProjectHistory } from '@/lib/services/project-history';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: projectId } = await context.params;

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    // Check permissions - user owns project or is admin/dev
    const isOwner = project.createdById === session.user.id;
    const isAdminOrDev = session.user.role === 'ADMIN' || session.user.role === 'DEV';

    if (!isOwner && !isAdminOrDev) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Fetch project history
    const history = await getProjectHistory(projectId);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique du projet:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}