'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'SPAM'] as const;

type Option = { id: string; name: string };

/**
 * Filters live in the URL, so a filtered view can be bookmarked, shared with a
 * colleague, and handed straight to the CSV export.
 */
export function EnquiryFilters({
  brands,
  categories,
}: {
  brands: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      // Any filter change puts us back on page one; page 3 of the old filter
      // is rarely a page that still exists under the new one.
      next.delete('page');
      router.push(`/admin/enquiries?${next.toString()}`);
    },
    [params, router],
  );

  const field = 'mt-2 block w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-[0.9375rem] text-ink transition-colors hover:border-brass';
  const label = 'block text-[0.8125rem] font-semibold text-ink';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <label htmlFor="f-status" className={label}>Status</label>
        <select
          id="f-status"
          className={field}
          value={params.get('status') ?? ''}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="f-brand" className={label}>Brand</label>
        <select
          id="f-brand"
          className={field}
          value={params.get('brandId') ?? ''}
          onChange={(e) => update('brandId', e.target.value)}
        >
          <option value="">All</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="f-category" className={label}>Category</label>
        <select
          id="f-category"
          className={field}
          value={params.get('categoryId') ?? ''}
          onChange={(e) => update('categoryId', e.target.value)}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="f-from" className={label}>From</label>
        <input
          id="f-from"
          type="date"
          className={field}
          value={params.get('from') ?? ''}
          onChange={(e) => update('from', e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="f-to" className={label}>To</label>
        <input
          id="f-to"
          type="date"
          className={field}
          value={params.get('to') ?? ''}
          onChange={(e) => update('to', e.target.value)}
        />
      </div>
    </div>
  );
}
