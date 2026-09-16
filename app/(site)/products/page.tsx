import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, PackageSearch } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Reveal } from '@/components/motion/Reveal';
import { stagger } from '@/lib/motion/stagger';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { getBrands, getCategories, getFinishes, getProducts } from '@/lib/queries/catalogue';
import { safeQuery } from '@/lib/queries/safe';
import { productQuerySchema } from '@/lib/validations/catalogue';
import { enquiryHref } from '@/lib/data/nav';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Product Catalogue',
  description:
    'Browse designer tiles, wall and floor tiles, sanitaryware, faucets, wash basins, large slabs and bathroom accessories from nine premium brands, in stock in Ghaziabad.',
  alternates: { canonical: '/products' },
};

/** Filters live in the query string, so the page is rendered per request. */
export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

const EMPTY_RESULT = { items: [], total: 0, page: 1, totalPages: 1 };

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  // Empty values are dropped so an untouched filter falls through to the
  // schema's default instead of filtering on "".
  const raw = Object.fromEntries(
    Object.entries(searchParams)
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
      .filter(([, value]) => value !== undefined && value !== ''),
  );

  const parsed = productQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : productQuerySchema.parse({});

  const [result, categories, brands, finishes] = await Promise.all([
    safeQuery('products', () => getProducts(query), EMPTY_RESULT),
    safeQuery('categories', () => getCategories(), []),
    safeQuery('brands', () => getBrands(), []),
    safeQuery('finishes', () => getFinishes(), []),
  ]);

  const activeCategory = categories.find((category) => category.slug === query.category);

  return (
    <>
      <PageHero
        eyebrow="The Catalogue"
        title={activeCategory ? activeCategory.name : 'Everything on the floor'}
        lede={
          activeCategory?.description ??
          'Every range we stock, photographed at full resolution. Open any product to inspect the surface in 4K before you drive over to see it in person.'
        }
        crumbs={[{ label: 'Products', href: '/products' }]}
      >
        <ProductFilters
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          }))}
          brands={brands.map((brand) => ({ id: brand.id, name: brand.name }))}
          finishes={finishes}
          total={result.total}
        />
      </PageHero>

      <Section aria-label="Products">
        <Container>
          {result.items.length === 0 ? (
            <EmptyState filtered={Boolean(query.category || query.brand || query.search)} />
          ) : (
            <>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {result.items.map((product, index) => (
                  <Reveal
                    as="li"
                    key={product.id}
                    y={28}
                    scale={0.98}
                    delay={stagger(index % 3 === 0 ? 0 : index % 3, 90)}
                  >
                    <ProductCard product={product} priority={index < 3} />
                  </Reveal>
                ))}
              </ul>

              <Pagination page={result.page} totalPages={result.totalPages} params={raw} />
            </>
          )}
        </Container>
      </Section>
    </>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <Reveal className="mx-auto max-w-[52ch] rounded-panel border border-line bg-surface-alt p-10 text-center">
      <PackageSearch
        aria-hidden="true"
        className="mx-auto h-11 w-11 text-brass"
        strokeWidth={1.25}
      />
      <h2 className="mt-5 text-heading">
        {filtered ? 'Nothing matches those filters' : 'The catalogue is being photographed'}
      </h2>
      <p className="mt-4 text-copy">
        {filtered
          ? 'Try widening the search, or tell us what you are after and a consultant will check the floor for you — a good deal of our stock turns over faster than the website.'
          : 'Ranges are being added to the site as they are photographed. In the meantime the whole floor is open: tell us what you are looking for and we will send sizes, finishes and availability.'}
      </p>
      <Link
        href={enquiryHref}
        className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-ink-soft px-6 text-[0.9375rem] font-semibold text-surface transition-colors duration-300 hover:bg-ink"
      >
        Send an enquiry
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </Reveal>
  );
}

function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value && key !== 'page') next.set(key, value);
    }
    if (target > 1) next.set('page', String(target));
    const query = next.toString();
    return query ? `/products?${query}` : '/products';
  };

  return (
    <nav aria-label="Catalogue pages" className="mt-14 flex items-center justify-center gap-3">
      <PageLink href={hrefFor(page - 1)} disabled={page <= 1} label="Previous page">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
      </PageLink>

      <p className="text-[0.9375rem] font-semibold tabular-nums text-ink">
        Page {page}
        <span className="font-normal text-body"> of {totalPages}</span>
      </p>

      <PageLink href={hrefFor(page + 1)} disabled={page >= totalPages} label="Next page">
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const classes = cn(
    'inline-flex h-12 w-12 items-center justify-center rounded-full border transition-[color,border-color,transform] duration-300 ease-spring',
    disabled
      ? 'cursor-not-allowed border-line text-body/35'
      : 'border-line text-ink hover:scale-110 hover:border-brass hover:text-brass-deep',
  );

  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={label} className={classes}>
        {children}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className={classes}>
      {children}
    </Link>
  );
}
