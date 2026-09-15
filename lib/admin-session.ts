import { auth } from '@/auth';

/**
 * Server-side session check for admin handlers and pages.
 *
 * Middleware already ran, and this runs again anyway: BACKEND.md §6 is explicit
 * that hiding UI is not protection and that handlers re-check for themselves.
 */
export type AdminSession = { id: string; email: string; name: string; role: string };

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? '',
    role: user.role ?? 'STAFF',
  };
}

/** Throws the 401 response for handlers that cannot continue without a user. */
export async function requireAdmin(): Promise<AdminSession | null> {
  return getAdminSession();
}
