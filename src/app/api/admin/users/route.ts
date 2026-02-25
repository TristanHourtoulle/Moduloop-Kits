import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UserRole } from '@/lib/types/user';
import { requireRole, handleApiError } from '@/lib/api/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireRole(request, [UserRole.ADMIN, UserRole.DEV]);
    if (auth.response) return auth.response;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        _count: {
          select: {
            projects: true,
            createdProducts: true,
            createdKits: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const usersWithStats = users.map(user => ({
      id: user.id,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      stats: {
        projectsCount: user._count.projects,
        productsCount: user._count.createdProducts,
        kitsCount: user._count.createdKits,
      },
    }));

    return NextResponse.json(usersWithStats);
  } catch (error) {
    return handleApiError(error);
  }
}
