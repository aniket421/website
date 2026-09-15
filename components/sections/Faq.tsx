'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { faqs } from '@/lib/data/faqs';
import { cn } from '@/lib/utils';

export function Faq() {
  // One panel open at a time; the first is open on load.
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <Section aria-labelledby="faq-heading">
      <Container>
        <SectionHeading
          id="faq-heading"
          eyebrow="Questions"
          title="Before you visit"
          lede="The five things people ask us most often, answered plainly."
        />

        <div className="mx-auto mt-12 max-w-[820px]">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;

            return (
              <div key={faq.question} className="border-b border-line first:border-t">
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex w-full items-start justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-[1.0625rem] font-bold leading-[1.45] text-ink">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-subtle',
                        open
                          ? 'rotate-45 border-brass bg-brass text-ink'
                          : 'border-line text-body',
                      )}
                    >
                      <Plus className="h-[1.125rem] w-[1.125rem]" />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!open}
                  className="pb-7 pr-16"
                >
                  <p className="max-w-measure text-[0.9375rem] leading-[1.7]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
