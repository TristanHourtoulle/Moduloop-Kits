import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { UserRole } from '@/lib/types/user';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Seuls les admin/dev peuvent voir la liste des utilisateurs
    if (currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.DEV) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      );
    }

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
    });

    const usersWithDisplayNames = users.map(user => ({
      id: user.id,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
    }));

    return NextResponse.json(usersWithDisplayNames);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}