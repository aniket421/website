import crypto from 'node:crypto';
import { z } from 'zod';
import { env, isCloudinaryConfigured } from '@/lib/env';
import { clientIp, limitUploadSigning } from '@/lib/rate-limit';
import { getAdminSession } from '@/lib/admin-session';
import { badRequest, fail, ok, tooManyRequests, unauthorized } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

/**
 * Issues a short-lived signature so the browser can upload straight to
 * Cloudinary. File bytes never pass through this server (BACKEND.md §5): a
 * route handler proxying a 10MB PDF is a needless bottleneck and a needless
 * attack surface.
 *
 * The signature pins the folder and the allowed formats, so one issued for an
 * enquiry attachment cannot be replayed to write anywhere else.
 */

const PURPOSES = {
  /** The only public one — the enquiry form needs it before anyone signs in. */
  enquiry: { folder: 'elegance/enquiries', formats: 'jpg,jpeg,png,pdf', admin: false },
  product: { folder: 'elegance/products', formats: 'jpg,jpeg,png,webp', admin: true },
  gallery: { folder: 'elegance/gallery', formats: 'jpg,jpeg,png,webp', admin: true },
  brand: { folder: 'elegance/brands', formats: 'jpg,jpeg,png,webp,svg', admin: true },
  category: { folder: 'elegance/categories', formats: 'jpg,jpeg,png,webp', admin: true },
} as const;

const bodySchema = z.object({
  purpose: z.enum(['enquiry', 'product', 'gallery', 'brand', 'category']).default('enquiry'),
});

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isCloudinaryConfigured) {
    return fail(503, 'File uploads are not available right now. Please send the file by WhatsApp.');
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) return badRequest('That upload request could not be read.');

  const config = PURPOSES[parsed.data.purpose];

  // Everything but the enquiry attachment is staff-only.
  if (config.admin && !(await getAdminSession())) return unauthorized();

  const limit = await limitUploadSigning(clientIp(request));
  if (!limit.success) {
    return tooManyRequests('Too many upload attempts. Please wait a moment.', limit.retryAfter);
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signs the alphabetically sorted parameter string.
  const params: Record<string, string | number> = {
    allowed_formats: config.formats,
    folder: config.folder,
    timestamp,
  };

  const signature = crypto
    .createHash('sha1')
    .update(
      Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join('&') + env.CLOUDINARY_API_SECRET,
    )
    .digest('hex');

  return ok({
    signature,
    timestamp,
    folder: config.folder,
    allowedFormats: config.formats,
    maxBytes: MAX_BYTES,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
  });
}
