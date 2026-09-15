'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Option = { id: string; name: string };

/** Search and filters, held in the URL so a view can be shared or bookmarked. */
export function ProductSearch({
  brands,
  categories,
}: {
  brands: Option[];
  categories: Option[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/products?${next.toString()}`);
  };

  const field = 'mt-2 block w-full rounded-sm border border-line bg-surface px-3 py-2.5 text-[0.9375rem] text-ink transition-colors hover:border-brass';
  const label = 'block text-[0.8125rem] font-semibold text-ink';

  return (
    <form
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        const value = new FormData(e.currentTarget).get('search');
        update('search', String(value ?? ''));
      }}
    >
      <div>
        <label htmlFor="p-search" className={label}>Search</label>
        <input
          id="p-search"
          name="search"
          type="search"
          defaultValue={params.get('search') ?? ''}
          placeholder="Name, size or finish"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="p-brand" className={label}>Brand</label>
        <select id="p-brand" className={field} value={params.get('brandId') ?? ''} onChange={(e) => update('brandId', e.target.value)}>
          <option value="">All</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="p-category" className={label}>Category</label>
        <select id="p-category" className={field} value={params.get('categoryId') ?? ''} onChange={(e) => update('categoryId', e.target.value)}>
          <option value="">All</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="p-status" className={label}>State</label>
        <select id="p-status" className={field} value={params.get('status') ?? ''} onChange={(e) => update('status', e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </select>
      </div>
    </form>
  );
}
