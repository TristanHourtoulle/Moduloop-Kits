import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProjectEditWrapper } from "@/components/projects/project-edit-wrapper";
import { FolderOpen, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";

// Force dynamic rendering since we use headers() for authentication
export const dynamic = 'force-dynamic';

interface ProjectData {
  nom: string;
  description?: string;
  kits: Array<{ kitId: string }>;
}

// Fetch project data server-side with aggressive no-cache for Vercel
async function getProject(projectId: string): Promise<any | null> {
  try {
    // Get the base URL from headers or environment
    const headersList = headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Get cookies for authentication
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    console.log("[EditProjectPage Server] Fetching project:", projectId);

    const response = await fetch(`${baseUrl}/api/projects/${projectId}`, {
      cache: "no-store", // Force fresh data on Vercel
      headers: {
        Cookie: cookieHeader, // Pass cookies for authentication
      },
    });

    if (!response.ok) {
      console.error(
        "[EditProjectPage Server] Failed to fetch project:",
        response.status,
      );
      return null;
    }

    const data = await response.json();

    console.log("[EditProjectPage Server] Project data fetched:", {
      projectId,
      nom: data.nom,
      kitsCount: data.kits?.length || 0,
    });

    return data;
  } catch (error) {
    console.error("[EditProjectPage Server] Error fetching project:", error);
    return null;
  }
}

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const projectId = params.id;
  const timestamp = searchParams.t;

  console.log("[EditProjectPage Server] Rendering page:", {
    projectId,
    timestamp,
    isProduction: process.env.NODE_ENV === "production",
  });

  // Fetch project data server-side
  const projectData = await getProject(projectId);

  if (!projectData) {
    notFound();
  }

  // Transform data for the form
  const transformedProject: ProjectData = {
    nom: projectData.nom,
    description: projectData.description || undefined,
    kits: projectData.kits?.map((kit: any) => ({ kitId: kit.id })) || [],
  };

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

          {/* Client wrapper for form */}
          <ProjectEditWrapper
            projectId={projectId}
            initialProject={transformedProject}
            projectName={projectData.nom}
          />
        </div>
      </div>
    </RoleGuard>
  );
}