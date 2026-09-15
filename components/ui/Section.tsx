import { cn } from '@/lib/utils';

/** Vertical rhythm: 76px on mobile, 104px from the large breakpoint up. */
export function Section({
  id,
  tone = 'surface',
  className,
  'aria-labelledby': ariaLabelledBy,
  children,
}: {
  id?: string;
  tone?: 'surface' | 'alt';
  className?: string;
  'aria-labelledby'?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'py-section-sm lg:py-section',
        tone === 'alt' ? 'bg-surface-alt' : 'bg-surface',
        className,
      )}
    >
      {children}
    </section>
  );
}
