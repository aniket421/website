'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

/**
 * Tips the card toward the pointer and slides a brass sheen across it.
 *
 * Both effects are driven by two custom properties written once per frame, so
 * the whole card is a single composited layer no matter how much is inside it.
 * Like <Magnetic>, the box is measured on enter and never during the move.
 */
export function TiltCard({
  max = 7,
  sheen = true,
  className,
  children,
  ...rest
}: {
  /** Maximum rotation in degrees on either axis. */
  max?: number;
  sheen?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const box = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const reduced = usePrefersReducedMotion();

  const onPointerEnter = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    box.current = event.currentTarget.getBoundingClientRect();
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || event.pointerType !== 'mouse') return;
      const rect = box.current;
      const node = ref.current;
      if (!rect || !node) return;

      // -0.5 to 0.5 across each axis, measured from the card's centre.
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        node.style.setProperty('--tilt-x', `${(-py * max).toFixed(2)}deg`);
        node.style.setProperty('--tilt-y', `${(px * max).toFixed(2)}deg`);
        node.style.setProperty('--sheen-x', `${((px + 0.5) * 100).toFixed(1)}%`);
        node.style.setProperty('--sheen-y', `${((py + 0.5) * 100).toFixed(1)}%`);
      });
    },
    [reduced, max],
  );

  const reset = useCallback(() => {
    box.current = null;
    const node = ref.current;
    if (!node) return;
    cancelAnimationFrame(frame.current);
    node.style.setProperty('--tilt-x', '0deg');
    node.style.setProperty('--tilt-y', '0deg');
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <div
      ref={ref}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
      data-sheen={sheen ? '' : undefined}
      className={cn('tilt-card', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
