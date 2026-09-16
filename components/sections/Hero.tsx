'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle, Star } from 'lucide-react';
import { AssetImage } from '@/components/ui/AssetImage';
import { Container } from '@/components/ui/Container';
import { Magnetic } from '@/components/motion/Magnetic';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';
import { enquiryHref } from '@/lib/data/nav';
import { heroImage } from '@/lib/data/assets';
import { site } from '@/lib/data/site';

/** Three lines of proof under the buttons, in the order people ask for them. */
const PROOF = [
  '9 premium brands',
  'In stock, not on order',
  `Serving Ghaziabad since ${site.established}`,
];

export function Hero() {
  return (
    <section
      id="top"
      data-dark-band
      className="grain relative min-h-[100svh] w-full overflow-hidden"
    >
      {/*
        The photograph drifts at a fifth of the scroll speed and holds a very
        slow zoom. Both are transforms on one layer, so the whole background
        costs a single composited frame however fast the reader scrolls.
      */}
      <Parallax speed={0.2} max={160} className="absolute inset-0">
        <div className="absolute inset-0 animate-slow-zoom">
          <AssetImage asset={heroImage} fill priority sizes="100vw" tone="dark" />
        </div>
      </Parallax>

      {/*
        Scrim: 58% at the top so the transparent header reads, 32% through the
        middle so the photograph survives, 72% at the base for the scroll cue.
        White text clears AA at every stop against the dark placeholder.

        TODO: the 32% midpoint is the tight one. Check the supplied
        marble-bathroom photograph before launch — a bright, high-key marble
        shot can push the lede under 4.5:1, in which case raise the middle
        stop to about 0.45 rather than shipping it as is.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,20,20,0.58)_0%,rgba(20,20,20,0.32)_48%,rgba(20,20,20,0.72)_100%)]"
      />

      <Container className="relative flex min-h-[100svh] flex-col items-center justify-center py-32 text-center">
        <Reveal y={16} duration={700} className="on-dark">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-surface/25 bg-surface/10 px-4 py-2 text-[0.8125rem] font-semibold text-surface backdrop-blur-md">
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brass" />
              <span className="relative h-2 w-2 rounded-full bg-brass" />
            </span>
            Premium Multi-Brand Showroom
          </p>
        </Reveal>

        <SplitText
          as="h1"
          text="Design Spaces That Inspire"
          delay={140}
          step={90}
          className="mt-7 block max-w-[19ch] text-display text-surface"
          wordClassName={(word) => (word === 'Inspire' ? 'text-gradient-brass' : undefined)}
        />

        <Reveal y={22} delay={480} className="on-dark">
          <p className="mx-auto mt-6 max-w-[54ch] text-lede text-surface/90">
            Designer tiles, sanitaryware, faucets, wash basins and large-format slabs
            from nine premium brands, all on one floor in Ghaziabad.
          </p>
        </Reveal>

        <Reveal
          y={22}
          delay={620}
          className="on-dark mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
        >
          <Magnetic>
            <Link
              href="/products"
              className="group inline-flex h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-full bg-brass px-7 text-copy font-semibold text-ink transition-[background-color,box-shadow] duration-300 hover:bg-brass-soft hover:shadow-brass sm:w-auto"
            >
              Explore Collection
              <ArrowRight
                aria-hidden="true"
                className="h-[1.125rem] w-[1.125rem] transition-transform duration-400 ease-spring group-hover:translate-x-1"
              />
            </Link>
          </Magnetic>

          <Magnetic>
            <Link
              href={enquiryHref}
              className="inline-flex h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-full border border-surface/35 bg-surface/15 px-7 text-copy font-semibold text-surface backdrop-blur-md transition-colors duration-300 hover:bg-surface/25 sm:w-auto"
            >
              Send Enquiry
              <MessageCircle aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            </Link>
          </Magnetic>
        </Reveal>

        <Reveal y={18} delay={760} className="on-dark mt-10">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[0.8125rem] font-medium text-surface/75">
            {PROOF.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Star
                  aria-hidden="true"
                  className="h-3.5 w-3.5 fill-brass text-brass"
                  strokeWidth={1.5}
                />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center"
      >
        <span className="flex h-11 w-[26px] items-start justify-center rounded-full border border-surface/45 pt-2">
          <span className="h-1.5 w-1.5 animate-scroll-cue rounded-full bg-surface" />
        </span>
      </div>
    </section>
  );
}
