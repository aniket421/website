import Link from 'next/link';
import { getDashboardStats } from '@/lib/queries/admin';
import { getAdminSession } from '@/lib/admin-session';
import { Card, EmptyState, PageHeader, StatCard, StatusChip, formatDateTime } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  // Re-checked here as well as in the layout: every admin surface verifies.
  const session = await getAdminSession();
  if (!session) return null;

  const { newEnquiries, thisWeek, activeProducts, recent } = await getDashboardStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good to see you, ${session.name.split(' ')[0] || 'there'}`}
        description="Everything waiting on the showroom, at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="New enquiries" value={newEnquiries} />
        <StatCard label="Enquiries this week" value={thisWeek} />
        <StatCard label="Active products" value={activeProducts} />
      </div>

      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="text-card text-ink">
            Latest enquiries
          </h2>
          <Link
            href="/admin/enquiries"
            className="text-[0.875rem] font-semibold text-ink underline decoration-brass underline-offset-4"
          >
            See all
          </Link>
        </div>

        <div className="mt-4">
          {recent.length === 0 ? (
            <EmptyState
              title="No enquiries yet"
              description="When someone sends the enquiry form, calls or messages on WhatsApp, it will appear here."
            />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full min-w-[640px] text-left text-[0.9375rem]">
                <thead>
                  <tr className="border-b border-line text-[0.8125rem] uppercase tracking-[0.08em] text-body">
                    <th scope="col" className="px-5 py-3 font-semibold">Name</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Phone</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Interest</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((enquiry) => (
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
                        <a href={`tel:${enquiry.phone}`} className="text-ink">
                          {enquiry.phone}
                        </a>
                      </td>
                      <td className="px-5 py-3.5">{enquiry.category?.name ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <StatusChip status={enquiry.status} />
                      </td>
                      <td className="px-5 py-3.5 text-[0.875rem] text-body">
                        {formatDateTime(enquiry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
