'use client';

import { useRef } from 'react';
import { usePrefersReducedMotion, useScroll } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

/**
 * Moves its child at a fraction of the scroll speed.
 *
 * Driven from the shared rAF loop, and the only thing it ever writes is a
 * translate — no layout is read here, which is what keeps it smooth while the
 * rest of the page is doing real work. Because it is anchored to the document
 * rather than to the element's own box, it is meant for things pinned near the
 * top of the page: hero backgrounds, section washes.
 */
export function Parallax({
  speed = 0.18,
  max = 140,
  className,
  children,
}: {
  /** Fraction of the scroll distance to travel. Keep it under about 0.3. */
  speed?: number;
  /** Ceiling in px, so a long page cannot drag the layer out of its frame. */
  max?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useScroll(({ y }) => {
    const node = ref.current;
    if (!node) return;
    const offset = reduced ? 0 : Math.min(max, y * speed);
    node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  });

  return (
    <div ref={ref} className={cn('will-change-transform', className)}>
      {children}
    </div>
  );
}
