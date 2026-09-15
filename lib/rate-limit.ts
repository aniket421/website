import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env, isRedisConfigured } from '@/lib/env';

/**
 * Rate limiting. Upstash Redis in production; an in-memory fallback in
 * development so the app runs on a laptop without an Upstash account.
 *
 * The fallback is per-process and therefore useless across serverless
 * instances — which is exactly why lib/env.ts refuses to boot production
 * without the Redis credentials.
 */

export type LimitResult = {
  success: boolean;
  /** Seconds until the caller may retry. */
  retryAfter: number;
};

const redis = isRedisConfigured
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const build = (tokens: number, window: Parameters<typeof Ratelimit.slidingWindow>[1], prefix: string) =>
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tokens, window),
        analytics: false,
        prefix,
      })
    : null;

/** BACKEND.md §5: 3 enquiries per 10 minutes, 10 per day, by IP. */
const enquiryBurst = build(3, '10 m', 'rl:enquiry:burst');
const enquiryDaily = build(10, '1 d', 'rl:enquiry:daily');
/** §6: 5 login attempts per 15 minutes, by IP. */
const loginAttempts = build(5, '15 m', 'rl:login');
/** Signing an upload is cheap but not free. */
const uploadSigning = build(20, '10 m', 'rl:upload');

// ---------------------------------------------------------------------------
// In-memory fallback (development only)
// ---------------------------------------------------------------------------

type Bucket = { hits: number[]; };
const memory = new Map<string, Bucket>();

function memoryLimit(key: string, tokens: number, windowMs: number): LimitResult {
  const now = Date.now();
  const bucket = memory.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= tokens) {
    const oldest = bucket.hits[0] ?? now;
    memory.set(key, bucket);
    return { success: false, retryAfter: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }

  bucket.hits.push(now);
  memory.set(key, bucket);
  return { success: true, retryAfter: 0 };
}

async function check(
  limiter: Ratelimit | null,
  key: string,
  fallback: { tokens: number; windowMs: number; name: string },
): Promise<LimitResult> {
  if (!limiter) {
    return memoryLimit(`${fallback.name}:${key}`, fallback.tokens, fallback.windowMs);
  }

  try {
    const result = await limiter.limit(key);
    return {
      success: result.success,
      retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (error) {
    // Redis being unreachable must not take the enquiry form down with it.
    // Fail open, loudly: losing an enquiry is worse than allowing a duplicate.
    console.error('[rate-limit] limiter unavailable, failing open', error);
    return { success: true, retryAfter: 0 };
  }
}

/** Both enquiry windows must pass. Returns the first failure. */
export async function limitEnquiry(ip: string): Promise<LimitResult> {
  const burst = await check(enquiryBurst, ip, {
    tokens: 3,
    windowMs: 10 * 60 * 1000,
    name: 'enquiry:burst',
  });
  if (!burst.success) return burst;

  return check(enquiryDaily, ip, {
    tokens: 10,
    windowMs: 24 * 60 * 60 * 1000,
    name: 'enquiry:daily',
  });
}

export const limitLogin = (ip: string) =>
  check(loginAttempts, ip, { tokens: 5, windowMs: 15 * 60 * 1000, name: 'login' });

export const limitUploadSigning = (ip: string) =>
  check(uploadSigning, ip, { tokens: 20, windowMs: 10 * 60 * 1000, name: 'upload' });

/**
 * Client IP from the proxy chain. The leftmost x-forwarded-for entry is the
 * only one a client controls, but on Vercel the platform rewrites this header,
 * so it is trustworthy there. Falls back to a constant, which makes the limiter
 * global rather than absent.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
