import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { PageHeader } from '@/components/admin/ui';
import { ContentEditor, type FieldSpec } from '@/components/admin/ContentEditor';
import { saveTestimonial } from '../content/actions';
import { reorderTestimonials, toggleTestimonial } from '../content/bindings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Testimonials' };

const fields: FieldSpec[] = [
  { name: 'authorName', label: 'Name', type: 'text', required: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  {
    name: 'rating',
    label: 'Rating',
    type: 'select',
    hint: 'Stars are filled to this number — do not round up.',
    options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n === 1 ? '' : 's'}` })),
  },
  { name: 'source', label: 'Source', type: 'text', placeholder: 'Google Review' },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  { name: 'quote', label: 'Quote', type: 'textarea', required: true },
  { name: 'isPublished', label: 'Published', type: 'checkbox' },
];

export default async function TestimonialsPage() {
  if (!(await getAdminSession())) return null;

  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="space-y-7">
      <PageHeader title="Testimonials" description="Shown one at a time on the homepage." />
      <ContentEditor
        heading="Customer reviews"
        fields={fields}
        action={saveTestimonial}
        onToggle={toggleTestimonial}
        onReorder={reorderTestimonials}
        rows={testimonials.map((t) => ({
          id: t.id,
          title: `${t.authorName} — ${t.rating}★`,
          subtitle: t.city,
          published: t.isPublished,
          authorName: t.authorName,
          city: t.city,
          quote: t.quote,
          rating: t.rating,
          source: t.source,
          displayOrder: t.displayOrder,
          isPublished: t.isPublished,
        }))}
      />
    </div>
  );
}
