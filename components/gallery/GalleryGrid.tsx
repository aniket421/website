'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Expand } from 'lucide-react';
import type { GalleryImageItem } from '@/lib/queries/catalogue';
import { cloudinaryUrl, imageSizes } from '@/lib/images';
import { ProductViewer } from '@/components/product/ProductViewer';
import { Reveal } from '@/components/motion/Reveal';
import { stagger } from '@/lib/motion/stagger';
import { cn } from '@/lib/utils';

/**
 * The showroom gallery.
 *
 * A CSS masonry — `columns` rather than a grid — so portrait and landscape
 * frames sit together without being cropped to a common ratio. Filtering is
 * client-side: the whole set is a few dozen images, already on the page, and a
 * round trip to re-fetch them would be slower than the animation it replaces.
 */
export function GalleryGrid({ images }: { images: GalleryImageItem[] }) {
  const [filter, setFilter] = useState<string>('all');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const image of images) {
      if (image.category) seen.set(image.category.slug, image.category.name);
    }
    return [...seen.entries()].map(([slug, name]) => ({ slug, name }));
  }, [images]);

  const visible = useMemo(
    () => (filter === 'all' ? images : images.filter((image) => image.category?.slug === filter)),
    [images, filter],
  );

  const viewerImages = visible.map((image) => ({
    url: image.url,
    altText: image.altText,
  }));

  return (
    <div>
      {categories.length > 1 ? (
        <Reveal as="ul" y={14} className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <li>
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
              Everything
            </FilterChip>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <FilterChip
                active={filter === category.slug}
                onClick={() => setFilter(category.slug)}
              >
                {category.name}
              </FilterChip>
            </li>
          ))}
        </Reveal>
      ) : null}

      <div
        className={cn(
          'mt-8 gap-5 [column-fill:_balance] sm:columns-2 lg:columns-3',
          categories.length > 1 ? 'mt-8' : 'mt-0',
        )}
      >
        {visible.map((image, index) => (
          <Reveal
            key={image.id}
            y={30}
            scale={0.97}
            delay={stagger(index % 3, 110)}
            className="mb-5 break-inside-avoid"
          >
            <button
              type="button"
              onClick={() => setViewerIndex(index)}
              aria-label={`Open: ${image.altText}`}
              className="group relative block w-full overflow-hidden rounded-card border border-line bg-surface-alt"
            >
              <Image
                src={cloudinaryUrl(image.url, { width: 1200 })}
                alt={image.altText}
                width={900}
                height={1200}
                sizes={imageSizes.galleryTile}
                className="h-auto w-full object-cover transition-transform duration-900 ease-out-expo group-hover:scale-[1.06]"
              />

              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,20,20,0.75),rgba(20,20,20,0)_55%)] opacity-0 transition-opacity duration-500 ease-out-expo group-hover:opacity-100"
              />

              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 opacity-0 transition-[opacity,transform] duration-500 ease-out-expo group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0">
                <span className="text-left">
                  {image.category ? (
                    <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-brass">
                      {image.category.name}
                    </span>
                  ) : null}
                  {image.caption ? (
                    <span className="mt-1 block text-[0.875rem] font-semibold text-surface">
                      {image.caption}
                    </span>
                  ) : null}
                </span>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass text-ink">
                  <Expand aria-hidden="true" className="h-4 w-4" />
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {viewerIndex !== null && viewerImages[viewerIndex] ? (
        <ProductViewer
          images={viewerImages}
          index={viewerIndex}
          title={visible[viewerIndex]?.caption ?? visible[viewerIndex]?.altText ?? 'Showroom'}
          onIndexChange={setViewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </div>
  );
}

function FilterChip({
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
          : 'border-line text-body hover:-translate-y-0.5 hover:border-brass hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
