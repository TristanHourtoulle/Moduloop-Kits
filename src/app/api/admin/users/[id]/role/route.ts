import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UserRole } from '@/lib/types/user';
import { z } from 'zod';
import { requireRole, handleApiError } from '@/lib/api/middleware';

const updateRoleSchema = z.object({
  role: z.enum(['USER', 'DEV', 'ADMIN']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireRole(request, [UserRole.ADMIN, UserRole.DEV]);
    if (auth.response) return auth.response;

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateRoleSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 },
      );
    }

    if (id === auth.user.id && validatedData.role !== auth.user.role) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 403 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: validatedData.role as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
