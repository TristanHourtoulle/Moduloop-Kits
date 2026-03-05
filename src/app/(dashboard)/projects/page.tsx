import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { ProjectsListWrapper } from '@/components/projects/projects-list-wrapper'
import { CreateProjectButton } from '@/components/projects/create-project-button'
import { FolderOpen } from 'lucide-react'
import { getProjects, prisma } from '@/lib/db'
import { getUserSession } from '@/lib/auth-helpers'
import { isAdminOrDev } from '@/lib/utils/roles'

// Disable all caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProjectsPageProps {
  searchParams: Promise<{ userId?: string }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await getUserSession()
  const currentUserId = session?.user?.id || null

  const params = await searchParams
  const requestedUserId = params.userId

  // Resolve role from DB (session may not include it server-side)
  let canViewOtherUsers = false
  if (currentUserId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true },
    })
    const role = (dbUser?.role as UserRole | undefined) ?? UserRole.USER
    canViewOtherUsers = isAdminOrDev(role)
  }

  const targetUserId = requestedUserId && canViewOtherUsers ? requestedUserId : currentUserId

  const projects = targetUserId ? await getProjects(targetUserId) : []

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
          <ProjectsListWrapper
            initialProjects={projects}
            selectedUserId={targetUserId || undefined}
          />
        </div>
      </div>
    </RoleGuard>
  )
}
