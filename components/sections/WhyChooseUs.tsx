import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { features } from '@/lib/data/features';

export function WhyChooseUs() {
  return (
    <Section id="about" aria-labelledby="why-heading">
      <Container>
        <SectionHeading
          id="why-heading"
          eyebrow="Why Choose Us"
          title="A showroom worth the drive"
          lede="Since 2009 we have built the floor around one idea: you should be able to see, touch and compare everything before you commit a rupee."
        />

        {/*
          Seven cards across three columns. The seventh lands alone in the first
          cell of the last row at its natural width — grid items fill their own
          cell, so nothing here stretches it.
        */}
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className="rounded-card border border-line bg-surface p-7 transition-all duration-300 ease-subtle hover:border-brass hover:shadow-brass"
              >
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-sm bg-surface-alt">
                  <Icon aria-hidden="true" className="h-7 w-7 text-brass" strokeWidth={1.5} />
                </span>
                <h3 className="mt-6 text-card">{feature.title}</h3>
                <p className="mt-2.5 text-[0.9375rem] leading-[1.65]">
                  {feature.description}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
