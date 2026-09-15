import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { Card, EmptyState, PageHeader } from '@/components/admin/ui';
import { ProductSearch } from './ProductSearch';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; brandId?: string; categoryId?: string; status?: string };
}) {
  if (!(await getAdminSession())) return null;

  const search = searchParams.search?.trim();

  const [products, brands, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(searchParams.brandId ? { brandId: searchParams.brandId } : {}),
        ...(searchParams.categoryId ? { categoryId: searchParams.categoryId } : {}),
        ...(searchParams.status === 'active' ? { isActive: true } : {}),
        ...(searchParams.status === 'inactive' ? { isActive: false } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { finish: { contains: search, mode: 'insensitive' as const } },
                { size: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        size: true,
        finish: true,
        isActive: true,
        isFeatured: true,
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { orderBy: { displayOrder: 'asc' }, take: 1, select: { url: true } },
      },
    }),
    prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Products"
        description={`${products.length} matching this view.`}
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-soft px-5 text-[0.9375rem] font-semibold text-surface transition-colors hover:bg-ink"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add Product
          </Link>
        }
      />

      <Card>
        <ProductSearch brands={brands} categories={categories} />
      </Card>

      {products.length === 0 ? (
        <EmptyState
          title="No products here"
          description="Nothing matches this view. Clear the filters, or add the first product."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-[0.9375rem]">
            <thead>
              <tr className="border-b border-line text-[0.8125rem] uppercase tracking-[0.08em] text-body">
                <th scope="col" className="px-5 py-3 font-semibold">Product</th>
                <th scope="col" className="px-5 py-3 font-semibold">Brand</th>
                <th scope="col" className="px-5 py-3 font-semibold">Category</th>
                <th scope="col" className="px-5 py-3 font-semibold">Size</th>
                <th scope="col" className="px-5 py-3 font-semibold">Finish</th>
                <th scope="col" className="px-5 py-3 font-semibold">State</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-surface-alt">
                        {product.images[0] ? (
                          <Image src={product.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-semibold text-ink underline decoration-brass underline-offset-4"
                        >
                          {product.name}
                        </Link>
                        {product.isFeatured ? (
                          <span className="ml-2 text-[0.75rem] font-semibold text-brass-deep">Featured</span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{product.brand.name}</td>
                  <td className="px-5 py-3.5">{product.category.name}</td>
                  <td className="px-5 py-3.5">{product.size ?? '—'}</td>
                  <td className="px-5 py-3.5">{product.finish ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        product.isActive
                          ? 'inline-flex items-center rounded-full border border-line bg-surface-alt px-2.5 py-1 text-[0.75rem] font-semibold text-ink'
                          : 'inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-1 text-[0.75rem] font-semibold text-body'
                      }
                    >
                      {product.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
