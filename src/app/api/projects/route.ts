import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getProjects, createProject, prisma } from "@/lib/db";
import { calculateProjectTotals } from "@/lib/services/project.service";
import { UserRole } from "@/lib/types/user";
import { createProjectCreatedHistory } from '@/lib/services/project-history';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer le rôle de l'utilisateur connecté
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.DEV;

    // Récupérer le paramètre userId depuis l'URL
    const url = new URL(request.url);
    const requestedUserId = url.searchParams.get('userId');

    let targetUserId = session.user.id; // Par défaut, l'utilisateur connecté

    // Si un userId est demandé et que l'utilisateur est admin/dev
    if (requestedUserId && isAdmin) {
      // Vérifier que l'utilisateur cible existe
      const targetUser = await prisma.user.findUnique({
        where: { id: requestedUserId },
        select: { id: true, name: true, email: true },
      });

      if (targetUser) {
        targetUserId = requestedUserId;
      }
    }

    const projects = await getProjects(targetUserId);

    // Calculer les totaux pour chaque projet
    const projectsWithTotals = projects.map((project) => {
      const totals = calculateProjectTotals(project);
      return {
        ...project,
        ...totals,
      };
    });

    return NextResponse.json(projectsWithTotals);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { nom, description, status } = body;

    if (!nom) {
      return NextResponse.json(
        { error: "Le nom du projet est requis" },
        { status: 400 }
      );
    }

    const project = await createProject({
      nom,
      description,
      status,
      userId: session.user.id,
    });

    // Record project creation in history
    await createProjectCreatedHistory(session.user.id, project);

    // Invalidate the projects page cache to show the new project
    revalidatePath('/projects');

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
