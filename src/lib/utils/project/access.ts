import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@/lib/types/user';
import { isAdminOrDev } from '@/lib/utils/roles';

interface ProjectAccessSuccess {
  userId: string;
  isAdmin: boolean;
}

type ProjectAccessResult =
  | { ok: true; data: ProjectAccessSuccess }
  | { ok: false; response: NextResponse };

/**
 * Authenticates the user, resolves their role, and verifies they can access
 * the given project (owner or admin/dev). Returns early with an HTTP response
 * on failure so callers can simply forward it.
 *
 * @param request - The incoming request (used for session retrieval).
 * @param projectId - The project to verify access for.
 * @returns Either `{ ok: true, data }` with userId and admin flag, or `{ ok: false, response }`.
 */
export async function verifyProjectAccess(
  request: Request,
  projectId: string,
): Promise<ProjectAccessResult> {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: 'AUTH_UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 },
      ),
    };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const role = (currentUser?.role as UserRole | undefined) ?? UserRole.USER;
  const isAdmin = isAdminOrDev(role);

  const project = await prisma.project.findFirst({
    where: isAdmin
      ? { id: projectId }
      : { id: projectId, createdById: session.user.id },
    select: { id: true },
  });

  if (!project) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' } },
        { status: 404 },
      ),
    };
  }

  return {
    ok: true,
    data: { userId: session.user.id, isAdmin },
  };
}
