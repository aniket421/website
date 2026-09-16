import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';
import { enquiryHref } from '@/lib/data/nav';
import { site, telUrl } from '@/lib/data/site';

/** The closing band: one decision, two ways to take it. */
export function CtaBand() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="grain relative overflow-hidden bg-footer py-section-sm lg:py-section"
    >
      <div aria-hidden="true" className="aurora" />

      <Container className="on-dark relative text-center">
        <Reveal as="p" y={12} className="text-eyebrow uppercase text-brass">
          Ready when you are
        </Reveal>

        <SplitText
          as="h2"
          id="cta-heading"
          text="Tell us about the space"
          className="mx-auto mt-4 block max-w-[18ch] text-heading text-surface"
        />

        <Reveal y={20} delay={320}>
          <p className="mx-auto mt-5 max-w-lede text-lede text-surface/75">
            {site.responsePromise} Send your plan, a photograph or just a rough area,
            and a consultant will come back with sizes, availability and a price.
          </p>
        </Reveal>

        <Reveal
          y={22}
          delay={440}
          className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href={enquiryHref}
            className="group inline-flex h-[3.25rem] items-center justify-center gap-2.5 rounded-full bg-brass px-7 text-copy font-semibold text-ink transition-[background-color,box-shadow] duration-300 hover:bg-brass-soft hover:shadow-brass"
          >
            Send an enquiry
            <ArrowRight
              aria-hidden="true"
              className="h-[1.125rem] w-[1.125rem] transition-transform duration-400 ease-spring group-hover:translate-x-1"
            />
          </Link>
          <a
            href={telUrl}
            className="inline-flex h-[3.25rem] items-center justify-center gap-2.5 rounded-full border border-surface/30 px-7 text-copy font-semibold text-surface transition-colors duration-300 hover:border-brass hover:text-brass"
          >
            <Phone aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            {site.phone.display}
          </a>
        </Reveal>
      </Container>
    </section>
  );
}
