"use client";

import { ProjectEditForm } from "@/components/projects/project-edit-form";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { generateProjectKey } from "@/lib/utils/project-key";

interface ProjectData {
  nom: string;
  description?: string;
  kits: Array<{ kitId: string }>;
}

interface ProjectEditWrapperProps {
  projectId: string;
  initialProject: ProjectData;
  projectName: string;
}

export function ProjectEditWrapper({ projectId, initialProject, projectName }: ProjectEditWrapperProps) {
  const searchParams = useSearchParams();
  const timestamp = searchParams.get("t");

  // Generate a key that includes timestamp for forcing remount
  const [projectKey, setProjectKey] = useState("");

  useEffect(() => {
    // Generate data-aware key based on project content (like kit implementation)
    const dataKey = generateProjectKey(projectId, initialProject);
    const fullKey = timestamp ? `${dataKey}-${timestamp}` : dataKey;
    setProjectKey(fullKey);

    console.log("[ProjectEditWrapper] Component mounted with:", {
      projectId,
      projectName,
      timestamp,
      dataKey,
      fullKey,
      kitsCount: initialProject.kits.length,
    });
  }, [projectId, timestamp, initialProject]);

  return (
    <>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center mb-8">
        Modifiez les informations de{" "}
        <span className="font-semibold text-[#30C1BD]">
          &quot;{projectName}&quot;
        </span>
      </p>

      {/* Form with dynamic key for forcing remount on Vercel */}
      <ProjectEditForm
        key={projectKey}
        project={{ ...initialProject, id: projectId } as any}
      />
    </>
  );
}