'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { GENERIC_LOGIN_ERROR, loginSchema } from '@/lib/validations/auth';
import { limitLogin } from '@/lib/rate-limit';

export type LoginState = { error: string | null };

/**
 * Sign-in action.
 *
 * Every failure returns the same sentence. Distinguishing "no such account"
 * from "wrong password" hands an attacker a free account-enumeration oracle
 * (BACKEND.md §6).
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) return { error: GENERIC_LOGIN_ERROR };

  // Rate limit before touching bcrypt: hashing is deliberately slow, which
  // makes an unthrottled login endpoint a cheap way to burn our CPU.
  const forwarded = headers().get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || headers().get('x-real-ip') || 'unknown';

  const limit = await limitLogin(ip);
  if (!limit.success) {
    return {
      error: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.`,
    };
  }

  const requested = String(formData.get('from') || '/admin');
  // Only ever bounce back into the admin: an open redirect here would let a
  // crafted link send a freshly signed-in admin anywhere.
  const target = requested.startsWith('/admin') && !requested.startsWith('//')
    ? requested
    : '/admin';

  try {
    /*
     * redirect:false so a failure comes back as a value we can render. With
     * the default, next-auth redirects to the error page instead, which throws
     * NEXT_REDIRECT, discards the form state and leaves the user staring at a
     * login form with no explanation.
     */
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: GENERIC_LOGIN_ERROR };
    throw error;
  }

  // Outside the try: redirect() works by throwing, and catching our own
  // redirect would turn a successful sign-in into a generic failure.
  redirect(target);
}
