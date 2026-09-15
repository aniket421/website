import { validateUpload } from '@/lib/validations/enquiry';

/**
 * Uploads a reference file straight from the browser to Cloudinary using a
 * signature from /api/upload/sign. Bytes never touch our server.
 */
export type UploadPurpose = 'enquiry' | 'product' | 'gallery' | 'brand' | 'category';

export async function uploadToCloudinary(
  file: File,
  purpose: UploadPurpose = 'enquiry',
): Promise<{ url: string } | { error: string }> {
  // Enquiry attachments have a documented allow-list; admin images are checked
  // by Cloudinary against the formats baked into the signature.
  if (purpose === 'enquiry') {
    const localError = validateUpload(file);
    if (localError) return { error: localError };
  }

  let signature: {
    signature: string;
    timestamp: number;
    folder: string;
    apiKey: string;
    uploadUrl: string;
  };

  try {
    const response = await fetch('/api/upload/sign', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ purpose }),
    });
    const body = await response.json();
    if (!response.ok) {
      return { error: body?.error?.message ?? 'We could not prepare the upload.' };
    }
    signature = body.data;
  } catch {
    return { error: 'We could not reach the upload service. Try again, or send it by WhatsApp.' };
  }

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', signature.apiKey);
  form.append('timestamp', String(signature.timestamp));
  form.append('signature', signature.signature);
  form.append('folder', signature.folder);

  try {
    const response = await fetch(signature.uploadUrl, { method: 'POST', body: form });
    if (!response.ok) return { error: 'The file could not be uploaded. Please try a smaller one.' };
    const body = await response.json();
    if (typeof body?.secure_url !== 'string') {
      return { error: 'The upload did not complete. Please try again.' };
    }
    return { url: body.secure_url };
  } catch {
    return { error: 'The upload was interrupted. Please try again.' };
  }
}

/** Backwards-compatible alias for the public enquiry form. */
export const uploadReference = (file: File) => uploadToCloudinary(file, 'enquiry');
