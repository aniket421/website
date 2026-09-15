import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { PageHeader } from '@/components/admin/ui';
import { ProductForm } from '../ProductForm';
import { createProduct } from '../actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New product' };

export default async function NewProductPage() {
  if (!(await getAdminSession())) return null;

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-7">
      <PageHeader title="Add a product" description="It goes live as soon as you save it, unless you untick Active." />
      <ProductForm
        action={createProduct}
        brands={brands}
        categories={categories}
        values={{
          name: '',
          slug: '',
          brandId: '',
          categoryId: '',
          description: '',
          size: '',
          finish: '',
          application: 'BOTH',
          isFeatured: false,
          isActive: true,
          displayOrder: 0,
          images: [],
        }}
      />
    </div>
  );
}
