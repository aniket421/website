'use client';

import { useEffect, useRef, useState } from 'react';
import { subscribeScroll, type ScrollState } from '@/lib/motion/raf';

/**
 * Tracks the reduced-motion setting and keeps tracking it: people change it
 * mid-session, and a value read once at mount would strand them in whichever
 * mode they started in.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return reduced;
}

export type InViewOptions = {
  /** Fraction of the element that must be visible before it counts. */
  amount?: number;
  /** Shifts the trigger line; negative bottom values delay the reveal. */
  rootMargin?: string;
  /** Re-hide and replay when the element leaves the viewport again. */
  once?: boolean;
};

/**
 * Reports whether the referenced element is on screen.
 *
 * IntersectionObserver rather than scroll maths: the browser computes the
 * intersection off the main thread and only calls back when the answer
 * changes, so a page with sixty revealing elements costs nothing per frame.
 */
export function useInView<T extends Element>({
  amount = 0.2,
  rootMargin = '0px 0px -12% 0px',
  once = true,
}: InViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Without IntersectionObserver nothing would ever reveal, so show it all.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [amount, rootMargin, once]);

  return { ref, inView } as const;
}

/**
 * Subscribes to the shared scroll loop. The callback runs at most once per
 * frame and must only write styles — never read layout. See lib/motion/raf.ts.
 */
export function useScroll(onFrame: (state: ScrollState) => void) {
  const latest = useRef(onFrame);
  latest.current = onFrame;

  useEffect(() => subscribeScroll((state) => latest.current(state)), []);
}

/**
 * Locks body scrolling while an overlay is open, compensating for the
 * scrollbar so the page behind does not shift sideways as it disappears.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}
