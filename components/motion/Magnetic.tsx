'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

/**
 * Pulls its child a little way toward the pointer, then lets it spring back.
 *
 * The element's box is measured once, when the pointer enters — never during
 * the move. Reading layout on every pointermove is what turns an effect like
 * this into a frame-dropper, because each read has to wait for the style
 * changes the previous move wrote. Moves only write a transform.
 */
export function Magnetic({
  strength = 0.32,
  radius = 1,
  className,
  children,
}: {
  /** How far the child follows, as a fraction of the pointer's offset. */
  strength?: number;
  /** Multiplier on the hit area, so the pull starts before the pointer lands. */
  radius?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const box = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const reduced = usePrefersReducedMotion();

  const write = useCallback((x: number, y: number) => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const node = ref.current;
      if (node) node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, []);

  const onPointerEnter = useCallback((event: React.PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'mouse') return;
    box.current = event.currentTarget.getBoundingClientRect();
  }, []);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>) => {
      if (reduced || event.pointerType !== 'mouse') return;
      const rect = box.current;
      if (!rect) return;

      const dx = (event.clientX - (rect.left + rect.width / 2)) * strength;
      const dy = (event.clientY - (rect.top + rect.height / 2)) * strength;
      write(dx * radius, dy * radius);
    },
    [reduced, strength, radius, write],
  );

  const onPointerLeave = useCallback(() => {
    box.current = null;
    write(0, 0);
  }, [write]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <span
      ref={ref}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerLeave}
      className={cn('magnetic inline-flex', className)}
    >
      {children}
    </span>
  );
}
