"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/projects/project-card";
import { FolderOpen } from "lucide-react";
import { type Project } from "@/lib/types/project";

interface ProjectsListWrapperProps {
  initialProjects: Project[];
}

function ProjectsListContent({ initialProjects }: ProjectsListWrapperProps) {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  // Update projects when initialProjects prop changes (server-side data refresh)
  useEffect(() => {
    console.log("[ProjectsListWrapper] Initial projects updated:", initialProjects.length);
    setProjects(initialProjects);
  }, [initialProjects]);

  // Detect when returning from edit page with updated param
  useEffect(() => {
    const updatedParam = searchParams.get("updated");
    if (updatedParam) {
      console.log("[ProjectsListWrapper] Detected update param, data already fresh from server");
      // Data is already fresh from server-side fetch, no need to refetch
    }
  }, [searchParams]);

  const handleDelete = useCallback(
    async (projectId: string) => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du projet");
        }

        // Remove project from local state without refetch
        const updatedProjects = projects.filter((p) => p.id !== projectId);
        setProjects(updatedProjects);
      } catch (err) {
        console.error("[ProjectsListWrapper] Error deleting project:", err);
      }
    },
    [projects],
  );

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-2xl flex items-center justify-center">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucun projet trouvé
        </h3>
        <p className="text-muted-foreground">
          Commencez par créer votre premier projet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

// Wrapper component with Suspense boundary
export function ProjectsListWrapper(props: ProjectsListWrapperProps) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loading skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[200px] bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    }>
      <ProjectsListContent {...props} />
    </Suspense>
  );
}