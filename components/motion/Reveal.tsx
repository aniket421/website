'use client';

import { useInView } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

type RevealElement =
  | 'div'
  | 'section'
  | 'li'
  | 'article'
  | 'span'
  | 'p'
  | 'header'
  | 'figure'
  | 'nav'
  | 'ul';

/**
 * Reveals its children when they scroll into view.
 *
 * Only opacity and transform are animated, and both are set from CSS via the
 * `data-reveal` attribute — the compositor can run the whole transition without
 * the main thread, which is what lets it hold a 120Hz frame budget while the
 * rest of the page is still hydrating.
 *
 * The hidden state lives in globals.css, and a <noscript> rule there turns it
 * off entirely, so the content is never hidden from a reader without
 * JavaScript.
 */
export function Reveal({
  as: Tag = 'div',
  y = 26,
  x = 0,
  scale = 1,
  blur = false,
  delay = 0,
  duration = 820,
  once = true,
  amount = 0.15,
  className,
  children,
  ...rest
}: {
  as?: RevealElement;
  /** Starting offset in px. */
  y?: number;
  x?: number;
  /** Starting scale, e.g. 0.96 for a subtle rise-and-settle. */
  scale?: number;
  /** Adds a short defocus to the entry. Costs a paint — use it sparingly. */
  blur?: boolean;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const { ref, inView } = useInView<HTMLDivElement>({ amount, once });

  /*
   * `as` narrows the union to one element for the type checker only — the
   * value is still whichever tag was asked for, so this renders a real <li>
   * inside a list and a real <section> where one is wanted.
   */
  const Component = Tag as 'div';

  return (
    <Component
      ref={ref}
      data-reveal={inView ? 'in' : 'out'}
      style={
        {
          '--reveal-y': `${y}px`,
          '--reveal-x': `${x}px`,
          '--reveal-scale': scale,
          '--reveal-blur': blur ? '6px' : '0px',
          '--reveal-delay': `${delay}ms`,
          '--reveal-duration': `${duration}ms`,
        } as React.CSSProperties
      }
      className={cn('reveal', className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
