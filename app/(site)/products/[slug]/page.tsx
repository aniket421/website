import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, MessageCircle, Phone } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGallery } from '@/components/product/ProductGallery';
import { Reveal } from '@/components/motion/Reveal';
import { stagger } from '@/lib/motion/stagger';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries/catalogue';
import { safeQuery } from '@/lib/queries/safe';
import { enquiryHref } from '@/lib/data/nav';
import { site, telUrl } from '@/lib/data/site';
import { cloudinaryUrl } from '@/lib/images';

/** Catalogue edits appear within five minutes without a redeploy. */
export const revalidate = 300;

const APPLICATION_LABELS: Record<string, string> = {
  FLOOR: 'Floor',
  WALL: 'Wall',
  BOTH: 'Wall and floor',
  OUTDOOR: 'Outdoor',
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await safeQuery(`product:${params.slug}`, () => getProductBySlug(params.slug), null);
  if (!product) return { title: 'Product not found' };

  const description =
    product.description ||
    `${product.name} by ${product.brand.name} — ${[product.size, product.finish]
      .filter(Boolean)
      .join(', ')}. In stock at ${site.name}, Ghaziabad.`;

  const image = product.images[0];

  return {
    title: `${product.name} — ${product.brand.name}`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} — ${product.brand.name}`,
      description,
      images: image ? [{ url: cloudinaryUrl(image.url, { width: 1200 }) }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await safeQuery(
    `product:${params.slug}`,
    () => getProductBySlug(params.slug),
    null,
  );
  if (!product) notFound();

  const related = await safeQuery(
    'relatedProducts',
    () => getRelatedProducts(product.category.id, product.id),
    [],
  );

  const specs = [
    { label: 'Brand', value: product.brand.name },
    { label: 'Category', value: product.category.name },
    { label: 'Size', value: product.size },
    { label: 'Finish', value: product.finish },
    { label: 'Application', value: APPLICATION_LABELS[product.application] },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value));

  return (
    <>
      <PageHero
        eyebrow={product.brand.name}
        title={product.name}
        crumbs={[
          { label: 'Products', href: '/products' },
          { label: product.category.name, href: `/products?category=${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <Section aria-label={product.name}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
            <Reveal y={30} scale={0.98} duration={900}>
              <ProductGallery
                images={product.images}
                title={`${product.name} — ${product.brand.name}`}
              />
            </Reveal>

            <Reveal y={26} delay={140}>
              {product.description ? (
                <p className="max-w-measure text-lede">{product.description}</p>
              ) : (
                <p className="max-w-measure text-lede">
                  {product.name} is on the floor now in {product.category.name.toLowerCase()}.
                  Ask a consultant for the full size and finish list, current stock and a
                  price for your area.
                </p>
              )}

              <dl className="mt-9 divide-y divide-line border-y border-line">
                {specs.map((spec, index) => (
                  <Reveal
                    key={spec.label}
                    y={12}
                    delay={stagger(index, 60)}
                    className="flex items-baseline justify-between gap-6 py-4"
                  >
                    <dt className="text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-brass-deep">
                      {spec.label}
                    </dt>
                    <dd className="text-right text-[0.9375rem] font-semibold text-ink">
                      {spec.value}
                    </dd>
                  </Reveal>
                ))}
              </dl>

              {/*
                No price, deliberately: showroom pricing is quoted against area,
                brand scheme and delivery, and a stale published figure is worse
                than none. See BACKEND.md §3.
              */}
              <ul className="mt-7 space-y-2.5">
                {[
                  'Sourced directly from the manufacturer, with warranty papers',
                  'Seen under showroom lighting before you commit',
                  'Delivered across Ghaziabad, Noida, Delhi and the wider NCR',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-[0.9375rem]">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-brass"
                      strokeWidth={2.5}
                    />
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`${enquiryHref}?product=${encodeURIComponent(product.name)}&category=${product.category.id}&brand=${product.brand.id}`}
                  className="group inline-flex h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-full bg-brass px-6 text-copy font-semibold text-ink transition-[background-color,box-shadow] duration-300 hover:bg-brass-soft hover:shadow-brass"
                >
                  Enquire about this range
                  <ArrowRight
                    aria-hidden="true"
                    className="h-[1.125rem] w-[1.125rem] transition-transform duration-400 ease-spring group-hover:translate-x-1"
                  />
                </Link>
                <a
                  href={telUrl}
                  className="inline-flex h-[3.25rem] items-center justify-center gap-2.5 rounded-full border border-line px-6 text-copy font-semibold text-ink transition-colors duration-300 hover:border-brass hover:bg-brass-tint"
                >
                  <Phone aria-hidden="true" className="h-[1.125rem] w-[1.125rem] text-brass" />
                  Call the floor
                </a>
              </div>

              <p className="mt-4 flex items-center gap-2 text-[0.875rem]">
                <MessageCircle aria-hidden="true" className="h-4 w-4 text-brass" />
                {site.responsePromise}
              </p>
            </Reveal>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="alt" aria-labelledby="related-heading">
          <Container>
            <SectionHeading
              id="related-heading"
              align="left"
              eyebrow="More from this range"
              title={`Other ${product.category.name.toLowerCase()} on the floor`}
            />
            <ul className="mt-11 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item, index) => (
                <Reveal as="li" key={item.id} y={26} delay={stagger(index, 90)}>
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
