import Link from 'next/link';
import { Download } from 'lucide-react';
import { getAdminFilterOptions, getEnquiries } from '@/lib/queries/admin';
import { getAdminSession } from '@/lib/admin-session';
import { Card, EmptyState, PageHeader, StatusChip, formatDateTime } from '@/components/admin/ui';
import { EnquiryFilters } from './EnquiryFilters';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Enquiries' };

type SearchParams = {
  status?: string;
  brandId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: string;
};

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  if (!(await getAdminSession())) return null;

  const filters = {
    status: searchParams.status,
    brandId: searchParams.brandId,
    categoryId: searchParams.categoryId,
    from: searchParams.from,
    to: searchParams.to,
    page: Number(searchParams.page) || 1,
  };

  const [{ items, total, page, totalPages }, { brands, categories }] = await Promise.all([
    getEnquiries(filters),
    getAdminFilterOptions(),
  ]);

  // The export takes the same filters, so what you see is what you download.
  const exportQuery = new URLSearchParams(
    Object.entries(searchParams).filter(([k, v]) => v && k !== 'page') as [string, string][],
  ).toString();

  return (
    <div className="space-y-7">
      <PageHeader
        title="Enquiries"
        description={`${total} ${total === 1 ? 'enquiry' : 'enquiries'} matching these filters.`}
        action={
          <a
            href={`/api/admin/enquiries/export${exportQuery ? `?${exportQuery}` : ''}`}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-brass hover:bg-brass-tint"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Export CSV
          </a>
        }
      />

      <Card>
        <EnquiryFilters brands={brands} categories={categories} />
      </Card>

      {items.length === 0 ? (
        <EmptyState
          title="Nothing here"
          description="No enquiries match these filters. Clear them, or widen the date range."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-left text-[0.9375rem]">
            <caption className="sr-only">Enquiries, most recent first</caption>
            <thead>
              <tr className="border-b border-line text-[0.8125rem] uppercase tracking-[0.08em] text-body">
                <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                <th scope="col" className="px-5 py-3 font-semibold">Brand</th>
                <th scope="col" className="px-5 py-3 font-semibold">Category</th>
                <th scope="col" className="px-5 py-3 font-semibold">Source</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 font-semibold">Received</th>
              </tr>
            </thead>
            <tbody>
              {items.map((enquiry) => (
                <tr key={enquiry.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/enquiries/${enquiry.id}`}
                      className="font-semibold text-ink underline decoration-brass underline-offset-4"
                    >
                      {enquiry.name}
                    </Link>
                    {enquiry.city ? (
                      <span className="block text-[0.8125rem] text-body">{enquiry.city}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5">
                    <a href={`tel:${enquiry.phone}`} className="text-ink">{enquiry.phone}</a>
                  </td>
                  <td className="px-5 py-3.5">{enquiry.brand?.name ?? '—'}</td>
                  <td className="px-5 py-3.5">{enquiry.category?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-body">{enquiry.source}</td>
                  <td className="px-5 py-3.5"><StatusChip status={enquiry.status} /></td>
                  <td className="px-5 py-3.5 text-[0.875rem] text-body">
                    {formatDateTime(enquiry.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
          <PageLink searchParams={searchParams} page={page - 1} disabled={page <= 1}>
            Previous
          </PageLink>
          <p className="text-[0.9375rem] text-body">Page {page} of {totalPages}</p>
          <PageLink searchParams={searchParams} page={page + 1} disabled={page >= totalPages}>
            Next
          </PageLink>
        </nav>
      ) : null}
    </div>
  );
}

function PageLink({
  searchParams,
  page,
  disabled,
  children,
}: {
  searchParams: SearchParams;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-11 cursor-not-allowed items-center rounded-full border border-line px-5 text-[0.9375rem] font-semibold text-body/40">
        {children}
      </span>
    );
  }

  const params = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v) as [string, string][],
  );
  params.set('page', String(page));

  return (
    <Link
      href={`/admin/enquiries?${params.toString()}`}
      className="inline-flex h-11 items-center rounded-full border border-line bg-surface px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-brass hover:bg-brass-tint"
    >
      {children}
    </Link>
  );
}
