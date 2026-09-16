'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Option } from '@/lib/queries/reference';
import { cn } from '@/lib/utils';

export type FilterCategory = { id: string; name: string; slug: string };

const APPLICATIONS = [
  { value: 'FLOOR', label: 'Floor' },
  { value: 'WALL', label: 'Wall' },
  { value: 'BOTH', label: 'Wall & floor' },
  { value: 'OUTDOOR', label: 'Outdoor' },
] as const;

/**
 * Catalogue filters.
 *
 * Filter state lives in the URL, not in component state: a filtered catalogue
 * is a thing people send each other, and the showroom links straight to
 * /products?category=large-slabs from the nav. Changing a filter replaces the
 * history entry so Back leaves the catalogue rather than walking through every
 * chip that was tried.
 */
export function ProductFilters({
  categories,
  brands,
  finishes,
  total,
}: {
  categories: FilterCategory[];
  brands: Option[];
  finishes: string[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(params.get('search') ?? '');

  const category = params.get('category') ?? '';
  const brand = params.get('brand') ?? '';
  const finish = params.get('finish') ?? '';
  const application = params.get('application') ?? '';
  const activeCount = [category, brand, finish, application, params.get('search') ?? ''].filter(
    Boolean,
  ).length;

  const apply = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      // Any filter change starts the results again from page one.
      next.delete('page');

      startTransition(() => {
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  // Debounced search: one navigation per pause in typing, not one per keypress.
  useEffect(() => {
    const currentSearch = params.get('search') ?? '';
    if (search === currentSearch) return;
    const timer = window.setTimeout(() => apply({ search }), 350);
    return () => window.clearTimeout(timer);
  }, [search, params, apply]);

  const clearAll = () => {
    setSearch('');
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  return (
    <div data-pending={pending ? '' : undefined} className="transition-opacity duration-300">
      {/* --------------------------------------------------------- search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brass"
          />
          <label htmlFor="catalogue-search" className="sr-only">
            Search the catalogue by name, size or finish
          </label>
          <input
            id="catalogue-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, size or finish…"
            className="h-12 w-full rounded-full border border-surface/25 bg-surface/10 pl-11 pr-4 text-[0.9375rem] text-surface placeholder:text-surface/50 transition-colors duration-300 hover:border-brass focus:border-brass"
          />
        </div>

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="catalogue-filters"
          className={cn(
            'inline-flex h-12 items-center gap-2 rounded-full border px-5 text-[0.9375rem] font-semibold transition-colors duration-300',
            open || activeCount > 0
              ? 'border-brass bg-brass/15 text-brass'
              : 'border-surface/25 text-surface hover:border-brass hover:text-brass',
          )}
        >
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          Filters
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1.5 text-[0.6875rem] font-bold text-ink">
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* -------------------------------------------------------- category */}
      <ul className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        <li>
          <Chip active={!category} onClick={() => apply({ category: '' })}>
            All ranges
          </Chip>
        </li>
        {categories.map((item) => (
          <li key={item.id}>
            <Chip active={category === item.slug} onClick={() => apply({ category: item.slug })}>
              {item.name}
            </Chip>
          </li>
        ))}
      </ul>

      {/* --------------------------------------------------------- drawer */}
      <div
        id="catalogue-filters"
        aria-hidden={!open}
        className={cn(
          'grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-out-expo',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0">
          <div className="mt-5 grid gap-4 rounded-panel border border-surface/15 bg-surface/5 p-5 sm:grid-cols-3">
            <Select
              id="filter-brand"
              label="Brand"
              value={brand}
              disabled={!open}
              onChange={(value) => apply({ brand: value })}
              options={[
                { value: '', label: 'Every brand' },
                ...brands.map((item) => ({ value: item.id, label: item.name })),
              ]}
            />
            <Select
              id="filter-finish"
              label="Finish"
              value={finish}
              disabled={!open}
              onChange={(value) => apply({ finish: value })}
              options={[
                { value: '', label: 'Any finish' },
                ...finishes.map((item) => ({ value: item, label: item })),
              ]}
            />
            <Select
              id="filter-application"
              label="Application"
              value={application}
              disabled={!open}
              onChange={(value) => apply({ application: value })}
              options={[
                { value: '', label: 'Anywhere' },
                ...APPLICATIONS.map((item) => ({ value: item.value, label: item.label })),
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <p aria-live="polite" className="text-[0.875rem] text-surface/70">
          {pending ? 'Updating…' : `${total} ${total === 1 ? 'product' : 'products'}`}
        </p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-brass transition-colors hover:text-brass-soft"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'whitespace-nowrap rounded-full border px-4 py-2.5 text-[0.875rem] font-medium transition-[color,background-color,border-color,transform] duration-300 ease-out-expo',
        active
          ? 'border-brass bg-brass text-ink'
          : 'border-surface/20 text-surface/75 hover:-translate-y-0.5 hover:border-brass hover:text-surface',
      )}
    >
      {children}
    </button>
  );
}

function Select({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.8125rem] font-semibold text-surface/80">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block h-11 w-full rounded-sm border border-surface/20 bg-footer px-3 text-[0.9375rem] text-surface transition-colors duration-200 hover:border-brass"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
