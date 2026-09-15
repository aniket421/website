import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { PageHeader } from '@/components/admin/ui';
import { ContentEditor, type FieldSpec } from '@/components/admin/ContentEditor';
import { saveBrand } from '../content/actions';
import { reorderBrands, toggleBrand } from '../content/bindings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Brands' };

const fields: FieldSpec[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', hint: 'Lowercase, hyphenated.', required: true },
  { name: 'logoUrl', label: 'Logo URL', type: 'url', hint: 'Leave blank to show the wordmark.' },
  { name: 'websiteUrl', label: 'Website', type: 'url' },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'isActive', label: 'Active on the site', type: 'checkbox' },
];

export default async function BrandsPage() {
  if (!(await getAdminSession())) return null;

  const brands = await prisma.brand.findMany({
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-7">
      <PageHeader title="Brands" description="The roster shown in the marquee, the footer and the enquiry form." />
      <ContentEditor
        heading="Partner brands"
        publishLabel="Active"
        fields={fields}
        action={saveBrand}
        onToggle={toggleBrand}
        onReorder={reorderBrands}
        rows={brands.map((b) => ({
          id: b.id,
          title: b.name,
          subtitle: b.slug,
          published: b.isActive,
          name: b.name,
          slug: b.slug,
          logoUrl: b.logoUrl ?? '',
          websiteUrl: b.websiteUrl ?? '',
          description: b.description ?? '',
          displayOrder: b.displayOrder,
          isActive: b.isActive,
        }))}
      />
    </div>
  );
}
