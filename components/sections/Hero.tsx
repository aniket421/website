import { ArrowRight, MessageCircle } from 'lucide-react';
import { AssetImage } from '@/components/ui/AssetImage';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { heroImage } from '@/lib/data/assets';

export function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <AssetImage asset={heroImage} fill priority sizes="100vw" tone="dark" />
        {/*
          Scrim: 55% at the top so the transparent header reads, 30% through the
          middle so the photograph survives, 60% at the base for the scroll cue.
          White text clears AA at every stop against the dark placeholder.

          TODO: the 30% midpoint is the tight one. Check the supplied
          marble-bathroom photograph before launch — a bright, high-key marble
          shot can push the lede under 4.5:1, in which case raise the middle
          stop to about 0.45 rather than shipping it as is.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(26,26,26,0.55)_0%,rgba(26,26,26,0.3)_50%,rgba(26,26,26,0.6)_100%)]"
        />
      </div>

      <Container className="relative flex min-h-[100svh] flex-col items-center justify-center py-32 text-center">
        <p className="inline-flex items-center gap-2.5 rounded-full border border-surface/30 bg-surface/15 px-4 py-2 text-[0.8125rem] font-semibold text-surface backdrop-blur-md">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brass" />
          Premium Multi-Brand Showroom
        </p>

        <h1 className="mt-7 max-w-[19ch] text-display text-surface">
          Design Spaces That <span className="text-brass">Inspire</span>
        </h1>

        <p className="mt-6 max-w-[54ch] text-lede text-surface/90">
          Designer tiles, sanitaryware, faucets, wash basins and large-format
          slabs from nine premium brands, all on one floor in Ghaziabad.
        </p>

        <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="#products" variant="brass" size="lg">
            Explore Collection
            <ArrowRight aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
          </ButtonLink>
          <ButtonLink href="#contact" variant="glass" size="lg">
            Contact Us
            <MessageCircle aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
          </ButtonLink>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center"
      >
        <span className="flex h-11 w-[26px] items-start justify-center rounded-full border border-surface/45 pt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-surface animate-scroll-cue" />
        </span>
      </div>
    </section>
  );
}
