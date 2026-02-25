import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { UserRole } from '@/lib/types/user'
import { requireRole, handleApiError } from '@/lib/api/middleware'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, [UserRole.ADMIN, UserRole.DEV])
    if (auth.response) return auth.response

    // Récupérer tous les utilisateurs (version simplifiée)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    const usersWithDisplayNames = users.map((user) => ({
      id: user.id,
      name:
        user.name ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.email,
      email: user.email,
    }))

    return NextResponse.json(usersWithDisplayNames)
  } catch (error) {
    return handleApiError(error)
  }
}
