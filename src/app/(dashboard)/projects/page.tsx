import { RoleGuard } from "@/components/auth/role-guard";
import { UserRole } from "@/lib/types/user";
import { ProjectsListWrapper } from "@/components/projects/projects-list-wrapper";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import { FolderOpen } from "lucide-react";
import { getProjects } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-helpers";

// Force dynamic rendering since we use headers() for authentication
export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  // Get current user ID from session
  const userId = await getCurrentUserId();

  // Fetch projects directly from database using Prisma
  // If no userId, return empty array (user not authenticated)
  const projects = userId ? await getProjects(userId) : [];

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

            <CreateProjectButton />
          </div>

          {/* Client wrapper for projects list */}
          <ProjectsListWrapper initialProjects={projects} />
        </div>
      </div>
    </RoleGuard>
  );
}