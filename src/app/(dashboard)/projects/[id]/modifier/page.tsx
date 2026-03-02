import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { ProjectEditWrapper } from '@/components/projects/project-edit-wrapper'
import { FolderOpen, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getProjectById } from '@/lib/db'
import { getCurrentUserId } from '@/lib/auth-helpers'

// Disable all caching for this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProjectData {
  nom: string
  description?: string
  status: string
  kits: Array<{ kitId: string }>
}

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { id: projectId } = await params
  // Await searchParams to opt into dynamic rendering (Next.js requirement)
  await searchParams

  const userId = await getCurrentUserId()
  if (!userId) {
    notFound()
  }

  const projectData = await getProjectById(projectId, userId)

  if (!projectData) {
    notFound()
  }

  const transformedProject: ProjectData = {
    nom: projectData.nom,
    description: projectData.description || undefined,
    status: projectData.status,
    kits: projectData.projectKits?.map((pk) => ({ kitId: pk.kit.id })) || [],
  }

  const projectKey = `${projectId}-${String(projectData.updatedAt ?? 'initial')}`

  return (
    <RoleGuard requiredRole={UserRole.USER}>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-6">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#30C1BD] to-[#30C1BD]/80">
              <FolderOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Modifier le projet</h1>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-[#30C1BD]" />
              <span className="text-sm text-gray-500">Gérez les kits de votre projet</span>
            </div>
          </div>

          <ProjectEditWrapper
            key={projectKey}
            projectId={projectId}
            initialProject={transformedProject}
          />
        </div>
      </div>
    </RoleGuard>
  )
}
