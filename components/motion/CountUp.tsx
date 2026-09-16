'use client';

import { useEffect, useRef } from 'react';
import { useInView, usePrefersReducedMotion } from '@/lib/motion/hooks';

const formatters = {
  /** 1,00,000 — the grouping the showroom's customers read numbers in. */
  indian: (value: number) => value.toLocaleString('en-IN'),
  plain: (value: number) => String(value),
} as const;

/** Ease-out quint: quick off the mark, a long settle on the final digits. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 5);

/**
 * Counts up to `value` when the figure scrolls into view.
 *
 * The digits are written straight to the DOM node rather than through state.
 * At 120Hz a state-driven counter would schedule roughly 220 React renders per
 * figure over a 1.8s run; this schedules none, and the text node is the only
 * thing the browser has to re-lay-out.
 */
export function CountUp({
  value,
  suffix = '',
  duration = 1800,
  format = 'indian',
}: {
  value: number;
  suffix?: string;
  duration?: number;
  format?: keyof typeof formatters;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ amount: 0.5 });
  const reduced = usePrefersReducedMotion();
  const frame = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView) return;

    const render = (n: number) => {
      node.textContent = `${formatters[format](n)}${suffix}`;
    };

    if (reduced) {
      render(value);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      render(Math.round(easeOut(t) * value));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [inView, value, suffix, duration, format, reduced, ref]);

  return (
    <span ref={ref}>
      {/* Server-rendered as the final figure: correct before hydration, and
          correct for anyone the animation never runs for. */}
      {formatters[format](value)}
      {suffix}
    </span>
  );
}
