'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Expand, Pause, Play } from 'lucide-react';
import type { ProductListItem } from '@/lib/queries/catalogue';
import { cloudinaryUrl, imageSizes } from '@/lib/images';
import { usePrefersReducedMotion } from '@/lib/motion/hooks';
import { ProductViewer } from '@/components/product/ProductViewer';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/utils';

const DWELL_MS = 6500;

/**
 * The signature showcase: one very large photograph at a time, with the rest
 * of the range listed beside it.
 *
 * Every pane is mounted at once and cross-faded by opacity, so switching is
 * instant rather than a fetch-and-flash. That is affordable because the list
 * is capped at a handful of products and each pane is served at the width it
 * is actually drawn — the 4K file is only ever fetched when someone opens the
 * viewer and asks for it.
 */
export function ShowcaseClient({ products }: { products: ProductListItem[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  const select = useCallback((index: number) => {
    setActive(index);
    setPlaying(false);
  }, []);

  // Autoplay stops for reduced motion, while the viewer is open, and the
  // moment the reader takes over by choosing a range themselves.
  useEffect(() => {
    if (!playing || reduced || viewerOpen || products.length < 2) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % products.length),
      DWELL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [playing, reduced, viewerOpen, active, products.length]);

  const current = products[active];
  if (!current) return null;

  const currentImage = current.images[0];

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-heading"
      className="grain relative overflow-hidden bg-footer py-section-sm lg:py-section"
    >
      <div aria-hidden="true" className="aurora" />

      <Container className="relative">
        <div className="on-dark flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal as="p" y={14} className="text-eyebrow uppercase text-brass">
              Signature Ranges
            </Reveal>
            <SplitText
              as="h2"
              id="showcase-heading"
              text="Seen in 4K, before you see it on site"
              className="mt-3 block max-w-[20ch] text-heading text-surface"
              wordClassName={(word) => (word === '4K,' ? 'text-gradient-brass' : undefined)}
            />
          </div>
          <Reveal y={18} delay={160} className="max-w-[44ch]">
            <p className="text-lede text-surface/75">
              Open any range full screen and zoom in. What you are looking at is the
              manufacturer&apos;s own photograph at full resolution — the same surface
              you will run a hand over on the floor.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-8 lg:mt-14 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
          {/* ------------------------------------------------------ stage */}
          <Reveal scale={0.97} y={30} duration={1000} className="relative">
            <div className="relative aspect-[16/11] overflow-hidden rounded-panel border border-surface/10 bg-ink sm:aspect-[16/10]">
              {products.map((product, index) => {
                const image = product.images[0];
                if (!image) return null;

                return (
                  <Image
                    key={product.id}
                    src={cloudinaryUrl(image.url, { width: 2560, quality: 'best' })}
                    alt={image.altText ?? `${product.name} — ${product.category.name}`}
                    fill
                    priority={index === 0}
                    sizes={imageSizes.showcase}
                    className={cn(
                      'object-cover transition-[opacity,transform] duration-900 ease-out-expo',
                      index === active
                        ? 'scale-100 opacity-100'
                        : 'scale-105 opacity-0',
                    )}
                  />
                );
              })}

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,12,12,0.82)_0%,rgba(12,12,12,0.25)_42%,rgba(12,12,12,0)_70%)]"
              />

              <span className="absolute left-4 top-4 rounded-full glass-dark border border-surface/20 px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brass">
                4K · {current.brand.name}
              </span>

              <div className="on-dark absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-5 lg:p-7">
                <div className="min-w-0">
                  <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-brass">
                    {current.category.name}
                  </p>
                  <h3 className="mt-1.5 text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] font-extrabold tracking-[-0.02em] text-surface">
                    {current.name}
                  </h3>
                  {current.size || current.finish ? (
                    <p className="mt-1.5 text-[0.875rem] text-surface/70">
                      {[current.size, current.finish].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => setViewerOpen(true)}
                  disabled={!currentImage}
                  className="group inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full bg-brass px-5 text-[0.9375rem] font-bold text-ink transition-transform duration-400 ease-spring hover:scale-105 disabled:opacity-50"
                >
                  <Expand
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-400 ease-spring group-hover:rotate-12"
                  />
                  View in 4K
                </button>
              </div>
            </div>
          </Reveal>

          {/* ------------------------------------------------------- list */}
          <div className="on-dark flex flex-col">
            <ul className="flex-1 divide-y divide-surface/10 border-y border-surface/10">
              {products.map((product, index) => {
                const isActive = index === active;

                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => select(index)}
                      onMouseEnter={() => select(index)}
                      aria-current={isActive ? 'true' : undefined}
                      className="group relative block w-full py-4 text-left lg:py-5"
                    >
                      {/* Brass rule that grows from the left for the live row. */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-y-0 left-0 w-[2px] origin-top bg-brass transition-transform duration-600 ease-out-expo',
                          isActive ? 'scale-y-100' : 'scale-y-0',
                        )}
                      />
                      <span
                        className={cn(
                          'block pl-4 transition-[opacity,transform] duration-500 ease-out-expo',
                          isActive
                            ? 'translate-x-0 opacity-100'
                            : 'opacity-55 group-hover:translate-x-1 group-hover:opacity-90',
                        )}
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="text-[0.75rem] font-bold tabular-nums text-brass">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[1.0625rem] font-bold text-surface">
                            {product.name}
                          </span>
                        </span>
                        <span className="mt-1 block pl-[2.1rem] text-[0.8125rem] text-surface/60">
                          {product.brand.name} · {product.category.name}
                        </span>
                      </span>

                      {/* Dwell timer for the row that is playing. */}
                      {isActive && playing && !reduced && products.length > 1 ? (
                        <span
                          aria-hidden="true"
                          key={`timer-${active}`}
                          className="absolute bottom-0 left-0 h-px w-full origin-left bg-brass/60"
                          style={{
                            animation: `progress-grow ${DWELL_MS}ms linear both`,
                          }}
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-surface/25 px-6 text-[0.9375rem] font-semibold text-surface transition-colors duration-300 hover:border-brass hover:text-brass"
              >
                Browse the full catalogue
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-400 ease-spring group-hover:translate-x-1"
                />
              </Link>

              {products.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setPlaying((current) => !current)}
                  aria-label={playing ? 'Pause the showcase' : 'Play the showcase'}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-surface/25 text-surface transition-colors duration-300 hover:border-brass hover:text-brass"
                >
                  {playing ? (
                    <Pause aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Play aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Container>

      {viewerOpen && currentImage ? (
        <ProductViewer
          title={`${current.name} — ${current.brand.name}`}
          images={current.images}
          index={0}
          onIndexChange={() => undefined}
          onClose={() => setViewerOpen(false)}
        />
      ) : null}
    </section>
  );
}
