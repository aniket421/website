import { prisma } from '@/lib/prisma';

/**
 * The brand and category options the enquiry form offers. Read server-side and
 * passed into the form as props, so the page renders with real data and the
 * client does not round-trip for a list it could have had at first paint.
 */
export type Option = { id: string; name: string };

export async function getEnquiryOptions(): Promise<{ brands: Option[]; categories: Option[] }> {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
  ]);

  return { brands, categories };
}
