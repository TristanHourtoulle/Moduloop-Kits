import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { ProjectsListWrapper } from '@/components/projects/projects-list-wrapper'
import { CreateProjectButton } from '@/components/projects/create-project-button'
import { FolderOpen } from 'lucide-react'
import { getProjects } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Disable all caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProjectsPage() {
  // Get current user ID from session
  const userId = await getCurrentUserId()

  // Fetch projects directly from database using Prisma
  // If no userId, return empty array (user not authenticated)
  const projects = userId ? await getProjects(userId) : []

  return (
    <RoleGuard requiredRole={UserRole.USER}>
      <div className="bg-background min-h-screen w-full">
        <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 border-primary/20 flex h-12 w-12 items-center justify-center rounded-xl border">
                <FolderOpen className="text-primary h-6 w-6" />
              </div>
              <div>
                <h1 className="text-foreground text-3xl font-bold">Projets</h1>
                <p className="text-muted-foreground">Gérez vos projets de location</p>
              </div>
            </div>

            <CreateProjectButton />
          </div>

          {/* Client wrapper for projects list */}
          <ProjectsListWrapper initialProjects={projects} />
        </div>
      </div>
    </RoleGuard>
  )
}
