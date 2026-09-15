import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/** Reads for the admin screens. Every caller checks the session first. */

export async function getDashboardStats() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newEnquiries, thisWeek, activeProducts, recent] = await prisma.$transaction([
    prisma.enquiry.count({ where: { status: 'NEW' } }),
    prisma.enquiry.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        phone: true,
        city: true,
        status: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return { newEnquiries, thisWeek, activeProducts, recent };
}

export type EnquiryFilters = {
  status?: string;
  brandId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
};

const ENQUIRY_PAGE_SIZE = 25;

export function buildEnquiryWhere(filters: EnquiryFilters): Prisma.EnquiryWhereInput {
  const where: Prisma.EnquiryWhereInput = {};

  if (filters.status) where.status = filters.status as Prisma.EnquiryWhereInput['status'];
  if (filters.brandId) where.brandId = filters.brandId;
  if (filters.categoryId) where.categoryId = filters.categoryId;

  if (filters.from || filters.to) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.from) createdAt.gte = new Date(`${filters.from}T00:00:00.000Z`);
    // `to` is inclusive of the whole day the user picked.
    if (filters.to) createdAt.lte = new Date(`${filters.to}T23:59:59.999Z`);
    where.createdAt = createdAt;
  }

  return where;
}

export async function getEnquiries(filters: EnquiryFilters) {
  const where = buildEnquiryWhere(filters);
  const page = Math.max(1, filters.page ?? 1);

  const [total, items] = await prisma.$transaction([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * ENQUIRY_PAGE_SIZE,
      take: ENQUIRY_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        city: true,
        status: true,
        source: true,
        createdAt: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ENQUIRY_PAGE_SIZE)),
    pageSize: ENQUIRY_PAGE_SIZE,
  };
}

export async function getEnquiry(id: string) {
  return prisma.enquiry.findUnique({
    where: { id },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  });
}

/** Unpaged, for CSV export. Filters still apply. */
export async function getEnquiriesForExport(filters: EnquiryFilters) {
  return prisma.enquiry.findMany({
    where: buildEnquiryWhere(filters),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      name: true,
      phone: true,
      email: true,
      city: true,
      status: true,
      source: true,
      message: true,
      internalNotes: true,
      attachmentUrl: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  });
}

/** Filter dropdowns: every brand and category, active or not. */
export async function getAdminFilterOptions() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);
  return { brands, categories };
}
