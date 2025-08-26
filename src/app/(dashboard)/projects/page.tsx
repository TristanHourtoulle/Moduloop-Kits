import { Suspense } from "react";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import { ProjectsHeader } from "@/components/projects/projects-header";
import { ProjectsGridSkeleton } from "@/components/projects/projects-grid-skeleton";

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <ProjectsHeader />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Mes Projets
        </h1>
        <CreateProjectButton />
      </div>

      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsGrid />
      </Suspense>
    </div>
  );
}
