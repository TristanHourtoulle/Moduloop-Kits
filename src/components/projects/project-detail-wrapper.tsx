"use client";

import { ProjectDetail } from "@/components/projects/project-detail";
import type { Project } from "@/lib/types/project";

interface ProjectDetailWrapperProps {
  initialProject: Project;
}

export function ProjectDetailWrapper({ initialProject }: ProjectDetailWrapperProps) {
  return <ProjectDetail project={initialProject} />;
}
