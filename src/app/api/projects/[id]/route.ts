import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { calculateProjectTotals } from '@/lib/services/project.service'
import { type Project } from '@/lib/types/project'
import { verifyProjectAccess } from '@/lib/utils/project/access'
import {
  createProjectUpdatedHistory,
  createProjectDeletedHistory,
} from '@/lib/services/project-history'
import { requireAuth, handleApiError } from '@/lib/api/middleware'
import { updateProjectSchema, replaceProjectSchema } from '@/lib/schemas/project'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const access = await verifyProjectAccess(request, id)
    if (!access.ok) return access.response

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        projectKits: {
          include: {
            kit: {
              include: {
                kitProducts: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } },
        { status: 404 },
      )
    }

    // Calculer les totaux
    const totals = calculateProjectTotals(project as unknown as Project)

    return NextResponse.json({
      ...project,
      ...totals,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const { id } = await params
    const body = await request.json()
    const { nom, description, status, surfaceManual, surfaceOverride } =
      updateProjectSchema.parse(body)

    // Vérifier que le projet appartient à l'utilisateur
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        createdById: auth.user.id,
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } },
        { status: 404 },
      )
    }

    // Use transaction to update project and record history
    const result = await prisma.$transaction(async (tx) => {
      // Prepare update data
      const updateData: Prisma.ProjectUpdateInput = {}
      if (nom !== undefined) updateData.nom = nom
      if (description !== undefined) updateData.description = description
      if (status !== undefined) updateData.status = status
      if (surfaceManual !== undefined) updateData.surfaceManual = surfaceManual
      if (surfaceOverride !== undefined) updateData.surfaceOverride = surfaceOverride

      // Mettre à jour le projet
      const updatedProject = await tx.project.update({
        where: { id },
        data: updateData,
        include: {
          projectKits: {
            include: {
              kit: {
                include: {
                  kitProducts: {
                    include: {
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      // Record history (async, don't block transaction)
      createProjectUpdatedHistory(auth.user.id, id, existingProject, updatedProject).catch(
        (error) => {
          logger.warn('Failed to record project update history', { projectId: id, error })
        },
      )

      return updatedProject
    })

    // Revalidate the project detail page
    revalidatePath(`/projects/${id}`)

    // Calculer les totaux
    const totals = calculateProjectTotals(result as unknown as Project)

    return NextResponse.json({
      ...result,
      ...totals,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const { id } = await params
    const body = await request.json()
    const { nom, description, status } = replaceProjectSchema.parse(body)

    // Get existing project for history
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        createdById: auth.user.id,
      },
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } },
        { status: 404 },
      )
    }

    const project = await prisma.project.update({
      where: {
        id,
        createdById: auth.user.id,
      },
      data: {
        nom,
        description,
        status,
      },
    })

    // Record history (async)
    createProjectUpdatedHistory(auth.user.id, id, existingProject, project).catch((error) => {
      logger.warn('Failed to record project update history', { projectId: id, error })
    })

    return NextResponse.json(project)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const { id } = await params

    // Get project data before deletion for history
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: auth.user.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } },
        { status: 404 },
      )
    }

    // Record history before deletion
    await createProjectDeletedHistory(auth.user.id, project)

    await prisma.project.delete({
      where: {
        id,
        createdById: auth.user.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return handleApiError(error)
  }
}
