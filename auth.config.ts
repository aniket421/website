import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe half of the Auth.js config.
 *
 * Middleware runs on the edge runtime, where Prisma and bcrypt cannot go, so
 * the config is split: this file holds everything middleware needs, and
 * auth.ts adds the credentials provider that touches the database.
 */
export const authConfig = {
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  session: {
    strategy: 'jwt',
    // BACKEND.md §6: eight-hour sessions.
    maxAge: 8 * 60 * 60,
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'STAFF';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? '');
        session.user.role = String(token.role ?? 'STAFF');
      }
      return session;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
