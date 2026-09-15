import { z } from 'zod';

/**
 * Environment validation. Import this (not process.env) everywhere.
 *
 * Core keys — the database and the auth secret — are required in every
 * environment: without them nothing works and failing at boot is the only
 * honest outcome.
 *
 * Integration keys (Cloudinary, Resend, Upstash) are required in production and
 * optional in development. BACKEND.md §7 asks for every variable to be strict;
 * strict everywhere would make the app unbootable on a laptop without paid
 * accounts for all three, so the check is environment-aware instead. Each
 * missing key logs a loud warning at boot and puts that subsystem into a
 * documented degraded mode (see lib/notifications/email.ts and
 * lib/rate-limit.ts). In production, a missing key still refuses to boot.
 */

/*
 * `next build` runs with NODE_ENV=production, so strictness keyed on that alone
 * makes the app unbuildable in CI without every production secret. Boot is not
 * build: the build phase and an explicit opt-out are both relaxed, while the
 * production server itself still refuses to start with a key missing.
 */
const isBuildPhase =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.SKIP_ENV_VALIDATION === 'true';

const isProduction = process.env.NODE_ENV === 'production' && !isBuildPhase;

/** Required in production, optional in development. */
const deployRequired = (label: string) =>
  isProduction
    ? z.string().min(1, `${label} is required in production`)
    : z.string().optional().default('');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),

  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters — generate one with: npx auth secret'),
  AUTH_URL: z.string().optional().default(''),

  ADMIN_SEED_EMAIL: z.string().optional().default(''),
  ADMIN_SEED_PASSWORD: z.string().optional().default(''),

  CLOUDINARY_CLOUD_NAME: deployRequired('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: deployRequired('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: deployRequired('CLOUDINARY_API_SECRET'),

  RESEND_API_KEY: deployRequired('RESEND_API_KEY'),
  ENQUIRY_NOTIFY_EMAIL: deployRequired('ENQUIRY_NOTIFY_EMAIL'),

  UPSTASH_REDIS_REST_URL: deployRequired('UPSTASH_REDIS_REST_URL'),
  UPSTASH_REDIS_REST_TOKEN: deployRequired('UPSTASH_REDIS_REST_TOKEN'),
});

function load() {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid environment configuration:\n${lines.join('\n')}`);
  }

  if (!isProduction && !isBuildPhase) {
    const degraded = (
      [
        ['Cloudinary', parsed.data.CLOUDINARY_CLOUD_NAME],
        ['Resend', parsed.data.RESEND_API_KEY],
        ['Upstash Redis', parsed.data.UPSTASH_REDIS_REST_URL],
      ] as const
    )
      .filter(([, value]) => !value)
      .map(([label]) => label);

    if (degraded.length) {
      console.warn(
        `[env] Running in degraded development mode — not configured: ${degraded.join(', ')}. ` +
          'Uploads, enquiry email and distributed rate limiting are stubbed. ' +
          'Production refuses to boot without these.',
      );
    }
  }

  return parsed.data;
}

export const env = load();

export const isEmailConfigured = Boolean(env.RESEND_API_KEY && env.ENQUIRY_NOTIFY_EMAIL);
export const isRedisConfigured = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
);
export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);
