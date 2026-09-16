'use client';

import { useInView } from '@/lib/motion/hooks';
import { cn } from '@/lib/utils';

/**
 * Lifts a heading into place one word at a time.
 *
 * Each word is wrapped in a masking span and translated up from below it, so
 * the line appears to rise out of the baseline rather than fade in flat. The
 * text stays one continuous string to a screen reader: the visual words are
 * aria-hidden and the whole phrase is exposed once via a visually hidden copy.
 */
export function SplitText({
  text,
  as: Tag = 'span',
  delay = 0,
  step = 55,
  className,
  wordClassName,
  id,
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  delay?: number;
  step?: number;
  className?: string;
  /** Applied to each word — use it to colour part of a headline. */
  wordClassName?: (word: string, index: number) => string | undefined;
  id?: string;
}) {
  const { ref, inView } = useInView<HTMLHeadingElement>({ amount: 0.3 });
  const words = text.split(' ');

  /* Narrows the union for the type checker; the rendered tag is unchanged. */
  const Component = Tag as 'h2';

  return (
    <Component
      id={id}
      ref={ref}
      className={cn('split-text', className)}
      data-reveal={inView ? 'in' : 'out'}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            {/* The mask clips the word's start position; the space has to sit
                outside it or overflow:hidden trims it and the words run together. */}
            <span className="split-text__mask">
              <span
                className={cn('split-text__word', wordClassName?.(word, index))}
                style={{ '--word-delay': `${delay + index * step}ms` } as React.CSSProperties}
              >
                {word}
              </span>
            </span>
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Component>
  );
}
