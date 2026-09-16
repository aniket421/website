'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Expand } from 'lucide-react';
import { cloudinaryUrl } from '@/lib/images';
import { ProductViewer, type ViewerImage } from '@/components/product/ProductViewer';
import { cn } from '@/lib/utils';

/**
 * The product's photographs, with the full-resolution viewer behind them.
 *
 * The frame shows a 1600px derivative — enough to read the surface on a large
 * laptop — and only asks Cloudinary for the 4K file once someone opens the
 * viewer. Loading 4K into a half-width frame would cost several megabytes to
 * show detail the frame is too small to render.
 */
export function ProductGallery({
  images,
  title,
}: {
  images: (ViewerImage & { id?: string })[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div
        role="img"
        aria-label={`${title} — photograph to follow`}
        className="asset-placeholder aspect-[4/3.2] w-full rounded-panel"
      />
    );
  }

  const current = images[index]!;

  return (
    <div>
      <button
        type="button"
        onClick={() => setViewerOpen(true)}
        aria-label={`Open ${title} full screen at full resolution`}
        className="group relative block aspect-[4/3.2] w-full overflow-hidden rounded-panel border border-line bg-surface-alt"
      >
        {images.map((image, position) => (
          <Image
            key={image.url}
            src={cloudinaryUrl(image.url, { width: 1600, quality: 'best' })}
            alt={image.altText ?? title}
            fill
            priority={position === 0}
            sizes="(max-width: 1024px) 100vw, 54vw"
            className={cn(
              'object-cover transition-[opacity,transform] duration-800 ease-out-expo',
              position === index ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
            )}
          />
        ))}

        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full glass px-4 py-2.5 text-[0.8125rem] font-bold text-ink transition-transform duration-400 ease-spring group-hover:scale-105">
          <Expand aria-hidden="true" className="h-4 w-4 text-brass-deep" />
          View in 4K
        </span>
      </button>

      {images.length > 1 ? (
        <ul className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, position) => (
            <li key={image.url}>
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Show image ${position + 1} of ${images.length}`}
                aria-current={position === index ? 'true' : undefined}
                className={cn(
                  'relative h-20 w-24 shrink-0 overflow-hidden rounded-sm border-2 transition-[border-color,transform] duration-400 ease-spring hover:scale-105',
                  position === index ? 'border-brass' : 'border-transparent opacity-65',
                )}
              >
                <Image
                  src={cloudinaryUrl(image.url, { width: 240 })}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {viewerOpen ? (
        <ProductViewer
          images={images}
          index={index}
          title={title}
          onIndexChange={setIndex}
          onClose={() => setViewerOpen(false)}
        />
      ) : null}
    </div>
  );
}
