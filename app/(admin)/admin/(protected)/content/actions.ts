'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import type { ZodError, ZodType } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import {
  brandSchema,
  categorySchema,
  faqSchema,
  galleryImageSchema,
  slugify,
  testimonialSchema,
} from '@/lib/validations/catalogue';

export type ContentState = { error: string | null; fields: Record<string, string>; saved: boolean };

const okState: ContentState = { error: null, fields: {}, saved: true };

function fieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.map(String).join('.');
    if (path && !fields[path]) fields[path] = issue.message;
  }
  return fields;
}

function formToObject(formData: FormData, checkboxes: string[]): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key === 'id') continue;
    raw[key] = typeof value === 'string' ? value : '';
  }
  // An unchecked checkbox sends nothing at all, so absence means false.
  for (const name of checkboxes) raw[name] = formData.get(name) === 'on';
  return raw;
}

/** Shared write path for every simple content model. */
async function save<T>(
  model: 'brand' | 'category' | 'testimonial' | 'faq' | 'galleryImage',
  schema: ZodType<T>,
  checkboxes: string[],
  formData: FormData,
  transform?: (value: T) => Record<string, unknown>,
): Promise<ContentState> {
  if (!(await getAdminSession())) {
    return { error: 'Your session has expired. Please sign in again.', fields: {}, saved: false };
  }

  const id = String(formData.get('id') ?? '');
  const parsed = schema.safeParse(formToObject(formData, checkboxes));

  if (!parsed.success) {
    return { error: 'Some details need a second look.', fields: fieldErrors(parsed.error), saved: false };
  }

  const data = transform ? transform(parsed.data) : (parsed.data as Record<string, unknown>);

  try {
    // Delegates share this shape; the cast keeps one write path instead of five.
    const delegate = prisma[model] as unknown as {
      create: (args: { data: unknown }) => Promise<unknown>;
      update: (args: { where: { id: string }; data: unknown }) => Promise<unknown>;
    };

    if (id) await delegate.update({ where: { id }, data });
    else await delegate.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: null, fields: { slug: 'That slug is already taken.' }, saved: false };
    }
    console.error(`[${model}.save]`, { id, error });
    return { error: 'We could not save that. Please try again.', fields: {}, saved: false };
  }

  revalidatePath('/admin/content');
  revalidatePath('/');
  return okState;
}

const emptyToNull = (value: string) => (value === '' ? null : value);

export async function saveBrand(_prev: ContentState, formData: FormData) {
  return save('brand', brandSchema, ['isActive'], formData, (b) => ({
    name: b.name,
    slug: b.slug || slugify(b.name),
    logoUrl: emptyToNull(b.logoUrl),
    description: emptyToNull(b.description),
    websiteUrl: emptyToNull(b.websiteUrl),
    displayOrder: b.displayOrder,
    isActive: b.isActive,
  }));
}

export async function saveCategory(_prev: ContentState, formData: FormData) {
  return save('category', categorySchema, ['isActive'], formData, (c) => ({
    name: c.name,
    slug: c.slug || slugify(c.name),
    description: emptyToNull(c.description),
    imageUrl: emptyToNull(c.imageUrl),
    displayOrder: c.displayOrder,
    isActive: c.isActive,
  }));
}

export async function saveTestimonial(_prev: ContentState, formData: FormData) {
  return save('testimonial', testimonialSchema, ['isPublished'], formData);
}

export async function saveFaq(_prev: ContentState, formData: FormData) {
  return save('faq', faqSchema, ['isPublished'], formData);
}

export async function saveGalleryImage(_prev: ContentState, formData: FormData) {
  return save('galleryImage', galleryImageSchema, ['isPublished'], formData, (g) => ({
    url: g.url,
    caption: emptyToNull(g.caption),
    altText: g.altText,
    categoryId: emptyToNull(g.categoryId),
    displayOrder: g.displayOrder,
    isPublished: g.isPublished,
  }));
}

/**
 * Publish toggles stand in for delete on anything that may be referenced
 * (BACKEND.md §6). Only gallery images are ever truly removed.
 */
export async function togglePublished(
  model: 'brand' | 'category' | 'testimonial' | 'faq' | 'galleryImage',
  id: string,
  next: boolean,
): Promise<void> {
  if (!(await getAdminSession())) return;

  const field = model === 'brand' || model === 'category' ? 'isActive' : 'isPublished';
  const delegate = prisma[model] as unknown as {
    update: (args: { where: { id: string }; data: unknown }) => Promise<unknown>;
  };

  await delegate.update({ where: { id }, data: { [field]: next } });
  revalidatePath('/admin/content');
  revalidatePath('/');
}

/** Hard delete, allowed only for gallery images (BACKEND.md §6). */
export async function deleteGalleryImage(id: string): Promise<void> {
  if (!(await getAdminSession())) return;
  await prisma.galleryImage.delete({ where: { id } });
  revalidatePath('/admin/content');
  revalidatePath('/');
}

/** Persists a new display order as a single transaction. */
export async function reorder(
  model: 'brand' | 'category' | 'testimonial' | 'faq' | 'galleryImage',
  ids: string[],
): Promise<void> {
  if (!(await getAdminSession())) return;

  /*
   * Interactive transaction rather than an array: the generic delegate cast
   * erases Prisma's promise brand, and all-or-nothing matters more here than
   * the extra round trips. A half-applied reorder is a visibly broken list.
   */
  await prisma.$transaction(async (tx) => {
    const delegate = tx[model] as unknown as {
      update: (args: { where: { id: string }; data: unknown }) => Promise<unknown>;
    };
    for (const [index, id] of ids.entries()) {
      await delegate.update({ where: { id }, data: { displayOrder: index } });
    }
  });

  revalidatePath('/admin/content');
  revalidatePath('/');
}
