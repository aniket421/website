import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

export type Crumb = { label: string; href?: string };

/**
 * The banner every page other than the home page opens with.
 *
 * It also carries the offset for the fixed header: the header is out of flow,
 * so something has to reserve its height, and putting that here means no page
 * has to remember to do it.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  crumbs = [],
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  crumbs?: Crumb[];
  /** Filters, counts or a call to action, sitting under the lede. */
  children?: React.ReactNode;
}) {
  return (
    <section
      data-dark-band
      className="grain relative overflow-hidden bg-footer pb-14 pt-[calc(var(--header-h)+56px)] lg:pb-20 lg:pt-[calc(var(--header-h)+84px)]"
    >
      <div aria-hidden="true" className="aurora" />

      <Container className="on-dark relative">
        {crumbs.length > 0 ? (
          <Reveal as="nav" y={10} duration={600} aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-surface/55">
              <li>
                <Link href="/" className="link-underline transition-colors hover:text-brass">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-surface/35" />
                  {crumb.href && index < crumbs.length - 1 ? (
                    <Link
                      href={crumb.href}
                      className="link-underline transition-colors hover:text-brass"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-surface/80">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Reveal>
        ) : null}

        <Reveal as="p" y={12} delay={80} className="mt-6 text-eyebrow uppercase text-brass">
          {eyebrow}
        </Reveal>

        <SplitText
          as="h1"
          text={title}
          delay={140}
          step={70}
          className="mt-3 block max-w-[22ch] text-display text-surface"
        />

        {lede ? (
          <Reveal y={20} delay={380}>
            <p className="mt-6 max-w-measure text-lede text-surface/75">{lede}</p>
          </Reveal>
        ) : null}

        {children ? (
          <Reveal y={20} delay={480} className="mt-9">
            {children}
          </Reveal>
        ) : null}
      </Container>
    </section>
  );
}
