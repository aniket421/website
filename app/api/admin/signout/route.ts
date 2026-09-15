import { signOut } from '@/auth';

export const dynamic = 'force-dynamic';

/** POST only: a GET sign-out can be triggered by any image tag on any page. */
export async function POST() {
  await signOut({ redirectTo: '/admin/login' });
}
