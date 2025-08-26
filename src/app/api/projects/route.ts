import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjects, createProject, calculateProjectTotals } from "@/lib/db";
import { Project } from "@/lib/types/project";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const projects = await getProjects(session.user.id);

    // Calculer les totaux pour chaque projet
    const projectsWithTotals = projects.map((project) => {
      const totals = calculateProjectTotals(project as unknown as Project);
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

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
