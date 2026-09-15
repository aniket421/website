import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { PageHeader } from '@/components/admin/ui';
import { ProductForm } from '../ProductForm';
import { saveProduct } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  if (!(await getAdminSession())) return null;

  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
    }),
    prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  // Bind the id so the action knows this is an update, not a create.
  const action = saveProduct.bind(null, product.id);

  return (
    <div className="space-y-7">
      <PageHeader
        title={product.name}
        description={product.isActive ? 'Live on the site.' : 'Hidden from the site.'}
      />
      <ProductForm
        action={action}
        brands={brands}
        categories={categories}
        values={{
          name: product.name,
          slug: product.slug,
          brandId: product.brandId,
          categoryId: product.categoryId,
          description: product.description ?? '',
          size: product.size ?? '',
          finish: product.finish ?? '',
          application: product.application,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          displayOrder: product.displayOrder,
          images: product.images.map((image) => ({
            url: image.url,
            altText: image.altText ?? '',
          })),
        }}
      />
    </div>
  );
}
