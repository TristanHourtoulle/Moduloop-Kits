import { Suspense } from "react";
import { ProjectEditForm } from "@/components/projects/project-edit-form";
import { ProjectEditSkeleton } from "@/components/projects/project-edit-skeleton";
import { notFound } from "next/navigation";

interface ProjectEditPageProps {
  params: Promise<{ id: string }>;
}

async function getProject(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Erreur lors du chargement du projet:", error);
    return null;
  }
}

export default async function ProjectEditPage({
  params,
}: ProjectEditPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Suspense fallback={<ProjectEditSkeleton />}>
        <ProjectEditForm project={project} />
      </Suspense>
    </div>
  );
}
