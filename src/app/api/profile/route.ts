import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, handleApiError } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const userId = auth.user.id

    // Get user details with account information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        accounts: {
          select: {
            providerId: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 },
      )
    }

    // Get statistics
    const [projectsCount, kitsCount, productsCount] = await Promise.all([
      prisma.project.count({
        where: { createdById: userId },
      }),
      prisma.kit.count({
        where: { createdById: userId },
      }),
      prisma.product.count({
        where: { createdById: userId },
      }),
    ])

    // Check if user has Google account
    const hasGoogleAccount = user.accounts.some(
      (account) => account.providerId === 'google',
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        hasGoogleAccount,
      },
      statistics: {
        projectsCount,
        kitsCount,
        productsCount,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const userId = auth.user.id
    const { name } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      user: updatedUser,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
