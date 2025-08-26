import { Suspense } from "react";
import { ProjectDetail } from "@/components/projects/project-detail";
import { ProjectDetailSkeleton } from "@/components/projects/project-detail-skeleton";
import { notFound } from "next/navigation";

interface ProjectPageProps {
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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Suspense fallback={<ProjectDetailSkeleton />}>
        <ProjectDetail project={project} />
      </Suspense>
    </div>
  );
}
