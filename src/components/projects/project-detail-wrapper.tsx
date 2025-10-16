"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";

interface ProjectDetailWrapperProps {
  projectId: string;
  initialProject: any;
}

export function ProjectDetailWrapper({ projectId, initialProject }: ProjectDetailWrapperProps) {
  const searchParams = useSearchParams();
  const [project, setProject] = useState(initialProject);

  // Update project when initialProject prop changes (server-side data refresh)
  useEffect(() => {
    console.log("[ProjectDetailWrapper] Initial project updated:", {
      projectId,
      projectName: initialProject?.nom,
    });
    setProject(initialProject);
  }, [initialProject, projectId]);

  // Detect when returning from edit with updated param
  useEffect(() => {
    const updatedParam = searchParams.get("updated");
    if (updatedParam) {
      console.log("[ProjectDetailWrapper] Detected update param, data already fresh from server");
      // Data is already fresh from server-side fetch, no need to refetch
    }
  }, [searchParams]);

  return <ProjectDetail project={project} />;
}