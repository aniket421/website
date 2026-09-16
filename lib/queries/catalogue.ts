import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ProductQuery } from '@/lib/validations/catalogue';

/**
 * The read layer. Server Components call these directly — there is no reason to
 * round-trip through HTTP for a page that is server-rendered anyway. The route
 * handlers in app/api/ wrap these same functions for client-side filtering.
 */

const activeOrder = [{ displayOrder: 'asc' as const }, { name: 'asc' as const }];

export async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: activeOrder,
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      description: true,
      websiteUrl: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: activeOrder,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      authorName: true,
      city: true,
      quote: true,
      rating: true,
      source: true,
    },
  });
}

export async function getFaqs() {
  return prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, question: true, answer: true },
  });
}

export async function getGalleryImages() {
  return prisma.galleryImage.findMany({
    where: { isPublished: true },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      url: true,
      caption: true,
      altText: true,
      category: { select: { name: true, slug: true } },
    },
  });
}

/** Filters accept a slug or an id, so URLs can stay readable. */
function slugOrId(value: string | undefined) {
  if (!value) return undefined;
  return { OR: [{ slug: value }, { id: value }] };
}

export async function getProducts(query: ProductQuery) {
  const where: Prisma.ProductWhereInput = { isActive: true };

  const brand = slugOrId(query.brand);
  if (brand) where.brand = brand;

  const category = slugOrId(query.category);
  if (category) where.category = category;

  if (query.application) where.application = query.application;
  if (query.finish) where.finish = { equals: query.finish, mode: 'insensitive' };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { size: { contains: query.search, mode: 'insensitive' } },
      { finish: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        name: true,
        slug: true,
        size: true,
        finish: true,
        application: true,
        isFeatured: true,
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
          take: 1,
          select: { url: true, altText: true },
        },
      },
    }),
  ]);

  return {
    items,
    total,
    page: query.page,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    // Inactive products 404 rather than rendering, so an unpublished range
    // cannot be reached by guessing its URL.
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      size: true,
      finish: true,
      application: true,
      isFeatured: true,
      brand: { select: { id: true, name: true, slug: true, logoUrl: true, websiteUrl: true } },
      category: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        select: { id: true, url: true, altText: true, isPrimary: true },
      },
    },
  });
}

/** Distinct finishes actually present on active products, for the filter UI. */
export async function getFinishes(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, finish: { not: null } },
    distinct: ['finish'],
    orderBy: { finish: 'asc' },
    select: { finish: true },
  });
  return rows.map((row) => row.finish).filter((f): f is string => Boolean(f));
}

/**
 * The card shape every listing uses. Derived from the query rather than
 * written out again, so adding a column to the select cannot leave the
 * components describing a product that no longer exists.
 */
export type ProductListItem = Awaited<ReturnType<typeof getProducts>>['items'][number];
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
export type GalleryImageItem = Awaited<ReturnType<typeof getGalleryImages>>[number];
export type CategoryItem = Awaited<ReturnType<typeof getCategories>>[number];

/**
 * The ranges the showroom wants on the front page. Featured first, and only
 * products that actually have a photograph — the showcase is a full-bleed
 * image pane, and a placeholder gradient in it would say nothing.
 */
export async function getFeaturedProducts(limit = 6): Promise<ProductListItem[]> {
  const featured = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true, images: { some: {} } },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      size: true,
      finish: true,
      application: true,
      isFeatured: true,
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        take: 1,
        select: { url: true, altText: true },
      },
    },
  });

  if (featured.length >= limit) return featured;

  // Nothing flagged yet: fall back to the newest photographed stock so the
  // showcase is never an empty frame on a freshly seeded database.
  const filler = await prisma.product.findMany({
    where: {
      isActive: true,
      images: { some: {} },
      id: { notIn: featured.map((product) => product.id) },
    },
    orderBy: { createdAt: 'desc' },
    take: limit - featured.length,
    select: {
      id: true,
      name: true,
      slug: true,
      size: true,
      finish: true,
      application: true,
      isFeatured: true,
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        take: 1,
        select: { url: true, altText: true },
      },
    },
  });

  return [...featured, ...filler];
}

/** Slugs of every active product, for generateStaticParams. */
export async function getProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return rows.map((row) => row.slug);
}

/** Four more from the same category, to keep a detail page from dead-ending. */
export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
): Promise<ProductListItem[]> {
  return prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: excludeId } },
    orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      size: true,
      finish: true,
      application: true,
      isFeatured: true,
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
        take: 1,
        select: { url: true, altText: true },
      },
    },
  });
}
