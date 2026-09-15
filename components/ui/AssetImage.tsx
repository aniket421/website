import Image from 'next/image';
import type { Asset } from '@/lib/data/assets';
import { cn } from '@/lib/utils';

/**
 * Renders a supplied photograph, or a warm neutral gradient of the same shape
 * while the slot is still empty. The gradient carries the subject as an
 * accessible label so the layout reads correctly either way.
 */
export function AssetImage({
  asset,
  fill = false,
  priority = false,
  sizes,
  className,
  imageClassName,
}: {
  asset: Asset;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
}) {
  if (!asset.src) {
    return (
      <div
        role="img"
        aria-label={asset.alt}
        data-awaiting-asset={asset.expected}
        className={cn(
          'bg-[linear-gradient(135deg,theme(colors.brass.tint)_0%,theme(colors.surface.alt)_45%,theme(colors.brass.soft)_100%)]',
          fill ? 'absolute inset-0 h-full w-full' : 'h-full w-full',
          className,
        )}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        sizes={sizes ?? '100vw'}
        priority={priority}
        className={cn('object-cover', imageClassName, className)}
      />
    );
  }

  return (
    <Image
      src={asset.src}
      alt={asset.alt}
      width={asset.width}
      height={asset.height}
      sizes={sizes}
      priority={priority}
      className={cn('object-cover', imageClassName, className)}
    />
  );
}
