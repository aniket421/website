import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { PageHeader } from '@/components/admin/ui';
import { ContentEditor, type FieldSpec } from '@/components/admin/ContentEditor';
import { saveGalleryImage } from '../content/actions';
import { removeGalleryImage, reorderGalleryImages, toggleGalleryImage } from '../content/bindings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gallery' };

export default async function GalleryPage() {
  if (!(await getAdminSession())) return null;

  const [images, categories] = await Promise.all([
    prisma.galleryImage.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }] }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  const fields: FieldSpec[] = [
    { name: 'url', label: 'Image URL', type: 'url', required: true, hint: 'Upload to Cloudinary, then paste the URL.' },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'select',
      options: [{ value: '', label: 'No category' }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    },
    { name: 'altText', label: 'Alt text', type: 'text', required: true, hint: 'Required: describes the image for screen readers.' },
    { name: 'caption', label: 'Caption', type: 'text' },
    { name: 'displayOrder', label: 'Display order', type: 'number' },
    { name: 'isPublished', label: 'Published', type: 'checkbox' },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Gallery"
        description="Showroom photography. These are the only records that are truly deleted rather than hidden."
      />
      <ContentEditor
        heading="Gallery images"
        fields={fields}
        action={saveGalleryImage}
        onToggle={toggleGalleryImage}
        onReorder={reorderGalleryImages}
        onDelete={removeGalleryImage}
        rows={images.map((image) => ({
          id: image.id,
          title: image.caption || image.altText,
          subtitle: image.url.split('/').pop(),
          published: image.isPublished,
          url: image.url,
          caption: image.caption ?? '',
          altText: image.altText,
          categoryId: image.categoryId ?? '',
          displayOrder: image.displayOrder,
          isPublished: image.isPublished,
        }))}
      />
    </div>
  );
}
