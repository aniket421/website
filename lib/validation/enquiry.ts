import { z } from 'zod';
import { brandNames } from '@/lib/data/brands';
import { categoryNames } from '@/lib/data/categories';

/** Ten digits starting 6-9, with an optional +91 or 91 country prefix. */
const INDIAN_MOBILE = /^(?:\+?91)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/**
 * Shared by the form and the API route, so the browser and the server can
 * never disagree about what a valid enquiry looks like. Messages say what to
 * fix, in plain words.
 */
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
      (value) => INDIAN_MOBILE.test(value.replace(/[\s-]/g, '')),
      'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.',
    ),

  email: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || EMAIL.test(value),
      'This email address looks incomplete — check for a missing @ or domain.',
    ),

  city: z.string().trim().max(60, 'Please use a shorter city name.'),

  brand: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || brandNames.includes(value),
      'Please pick a brand from the list.',
    ),

  category: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || categoryNames.includes(value),
      'Please pick a category from the list.',
    ),

  message: z
    .string()
    .trim()
    .max(2000, 'Please keep your message under 2,000 characters.'),
});

export type EnquiryValues = z.infer<typeof enquirySchema>;

export const emptyEnquiry: EnquiryValues = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  brand: '',
  category: '',
  message: '',
};

/** Reference uploads: a photograph of the space, or a plan as a PDF. */
export const ACCEPTED_UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
] as const;

export const ACCEPTED_UPLOAD_EXTENSIONS = '.jpg,.jpeg,.png,.pdf';
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function validateUpload(file: File): string | null {
  if (!ACCEPTED_UPLOAD_TYPES.includes(file.type as (typeof ACCEPTED_UPLOAD_TYPES)[number])) {
    return 'Reference files need to be a JPG, PNG or PDF.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'That file is over 8MB — please attach a smaller version.';
  }
  return null;
}
