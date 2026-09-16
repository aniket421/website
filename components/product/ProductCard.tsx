'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import type { ProductListItem } from '@/lib/queries/catalogue';
import { cloudinaryUrl, imageSizes } from '@/lib/images';
import { TiltCard } from '@/components/motion/TiltCard';
import { cn } from '@/lib/utils';

const APPLICATION_LABELS: Record<string, string> = {
  FLOOR: 'Floor',
  WALL: 'Wall',
  BOTH: 'Wall & floor',
  OUTDOOR: 'Outdoor',
};

/**
 * One product in a listing. The whole card is a link to the detail page, where
 * the full-resolution viewer lives — the card itself carries a card-sized
 * derivative, never the 4K file.
 */
export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: ProductListItem;
  /** Set on the first row so the grid's LCP image is not lazy-loaded. */
  priority?: boolean;
  className?: string;
}) {
  const image = product.images[0];
  const specs = [product.size, product.finish, APPLICATION_LABELS[product.application]].filter(
    Boolean,
  );

  return (
    <TiltCard max={5} className={cn('h-full', className)}>
      <Link
        href={`/products/${product.slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface hover-lift hover:shadow-panel"
      >
        <div className="relative aspect-[4/3.4] overflow-hidden bg-surface-alt">
          {image ? (
            <Image
              src={cloudinaryUrl(image.url, { width: 1200 })}
              alt={image.altText ?? `${product.name} — ${product.category.name}`}
              fill
              sizes={imageSizes.productCard}
              priority={priority}
              className="object-cover transition-transform duration-900 ease-out-expo group-hover:scale-[1.07]"
            />
          ) : (
            <div
              role="img"
              aria-label={`${product.name} — photograph to follow`}
              className="asset-placeholder absolute inset-0"
            />
          )}

          {/* Reads the product name over a busy photograph on hover. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(26,26,26,0.55),rgba(26,26,26,0)_46%)] opacity-0 transition-opacity duration-500 ease-out-expo group-hover:opacity-100"
          />

          {product.isFeatured ? (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brass px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-ink">
              <Sparkles aria-hidden="true" className="h-3 w-3" />
              Featured
            </span>
          ) : null}

          <span className="absolute right-3 top-3 rounded-full glass px-2.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink">
            {product.brand.name}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-brass-deep">
            {product.category.name}
          </p>
          <h3 className="mt-2 text-card text-ink">{product.name}</h3>

          {specs.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {specs.map((spec) => (
                <li
                  key={spec as string}
                  className="rounded-full border border-line px-2.5 py-1 text-[0.75rem] text-body"
                >
                  {spec}
                </li>
              ))}
            </ul>
          ) : null}

          <span className="mt-auto flex items-center gap-1.5 pt-5 text-[0.875rem] font-semibold text-ink">
            View in 4K
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 text-brass transition-transform duration-400 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
    </TiltCard>
  );
}
