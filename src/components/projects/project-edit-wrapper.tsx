"use client";

import { ProjectEditForm } from "@/components/projects/project-edit-form";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { generateProjectKey } from "@/lib/utils/project-key";
import type { ProjectStatus } from "@/lib/types/project";

interface ProjectData {
  nom: string;
  description?: string;
  status: string;
  kits: Array<{ kitId: string }>;
}

interface ProjectEditWrapperProps {
  projectId: string;
  initialProject: ProjectData;
}

export function ProjectEditWrapper({ projectId, initialProject }: ProjectEditWrapperProps) {
  const searchParams = useSearchParams();
  const timestamp = searchParams.get("t");

  // Generate a key that includes timestamp for forcing remount
  const projectKey = useMemo(() => {
    const dataKey = generateProjectKey(projectId, initialProject);
    return timestamp ? `${dataKey}-${timestamp}` : dataKey;
  }, [projectId, timestamp, initialProject]);

  return (
    <>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
        Modifiez les informations de{" "}
        <span className="font-semibold text-[#30C1BD]">
          &quot;{initialProject.nom}&quot;
        </span>
      </p>

      {/* Form with dynamic key for forcing remount on Vercel */}
      <ProjectEditForm
        key={projectKey}
        project={{ id: projectId, nom: initialProject.nom, description: initialProject.description, status: initialProject.status as ProjectStatus }}
      />
    </>
  );
}