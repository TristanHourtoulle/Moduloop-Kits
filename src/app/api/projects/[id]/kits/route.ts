import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  createKitAddedHistory,
  createKitQuantityUpdatedHistory,
} from '@/lib/services/project-history'
import { verifyProjectAccess } from '@/lib/utils/project/access'
import { requireAuth, handleApiError } from '@/lib/api/middleware'
import { projectKitsSchema } from '@/lib/schemas/project'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const { id: projectId } = await params
    const body = await request.json()
    const { kits } = projectKitsSchema.parse(body)

    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        createdById: auth.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    // Vérifier que tous les kits existent
    const kitIds = kits.map((k) => k.kitId)
    const existingKits = await prisma.kit.findMany({
      where: {
        id: { in: kitIds },
      },
    })

    if (existingKits.length !== kitIds.length) {
      return NextResponse.json({ error: "Certains kits n'existent pas" }, { status: 400 })
    }

    // Récupérer les kits existants du projet
    const existingProjectKits = await prisma.projectKit.findMany({
      where: {
        projectId,
      },
    })

    // Créer un map des kits existants pour un accès rapide
    const existingKitsMap = new Map()
    existingProjectKits.forEach((pk) => {
      existingKitsMap.set(pk.kitId, pk)
    })

    // Traiter chaque kit à ajouter
    const operations = []
    const historyOperations = []

    for (const kit of kits) {
      const existingKit = existingKitsMap.get(kit.kitId)
      const kitDetails = existingKits.find((k) => k.id === kit.kitId)

      if (existingKit) {
        // Kit existe déjà : additionner les quantités
        const oldQuantity = existingKit.quantite
        const newQuantity = existingKit.quantite + kit.quantite

        operations.push(
          prisma.projectKit.update({
            where: { id: existingKit.id },
            data: { quantite: newQuantity },
          }),
        )

        // Record quantity update history
        if (kitDetails) {
          historyOperations.push(
            createKitQuantityUpdatedHistory(
              auth.user.id,
              projectId,
              kitDetails,
              oldQuantity,
              newQuantity,
            ),
          )
        }
      } else {
        // Nouveau kit : créer une nouvelle entrée
        operations.push(
          prisma.projectKit.create({
            data: {
              projectId,
              kitId: kit.kitId,
              quantite: kit.quantite,
            },
          }),
        )

        // Record kit added history
        if (kitDetails) {
          historyOperations.push(
            createKitAddedHistory(auth.user.id, projectId, kitDetails, kit.quantite),
          )
        }
      }
    }

    // Exécuter toutes les opérations
    const projectKits = await Promise.all(operations)

    // Record history (async, don't block response)
    Promise.all(historyOperations).catch(console.error)

    return NextResponse.json(projectKits, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params

    const access = await verifyProjectAccess(request, projectId)
    if (!access.ok) return access.response

    const projectKits = await prisma.projectKit.findMany({
      where: {
        projectId,
      },
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
    })

    return NextResponse.json(projectKits)
  } catch (error) {
    return handleApiError(error)
  }
}
