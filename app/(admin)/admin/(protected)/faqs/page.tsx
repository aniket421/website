import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-session';
import { PageHeader } from '@/components/admin/ui';
import { ContentEditor, type FieldSpec } from '@/components/admin/ContentEditor';
import { saveFaq } from '../content/actions';
import { reorderFaqs, toggleFaq } from '../content/bindings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'FAQs' };

const fields: FieldSpec[] = [
  { name: 'question', label: 'Question', type: 'text', required: true },
  { name: 'displayOrder', label: 'Display order', type: 'number' },
  { name: 'answer', label: 'Answer', type: 'textarea', required: true },
  { name: 'isPublished', label: 'Published', type: 'checkbox' },
];

export default async function FaqsPage() {
  if (!(await getAdminSession())) return null;

  const faqs = await prisma.faq.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return (
    <div className="space-y-7">
      <PageHeader title="FAQs" description="The accordion on the homepage. The first published one opens by default." />
      <ContentEditor
        heading="Questions"
        fields={fields}
        action={saveFaq}
        onToggle={toggleFaq}
        onReorder={reorderFaqs}
        rows={faqs.map((f) => ({
          id: f.id,
          title: f.question,
          published: f.isPublished,
          question: f.question,
          answer: f.answer,
          displayOrder: f.displayOrder,
          isPublished: f.isPublished,
        }))}
      />
    </div>
  );
}
