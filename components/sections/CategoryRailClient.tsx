'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cloudinaryUrl } from '@/lib/images';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { cn } from '@/lib/utils';

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export function CategoryRailClient({ categories }: { categories: CategoryItem[] }) {
  const railRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 1);

    // A sub-pixel gap at the end is common once the rail is scaled.
    setAtEnd(rail.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    sync();
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      rail.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const step = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector('li');
    const distance = card ? card.clientWidth + 24 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: distance * direction, behavior: 'smooth' });
  };

  return (
    <Section id="products" tone="alt" aria-labelledby="products-heading">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-eyebrow uppercase text-brass-deep">Our Collections</p>
            <h2 id="products-heading" className="mt-3 text-heading">
              Explore Product Categories
            </h2>
            <p className="mt-4 max-w-lede text-lede">
              Stocked deep enough that what you choose on the floor is what
              leaves with you. Open a category to see the ranges in 4K.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <RailButton
              label="Previous categories"
              onClick={() => step(-1)}
              disabled={atStart}
            >
              <ArrowLeft aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            </RailButton>
            <RailButton label="Next categories" onClick={() => step(1)} disabled={atEnd}>
              <ArrowRight aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            </RailButton>
          </div>
        </div>
      </Container>

      <Container className="mt-11">
        <ul
          ref={railRef}
          // Focusable so the rail can be scrolled with the arrow keys; it keeps
          // native list semantics rather than nesting a second region landmark
          // inside the section's own.
          tabIndex={0}
          aria-label="Product categories, scroll or use the arrow keys"
          className="no-scrollbar -mx-gutter flex snap-x snap-mandatory scroll-pl-gutter gap-6 overflow-x-auto px-gutter pb-2 lg:-mx-gutter-lg lg:scroll-pl-gutter-lg lg:px-gutter-lg"
        >
          {categories.map((category) => (
            <li
              key={category.slug}
              className="w-[248px] shrink-0 snap-start sm:w-[276px]"
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group relative block aspect-card overflow-hidden rounded-card"
              >
                {category.imageUrl ? (
                  <Image
                    src={cloudinaryUrl(category.imageUrl, { width: 720 })}
                    alt={`${category.name} on display in the showroom`}
                    fill
                    sizes="(max-width: 640px) 248px, 276px"
                    className="object-cover transition-transform duration-900 ease-out-expo group-hover:scale-[1.08]"
                  />
                ) : (
                  /* Warm neutral stand-in until the showroom uploads a photo. */
                  <div
                    role="img"
                    aria-label={`${category.name} on display in the showroom`}
                    className="asset-placeholder absolute inset-0"
                  />
                )}
                {/*
                  The scrim holds at 0.75 or darker across the whole band the
                  text sits in, so the white title and description clear AA even
                  if the supplied photograph is very light.
                */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(to_top,rgba(26,26,26,0.92)_0%,rgba(26,26,26,0.75)_38%,rgba(26,26,26,0.25)_62%,rgba(26,26,26,0)_82%)]"
                />

                <span className="absolute right-4 top-4 inline-flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-brass text-ink opacity-0 transition-[opacity,transform] duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </span>

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-card text-surface">{category.name}</h3>
                  <p className="mt-1.5 text-[0.875rem] leading-[1.5] text-surface/85">
                    {category.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function RailButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-200',
        disabled
          ? 'cursor-not-allowed border-line text-body/35'
          : 'border-line text-ink hover:border-brass hover:bg-brass-tint',
      )}
    >
      {children}
    </button>
  );
}
