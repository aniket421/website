import type { Metadata } from 'next';
import { Clock, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { Reveal } from '@/components/motion/Reveal';
import { stagger } from '@/lib/motion/stagger';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { getEnquiryOptions } from '@/lib/queries/reference';
import { safeQuery } from '@/lib/queries/safe';
import { emptyEnquiry } from '@/lib/validations/enquiry';
import { site } from '@/lib/data/site';

export const metadata: Metadata = {
  title: 'Send an Enquiry',
  description: `Tell ${site.name} what you are working on — rooms, rough area and timing — and a consultant will come back with sizes, availability and a price within 24 hours.`,
  alternates: { canonical: '/enquiry' },
};

/** Prefills come from the query string, so this cannot be prerendered. */
export const dynamic = 'force-dynamic';

/** What happens after the form is sent, in order. */
const STEPS = [
  {
    icon: FileText,
    title: 'You send the details',
    body: 'Rooms, a rough area, and a plan or photograph if you have one. Nothing else is needed to start.',
  },
  {
    icon: Sparkles,
    title: 'We pull the ranges',
    body: 'A consultant checks what is on the floor against what you described, including sizes we have not put on the site yet.',
  },
  {
    icon: Clock,
    title: 'You hear back within 24 hours',
    body: 'A call on the number you gave us, during showroom hours, with sizes, availability and a price for your area.',
  },
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';

export default async function EnquiryPage({ searchParams }: { searchParams: SearchParams }) {
  const { brands, categories } = await safeQuery(
    'enquiryOptions',
    () => getEnquiryOptions(),
    { brands: [], categories: [] },
  );

  /*
   * A product page links here with the range already chosen. The ids are
   * checked against the real options before they are used — anything else in
   * the query string is somebody guessing, and a select bound to an id that
   * does not exist renders blank with no explanation.
   */
  const product = first(searchParams.product).slice(0, 140);
  const brandId = brands.some((brand) => brand.id === first(searchParams.brand))
    ? first(searchParams.brand)
    : '';
  const categoryId = categories.some((category) => category.id === first(searchParams.category))
    ? first(searchParams.category)
    : '';

  const defaults = {
    ...emptyEnquiry,
    brandId,
    categoryId,
    message: product ? `I would like details and a price for ${product}.` : '',
  };

  return (
    <>
      <PageHero
        eyebrow="Send An Enquiry"
        title="Tell us what you are building"
        lede={`${site.responsePromise} The more you tell us about the space, the more useful the first call is — bring the plan if you have one.`}
        crumbs={[{ label: 'Enquiry', href: '/enquiry' }]}
      />

      <Section aria-labelledby="enquiry-heading">
        <Container>
          <h2 id="enquiry-heading" className="sr-only">
            Enquiry form
          </h2>

          <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            <div>
              <Reveal y={22}>
                <h3 className="text-heading">What happens next</h3>
              </Reveal>

              <ol className="mt-9 space-y-8">
                {STEPS.map((step, index) => (
                  <Reveal
                    as="li"
                    key={step.title}
                    y={22}
                    delay={stagger(index, 120)}
                    className="relative flex gap-5"
                  >
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-surface-alt">
                      <step.icon aria-hidden="true" className="h-5 w-5 text-brass" strokeWidth={1.5} />
                      <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[0.6875rem] font-bold text-ink">
                        {index + 1}
                      </span>
                    </span>
                    <div>
                      <h4 className="text-card text-ink">{step.title}</h4>
                      <p className="mt-2 max-w-[42ch] text-[0.9375rem] leading-[1.7]">
                        {step.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ol>

              <Reveal y={20} delay={420} className="mt-10 rounded-panel bg-surface-alt p-6">
                <p className="flex items-start gap-3 text-[0.9375rem] leading-[1.7]">
                  <ShieldCheck
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-brass"
                    strokeWidth={1.5}
                  />
                  <span>
                    Your details go to the showroom and nowhere else. We use them to answer
                    this enquiry — no lists, no resale, no marketing you did not ask for.
                  </span>
                </p>
              </Reveal>
            </div>

            <Reveal y={30} delay={160} scale={0.99} duration={900}>
              <EnquiryForm brands={brands} categories={categories} defaults={defaults} />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
