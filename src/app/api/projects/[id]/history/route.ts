import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getProjectHistory } from '@/lib/services/project-history'
import { requireAuth, handleApiError } from '@/lib/api/middleware'
import { UserRole } from '@/lib/types/user'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const { id: projectId } = await context.params

    // Check if project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        createdById: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Check permissions - user owns project or is admin/dev
    const isOwner = project.createdById === auth.user.id
    const isAdminOrDev =
      auth.user.role === UserRole.ADMIN || auth.user.role === UserRole.DEV

    if (!isOwner && !isAdminOrDev) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Fetch project history
    const history = await getProjectHistory(projectId)

    return NextResponse.json(history)
  } catch (error) {
    return handleApiError(error)
  }
}
