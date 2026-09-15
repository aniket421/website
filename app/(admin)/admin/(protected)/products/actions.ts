'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';
import type { ZodError } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { productSchema, slugify } from '@/lib/validations/catalogue';

export type ProductState = { error: string | null; fields: Record<string, string> };

/** Parses the form, including the JSON-encoded image list from the uploader. */
function readForm(formData: FormData) {
  const name = String(formData.get('name') ?? '');
  const rawImages = String(formData.get('images') ?? '[]');

  let images: unknown = [];
  try {
    images = JSON.parse(rawImages);
  } catch {
    images = [];
  }

  return {
    name,
    // An empty slug field means "derive it from the name".
    slug: String(formData.get('slug') || '') || slugify(name),
    brandId: String(formData.get('brandId') ?? ''),
    categoryId: String(formData.get('categoryId') ?? ''),
    description: String(formData.get('description') ?? ''),
    size: String(formData.get('size') ?? ''),
    finish: String(formData.get('finish') ?? ''),
    application: String(formData.get('application') || 'BOTH'),
    isFeatured: formData.get('isFeatured') === 'on',
    isActive: formData.get('isActive') === 'on',
    displayOrder: String(formData.get('displayOrder') || '0'),
    images,
  };
}

/** Maps zod issues onto field names the form can render inline. */
function fieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.map(String).join('.');
    if (path && !fields[path]) fields[path] = issue.message;
  }
  return fields;
}

export async function saveProduct(
  id: string | null,
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  if (!(await getAdminSession())) {
    return { error: 'Your session has expired. Please sign in again.', fields: {} };
  }

  const parsed = productSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: 'Some details need a second look.', fields: fieldErrors(parsed.error) };
  }

  const { images, ...product } = parsed.data;

  try {
    if (id) {
      /*
       * Images are replaced wholesale inside a transaction. Diffing them would
       * be more code for no gain: the uploader always posts the complete,
       * ordered list, and a half-applied reorder is worse than a rewrite.
       */
      await prisma.$transaction([
        prisma.product.update({
          where: { id },
          data: {
            ...product,
            description: product.description || null,
            size: product.size || null,
            finish: product.finish || null,
          },
        }),
        prisma.productImage.deleteMany({ where: { productId: id } }),
        ...(images.length
          ? [
              prisma.productImage.createMany({
                data: images.map((image, index) => ({
                  productId: id,
                  url: image.url,
                  altText: image.altText || null,
                  displayOrder: index,
                  isPrimary: index === 0,
                })),
              }),
            ]
          : []),
      ]);
    } else {
      await prisma.product.create({
        data: {
          ...product,
          description: product.description || null,
          size: product.size || null,
          finish: product.finish || null,
          images: {
            create: images.map((image, index) => ({
              url: image.url,
              altText: image.altText || null,
              displayOrder: index,
              isPrimary: index === 0,
            })),
          },
        },
      });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        error: null,
        fields: { slug: 'Another product already uses that slug. Try a different one.' },
      };
    }
    console.error('[product.save]', { id, error });
    return { error: 'We could not save that product. Please try again.', fields: {} };
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  redirect('/admin/products');
}

/**
 * A "use server" module may only export async functions, so this is a declared
 * wrapper rather than saveProduct.bind(null, null).
 */
export async function createProduct(
  prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  return saveProduct(null, prev, formData);
}

/**
 * Soft delete. A product may be referenced by anything the showroom has
 * quoted, so BACKEND.md §6 says deactivate rather than destroy.
 */
export async function toggleProductActive(id: string, isActive: boolean) {
  if (!(await getAdminSession())) return;

  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/products');
  revalidatePath('/');
}
