import { z } from 'zod';

/**
 * The enquiry contract. Imported by the public form, the API route and the
 * admin screens, so the browser and the server can never disagree about what a
 * valid enquiry looks like. Messages say what to fix, in plain words.
 */

/** Ten digits starting 6-9, with an optional +91 or 91 country prefix. */
const INDIAN_MOBILE = /^(?:\+?91)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/** Strips spaces and dashes so "+91 98732 55836" and "9873255836" both pass. */
export const normalisePhone = (value: string) => value.replace(/[\s-]/g, '');

/**
 * Canonical storage form: +91 followed by the ten national digits.
 *
 * Without this, "+91 98732 55836" and "9873255836" are the same number stored
 * two different ways, and every tel: and wa.me link the admin builds has to
 * guess which. Store one shape, build links from it directly.
 */
export function toE164(value: string): string {
  const digits = normalisePhone(value).replace(/\D/g, '');
  const national = digits.length > 10 ? digits.slice(-10) : digits;
  return `+91${national}`;
}

const optionalId = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === '' || /^[a-z0-9]+$/i.test(v), 'Please pick an option from the list.');

export const enquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please tell us your name so we know who we are speaking to.')
    .max(80, 'That name is longer than we can store — please shorten it.'),

  phone: z
    .string()
    .trim()
    .min(1, 'We need a phone number to call you back on.')
    .refine(
      (value) => INDIAN_MOBILE.test(normalisePhone(value)),
      'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.',
    ),

  email: z
    .string()
    .trim()
    .max(160)
    .refine(
      (value) => value === '' || EMAIL.test(value),
      'This email address looks incomplete — check for a missing @ or domain.',
    ),

  city: z.string().trim().max(60, 'Please use a shorter city name.'),

  /** Cuids from the database, not names — see BACKEND.md §3. */
  brandId: optionalId,
  categoryId: optionalId,

  message: z.string().trim().max(2000, 'Please keep your message under 2,000 characters.'),

  attachmentUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => value === '' || /^https:\/\/res\.cloudinary\.com\//.test(value),
      'That attachment link is not one we issued.',
    ),

  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   * Named to look worth filling in.
   */
  companyWebsite: z.string().max(200).optional().default(''),
});

export type EnquiryValues = z.infer<typeof enquirySchema>;

export const emptyEnquiry: EnquiryValues = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  brandId: '',
  categoryId: '',
  message: '',
  attachmentUrl: '',
  companyWebsite: '',
};

/** Admin-side edits to an existing enquiry. */
export const enquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'SPAM']).optional(),
  internalNotes: z.string().trim().max(5000).optional(),
});

/** Reference uploads: a photograph of the space, or a plan as a PDF. */
export const ACCEPTED_UPLOAD_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;
export const ACCEPTED_UPLOAD_EXTENSIONS = '.jpg,.jpeg,.png,.pdf';
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function validateUpload(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_UPLOAD_TYPES.includes(file.type as (typeof ACCEPTED_UPLOAD_TYPES)[number])) {
    return 'Reference files need to be a JPG, PNG or PDF.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'That file is over 10MB — please attach a smaller version.';
  }
  return null;
}
