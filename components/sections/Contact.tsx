import { Clock, MapPin, Phone } from 'lucide-react';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { getEnquiryOptions } from '@/lib/queries/reference';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import {
  fullAddress,
  mapEmbedUrl,
  mapLinkUrl,
  site,
  telUrl,
  whatsappUrl,
} from '@/lib/data/site';

export async function Contact() {
  // Server Component: the options are in the first paint, not a client fetch.
  const { brands, categories } = await getEnquiryOptions();

  return (
    <Section id="contact" tone="alt" aria-labelledby="contact-heading">
      <Container>
        <SectionHeading
          id="contact-heading"
          eyebrow="Get In Touch"
          title="Send Us An Enquiry"
          lede={`${site.responsePromise} Tell us what you are working on and a consultant will come back with sizes, availability and a price.`}
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="text-card">The Elegance Concierge</h3>
            <p className="mt-3 max-w-[46ch] text-[0.9375rem] leading-[1.7]">
              Call, message or simply walk in. Whichever you choose, the same
              team sees it through.
            </p>

            <ul className="mt-8 space-y-6">
              <DetailRow icon={MapPin} title="Showroom">
                <address className="not-italic">{fullAddress}</address>
              </DetailRow>

              <DetailRow icon={Phone} title="Phone and WhatsApp">
                <a
                  href={telUrl}
                  className="font-semibold text-ink transition-colors hover:text-brass"
                >
                  {site.phone.display}
                </a>
                <span aria-hidden="true" className="px-2 text-line">
                  |
                </span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-ink transition-colors hover:text-brass"
                >
                  Message on WhatsApp
                </a>
              </DetailRow>

              <DetailRow icon={Clock} title="Business hours">
                <ul>
                  {site.hours.map((entry) => (
                    <li key={entry.label}>
                      {entry.label}: {entry.time}
                    </li>
                  ))}
                </ul>
              </DetailRow>
            </ul>

            <div className="relative mt-9 overflow-hidden rounded-card border border-line">
              <iframe
                src={mapEmbedUrl}
                title={`Map showing ${site.name} at ${fullAddress}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[280px] w-full border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 lg:h-[320px]"
              />
              <a
                href={mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 inline-flex h-11 items-center rounded-full bg-surface px-5 text-[0.875rem] font-semibold text-ink shadow-panel transition-colors hover:bg-brass-tint"
              >
                Open in Maps
              </a>
            </div>
          </div>

          <EnquiryForm brands={brands} categories={categories} />
        </div>
      </Container>
    </Section>
  );
}

function DetailRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-surface">
        <Icon aria-hidden="true" className="h-5 w-5 text-brass" strokeWidth={1.5} />
      </span>
      <div>
        <h4 className="text-[0.875rem] font-bold uppercase tracking-[0.1em] text-ink">
          {title}
        </h4>
        <div className="mt-1.5 text-[0.9375rem] leading-[1.7]">{children}</div>
      </div>
    </li>
  );
}
