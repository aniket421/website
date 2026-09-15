import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/auth.config';

/**
 * Gate for every /admin route and every /api/admin route.
 *
 * This is the first line, not the only one: BACKEND.md §6 requires each admin
 * handler to re-check the session server-side, because middleware can be
 * bypassed by misconfiguration and hiding UI is not protection.
 */
const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const signedIn = Boolean(request.auth?.user);

  const isLoginPage = pathname === '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin');

  // A signed-in user has no business on the login page.
  if (isLoginPage) {
    return signedIn
      ? NextResponse.redirect(new URL('/admin', request.nextUrl))
      : NextResponse.next();
  }

  if (signedIn) return NextResponse.next();

  // APIs get a JSON 401; a redirect to an HTML page would confuse a fetch().
  if (isAdminApi) {
    return NextResponse.json(
      { error: { message: 'Please sign in to continue.' } },
      { status: 401 },
    );
  }

  if (isAdminPage) {
    const login = new URL('/admin/login', request.nextUrl);
    // Come back to where they were headed once they are through.
    login.searchParams.set('from', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
