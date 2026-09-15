import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Enter your email address.').max(160),
  password: z.string().min(1, 'Enter your password.').max(200),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Deliberately vague: never reveal whether an account exists. */
export const GENERIC_LOGIN_ERROR = 'Those details did not match an account.';
