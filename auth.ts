import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/auth.config';
import { loginSchema } from '@/lib/validations/auth';

/**
 * Credentials auth against AdminUser.
 *
 * Every failure path returns null and nothing else: the caller cannot tell an
 * unknown email from a wrong password, which is the point (BACKEND.md §6).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },

      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.adminUser.findUnique({ where: { email } });

        /*
         * Compare against a dummy hash when the account does not exist, so the
         * response takes the same time either way. Without it, a fast rejection
         * is a reliable signal that an email is not registered.
         */
        if (!user) {
          await bcrypt.compare(password, '$2a$12$0000000000000000000000000000000000000000000000000000');
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        await prisma.adminUser.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Never return the hash: this object becomes the JWT payload.
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
});
