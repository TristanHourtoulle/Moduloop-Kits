import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProjectEditWrapper } from "@/components/projects/project-edit-wrapper";
import { FolderOpen, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

// Disable all caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProjectData {
  nom: string;
  description?: string;
  kits: Array<{ kitId: string }>;
}

// Fetch project data directly from database
async function getProject(projectId: string, userId: string): Promise<any | null> {
  try {
    console.log("[EditProjectPage Server] Fetching project from DB:", projectId);

    const project = await getProjectById(projectId, userId);

    if (!project) {
      console.error("[EditProjectPage Server] Project not found:", projectId);
      return null;
    }

    console.log("[EditProjectPage Server] Project data fetched:", {
      projectId,
      nom: project.nom,
      kitsCount: project.projectKits?.length || 0,
    });

    return project;
  } catch (error) {
    console.error("[EditProjectPage Server] Error fetching project:", error);
    return null;
  }
}

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id: projectId } = await params;
  const { t: timestamp } = await searchParams;

  console.log("[EditProjectPage Server] Rendering page:", {
    projectId,
    timestamp,
    isProduction: process.env.NODE_ENV === "production",
  });

  // Get current user ID
  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  // Fetch project data server-side
  const projectData = await getProject(projectId, userId);

  if (!projectData) {
    notFound();
  }

  // Transform data for the form
  const transformedProject: ProjectData = {
    nom: projectData.nom,
    description: projectData.description || undefined,
    kits: projectData.projectKits?.map((pk: any) => ({ kitId: pk.kit.id })) || [],
  };

  // Generate a unique key based on project data + updatedAt timestamp
  // This forces remount when data changes
  const projectKey = `${projectId}-${projectData.updatedAt || Date.now()}`;

  return (
    <RoleGuard requiredRole={UserRole.USER}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 w-full">
        <div className="container mx-auto px-6">
          {/* Header moderne */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#30C1BD] to-[#30C1BD]/80 rounded-2xl mb-4">
              <FolderOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Modifier le projet
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">
                Gérez les kits de votre projet
              </span>
            </div>
          </div>

          {/* Client wrapper for form - key forces remount on data change */}
          <ProjectEditWrapper
            key={projectKey}
            projectId={projectId}
            initialProject={transformedProject}
            projectName={projectData.nom}
          />
        </div>
      </div>
    </RoleGuard>
  );
}