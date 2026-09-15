import { z } from 'zod';

/** Shared shapes for the catalogue: query params and admin write payloads. */

const APPLICATIONS = ['FLOOR', 'WALL', 'BOTH', 'OUTDOOR'] as const;

export const PRODUCT_PAGE_SIZE = 12;
export const PRODUCT_PAGE_SIZE_MAX = 48;

/** Query string for GET /api/products. Everything is optional. */
export const productQuerySchema = z.object({
  brand: z.string().trim().max(80).optional(),
  category: z.string().trim().max(80).optional(),
  application: z.enum(APPLICATIONS).optional(),
  finish: z.string().trim().max(60).optional(),
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PRODUCT_PAGE_SIZE_MAX).default(PRODUCT_PAGE_SIZE),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

const slug = z
  .string()
  .trim()
  .min(1, 'A slug is required.')
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.');

const displayOrder = z.coerce.number().int().min(0).max(9999).default(0);

export const brandSchema = z.object({
  name: z.string().trim().min(2, 'A brand needs a name.').max(80),
  slug,
  logoUrl: z.string().trim().url('That logo link is not a valid URL.').or(z.literal('')).default(''),
  description: z.string().trim().max(1000).default(''),
  websiteUrl: z.string().trim().url('That website link is not a valid URL.').or(z.literal('')).default(''),
  displayOrder,
  isActive: z.coerce.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'A category needs a name.').max(80),
  slug,
  description: z.string().trim().max(1000).default(''),
  imageUrl: z.string().trim().url('That image link is not a valid URL.').or(z.literal('')).default(''),
  displayOrder,
  isActive: z.coerce.boolean().default(true),
});

export const productImageSchema = z.object({
  url: z.string().trim().url('Each image needs a valid URL.'),
  altText: z.string().trim().max(200).default(''),
  displayOrder,
  isPrimary: z.coerce.boolean().default(false),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'A product needs a name.').max(140),
  slug,
  brandId: z.string().trim().min(1, 'Choose a brand.'),
  categoryId: z.string().trim().min(1, 'Choose a category.'),
  description: z.string().trim().max(3000).default(''),
  size: z.string().trim().max(60).default(''),
  finish: z.string().trim().max(60).default(''),
  application: z.enum(APPLICATIONS).default('BOTH'),
  isFeatured: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  displayOrder,
  images: z.array(productImageSchema).max(12, 'Twelve images is plenty for one product.').default([]),
});

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2, 'Who left this review?').max(80),
  city: z.string().trim().min(2, 'Which city are they in?').max(80),
  quote: z.string().trim().min(10, 'The quote looks too short.').max(1500),
  rating: z.coerce.number().int().min(1, 'Rating runs from 1 to 5.').max(5, 'Rating runs from 1 to 5.'),
  source: z.string().trim().max(60).default('Google Review'),
  isPublished: z.coerce.boolean().default(true),
  displayOrder,
});

export const faqSchema = z.object({
  question: z.string().trim().min(5, 'The question looks too short.').max(300),
  answer: z.string().trim().min(10, 'The answer looks too short.').max(3000),
  isPublished: z.coerce.boolean().default(true),
  displayOrder,
});

export const galleryImageSchema = z.object({
  url: z.string().trim().url('The image needs a valid URL.'),
  caption: z.string().trim().max(200).default(''),
  altText: z.string().trim().min(3, 'Describe the image for screen readers.').max(200),
  categoryId: z.string().trim().default(''),
  isPublished: z.coerce.boolean().default(true),
  displayOrder,
});

/** Reordering: a list of ids in their new order. */
export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Nothing to reorder.').max(500),
});

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
