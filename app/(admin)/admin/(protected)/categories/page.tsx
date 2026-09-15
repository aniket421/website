import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { PageHeader } from '@/components/admin/ui';
import { ContentEditor, type FieldSpec } from '@/components/admin/ContentEditor';
import { saveCategory } from '../content/actions';
import { reorderCategories, toggleCategory } from '../content/bindings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Categories' };

const fields: FieldSpec[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'slug', label: 'Slug', type: 'text', hint: 'Lowercase, hyphenated.', required: true },
  { name: 'imageUrl', label: 'Card image URL', type: 'url', hint: 'Leave blank for the neutral placeholder.' },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  { name: 'description', label: 'One-line description', type: 'textarea', hint: 'Shown over the card image.' },
  { name: 'isActive', label: 'Active on the site', type: 'checkbox' },
];

export default async function CategoriesPage() {
  if (!(await getAdminSession())) return null;

  const categories = await prisma.category.findMany({
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });

  return (
    <div className="space-y-7">
      <PageHeader title="Categories" description="The collections rail, the nav dropdown and the footer all read from here." />
      <ContentEditor
        heading="Product categories"
        publishLabel="Active"
        fields={fields}
        action={saveCategory}
        onToggle={toggleCategory}
        onReorder={reorderCategories}
        rows={categories.map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: c.slug,
          published: c.isActive,
          name: c.name,
          slug: c.slug,
          imageUrl: c.imageUrl ?? '',
          description: c.description ?? '',
          displayOrder: c.displayOrder,
          isActive: c.isActive,
        }))}
      />
    </div>
  );
}
