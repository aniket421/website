import Image from 'next/image';
import type { Asset } from '@/lib/data/assets';
import { cn } from '@/lib/utils';

const PLACEHOLDER_TONES = {
  light:
    'bg-[linear-gradient(135deg,theme(colors.brass.tint)_0%,theme(colors.surface.alt)_45%,theme(colors.brass.soft)_100%)]',
  /*
   * The hero carries white text over a scrim that is only 30% opaque at the
   * midpoint, so its placeholder has to be dark or that text drops to 2.35:1.
   */
  dark: 'bg-[linear-gradient(135deg,#2E2823_0%,#4A4038_50%,#241F1A_100%)]',
} as const;

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
  tone = 'light',
  className,
  imageClassName,
}: {
  asset: Asset;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  tone?: keyof typeof PLACEHOLDER_TONES;
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
          PLACEHOLDER_TONES[tone],
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
