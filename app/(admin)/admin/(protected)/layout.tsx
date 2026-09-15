import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-session';
import { AdminNav } from '@/components/admin/AdminNav';

/**
 * Guard for every admin page except the login screen.
 *
 * Middleware already redirected unauthenticated requests. This runs the check
 * again server-side, because BACKEND.md §6 requires it and because middleware
 * is one config mistake away from not running at all.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AdminNav session={session} />
      <main className="min-w-0 flex-1 px-gutter py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
