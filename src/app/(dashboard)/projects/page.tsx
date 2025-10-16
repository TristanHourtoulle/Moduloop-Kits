import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProjectsListWrapper } from "@/components/projects/projects-list-wrapper";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus } from "lucide-react";
import Link from "next/link";
import { headers, cookies } from "next/headers";

// Force dynamic rendering since we use headers() for authentication
export const dynamic = 'force-dynamic';

// Fetch projects data server-side with no cache for fresh data
async function getProjectsData() {
  try {
    // Get the base URL from headers or environment
    const headersList = headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    // Get cookies for authentication
    const cookieStore = cookies();
    const cookieHeader = cookieStore.toString();

    console.log("[ProjectsPage Server] Fetching projects list");

    const response = await fetch(`${baseUrl}/api/projects`, {
      cache: "no-store", // Force fresh data
      headers: {
        Cookie: cookieHeader, // Pass cookies for authentication
      },
    });

    if (!response.ok) {
      console.error("[ProjectsPage Server] Failed to fetch projects:", response.status);
      return [];
    }

    const data = await response.json();

    console.log("[ProjectsPage Server] Projects fetched:", {
      count: data.length,
      isProduction: process.env.NODE_ENV === "production",
    });

    return data;
  } catch (error) {
    console.error("[ProjectsPage Server] Error fetching projects:", error);
    return [];
  }
}

export default async function ProjectsPage() {
  // Fetch projects data server-side
  const projects = await getProjectsData();

  console.log("[ProjectsPage Server] Rendering page with", projects.length, "projects");

  return (
    <RoleGuard requiredRole={UserRole.USER}>
      <div className="min-h-screen bg-background w-full">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Projets</h1>
                <p className="text-muted-foreground">
                  Gérez vos projets de location
                </p>
              </div>
            </div>

            <Button asChild>
              <Link href="/projects/nouveau">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau projet
              </Link>
            </Button>
          </div>

          {/* Client wrapper for projects list */}
          <ProjectsListWrapper initialProjects={projects} />
        </div>
      </div>
    </RoleGuard>
  );
}