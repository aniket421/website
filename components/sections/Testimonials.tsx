'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { testimonials } from '@/lib/data/testimonials';
import { cn } from '@/lib/utils';

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  const testimonial = testimonials[index];

  if (!testimonial) return null;

  const move = (direction: 1 | -1) =>
    setIndex((current) => (current + direction + total) % total);

  return (
    <Section tone="alt" aria-labelledby="testimonials-heading">
      <Container>
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Client Stories"
          title="What our customers say"
          lede="Reviews left on our Google Business Profile by the people who furnished their bathrooms here."
        />

        <div className="mx-auto mt-12 max-w-[820px] text-center">
          <span
            aria-hidden="true"
            className="block font-extrabold leading-[0.6] text-brass-soft text-[5.5rem]"
          >
            &ldquo;
          </span>

          {/*
            The key restarts the fade on every change — the single permitted
            transition here. Live region so the change is announced rather than
            only seen.
          */}
          <div
            key={index}
            aria-live="polite"
            className="mt-2 animate-fade-in"
          >
            <blockquote>
              <p className="text-balance text-[clamp(1.0625rem,0.95rem+0.45vw,1.25rem)] italic leading-[1.7] text-ink">
                {testimonial.quote}
              </p>
            </blockquote>

            <div
              className="mt-7 flex items-center justify-center gap-1"
              role="img"
              aria-label={`Rated ${testimonial.rating} out of 5`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  aria-hidden="true"
                  className={cn(
                    'h-[1.125rem] w-[1.125rem]',
                    star <= testimonial.rating
                      ? 'fill-brass text-brass'
                      : 'fill-none text-line',
                  )}
                />
              ))}
            </div>

            <p className="mt-5 text-card">{testimonial.name}</p>
            <p className="mt-1 text-[0.9375rem]">
              {testimonial.role} · {testimonial.city}
            </p>

            <p className="mt-5 inline-flex items-center rounded-full border border-line px-3.5 py-1.5 text-[0.8125rem] font-semibold text-body">
              Google Review
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6">
            <NavButton label="Previous testimonial" onClick={() => move(-1)}>
              <ArrowLeft aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            </NavButton>
            <p className="text-[0.9375rem] font-semibold tabular-nums text-ink">
              {index + 1} / {total}
            </p>
            <NavButton label="Next testimonial" onClick={() => move(1)}>
              <ArrowRight aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            </NavButton>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors duration-200 hover:border-brass hover:bg-brass-tint"
    >
      {children}
    </button>
  );
}
