import crypto from 'node:crypto';
import { env, isCloudinaryConfigured } from '@/lib/env';
import { clientIp, limitUploadSigning } from '@/lib/rate-limit';
import { fail, ok, tooManyRequests } from '@/lib/api/responses';

/** Reads request headers and the database; never prerendered. */
export const dynamic = 'force-dynamic';

/**
 * Issues a short-lived signature so the browser can upload straight to
 * Cloudinary. File bytes never pass through this server (BACKEND.md §5) —
 * a route handler proxying a 10MB PDF is a needless bottleneck and a needless
 * attack surface.
 *
 * The signed parameters pin the folder and the allowed formats, so a signature
 * issued for an enquiry attachment cannot be replayed to upload anything else.
 */

const FOLDER = 'elegance/enquiries';
const ALLOWED_FORMATS = 'jpg,jpeg,png,pdf';
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isCloudinaryConfigured) {
    return fail(503, 'File uploads are not available right now. Please send the file by WhatsApp.');
  }

  const limit = await limitUploadSigning(clientIp(request));
  if (!limit.success) {
    return tooManyRequests('Too many upload attempts. Please wait a moment.', limit.retryAfter);
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Cloudinary signs the alphabetically sorted parameter string.
  const params: Record<string, string | number> = {
    allowed_formats: ALLOWED_FORMATS,
    folder: FOLDER,
    timestamp,
  };

  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(toSign + env.CLOUDINARY_API_SECRET)
    .digest('hex');

  return ok({
    signature,
    timestamp,
    folder: FOLDER,
    allowedFormats: ALLOWED_FORMATS,
    maxBytes: MAX_BYTES,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
  });
}
