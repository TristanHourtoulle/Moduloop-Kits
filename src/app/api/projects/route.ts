import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getProjects, createProject, prisma } from '@/lib/db'
import { calculateProjectTotals } from '@/lib/services/project.service'
import { UserRole } from '@/lib/types/user'
import { createProjectCreatedHistory } from '@/lib/services/project-history'
import { requireAuth, handleApiError } from '@/lib/api/middleware'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const isAdmin =
      auth.user.role === UserRole.ADMIN || auth.user.role === UserRole.DEV

    // Récupérer le paramètre userId depuis l'URL
    const url = new URL(request.url)
    const requestedUserId = url.searchParams.get('userId')

    let targetUserId = auth.user.id // Par défaut, l'utilisateur connecté

    // Si un userId est demandé et que l'utilisateur est admin/dev
    if (requestedUserId && isAdmin) {
      // Vérifier que l'utilisateur cible existe
      const targetUser = await prisma.user.findUnique({
        where: { id: requestedUserId },
        select: { id: true, name: true, email: true },
      })

      if (targetUser) {
        targetUserId = requestedUserId
      }
    }

    const projects = await getProjects(targetUserId)

    // Calculer les totaux pour chaque projet
    const projectsWithTotals = projects.map((project) => {
      const totals = calculateProjectTotals(project)
      return {
        ...project,
        ...totals,
      }
    })

    return NextResponse.json(projectsWithTotals)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const body = await request.json()
    const { nom, description, status } = body

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du projet est requis' },
        { status: 400 },
      )
    }

    const project = await createProject({
      nom,
      description,
      status,
      userId: auth.user.id,
    })

    // Record project creation in history
    await createProjectCreatedHistory(auth.user.id, project)

    // Invalidate the projects page cache to show the new project
    revalidatePath('/projects')

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
