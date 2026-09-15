import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, MessageCircle, Phone } from 'lucide-react';
import { getEnquiry } from '@/lib/queries/admin';
import { getAdminSession } from '@/lib/admin-session';
import { Card, PageHeader, StatusChip, formatDateTime } from '@/components/admin/ui';
import { EnquiryDetailForm } from '../EnquiryDetailForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Enquiry' };

export default async function EnquiryDetailPage({ params }: { params: { id: string } }) {
  if (!(await getAdminSession())) return null;

  const enquiry = await getEnquiry(params.id);
  if (!enquiry) notFound();

  // Numbers are stored E.164, so both links build straight off the column.
  const waNumber = enquiry.phone.replace(/\D/g, '');

  return (
    <div className="space-y-7">
      <Link
        href="/admin/enquiries"
        className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-ink"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to enquiries
      </Link>

      <PageHeader
        title={enquiry.name}
        description={`Received ${formatDateTime(enquiry.createdAt)} · ${enquiry.source.replace('_', ' ').toLowerCase()}`}
        action={<StatusChip status={enquiry.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-card text-ink">Contact</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Detail label="Phone">{enquiry.phone}</Detail>
              <Detail label="Email">{enquiry.email ?? '—'}</Detail>
              <Detail label="City">{enquiry.city ?? '—'}</Detail>
              <Detail label="Brand">{enquiry.brand?.name ?? 'No preference'}</Detail>
              <Detail label="Category">{enquiry.category?.name ?? 'Not sure yet'}</Detail>
              <Detail label="Reference">{enquiry.id}</Detail>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${enquiry.phone}`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-soft px-5 text-[0.9375rem] font-semibold text-surface transition-colors hover:bg-ink"
              >
                <Phone aria-hidden="true" className="h-4 w-4" />
                Call
              </a>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-brass hover:bg-brass-tint"
              >
                <MessageCircle aria-hidden="true" className="h-4 w-4" />
                WhatsApp
              </a>
              {enquiry.email ? (
                <a
                  href={`mailto:${enquiry.email}`}
                  className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-brass hover:bg-brass-tint"
                >
                  Email
                </a>
              ) : null}
            </div>
          </Card>

          <Card>
            <h2 className="text-card text-ink">Message</h2>
            <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-[1.7]">
              {enquiry.message || 'They did not leave a message.'}
            </p>

            {enquiry.attachmentUrl ? (
              <a
                href={enquiry.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-ink underline decoration-brass underline-offset-4"
              >
                <FileText aria-hidden="true" className="h-4 w-4 text-brass-deep" />
                View the attached reference
              </a>
            ) : null}
          </Card>
        </div>

        <Card>
          <h2 className="text-card text-ink">Update</h2>
          <div className="mt-4">
            <EnquiryDetailForm
              id={enquiry.id}
              status={enquiry.status}
              internalNotes={enquiry.internalNotes ?? ''}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-body">
        {label}
      </dt>
      <dd className="mt-1 break-words text-[0.9375rem] text-ink">{children}</dd>
    </div>
  );
}
