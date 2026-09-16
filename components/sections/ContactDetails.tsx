import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { stagger } from '@/lib/motion/stagger';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import {
  fullAddress,
  mailtoUrl,
  mapEmbedUrl,
  mapLinkUrl,
  site,
  telUrl,
  whatsappUrl,
} from '@/lib/data/site';

/** The three ways to reach the floor, in the order people actually use them. */
const CHANNELS = [
  {
    icon: Phone,
    title: 'Call the showroom',
    body: site.phone.display,
    href: telUrl,
    hint: 'Someone on the floor picks up during showroom hours.',
    external: false,
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    body: 'Message us a photo',
    href: whatsappUrl,
    hint: 'Send a picture of the space and we will suggest ranges.',
    external: true,
  },
  {
    icon: Mail,
    title: 'Email',
    body: site.email,
    href: mailtoUrl,
    hint: 'Best for drawings, BOQs and area schedules.',
    external: false,
  },
] as const;

export function ContactDetails() {
  return (
    <Section aria-labelledby="contact-details-heading">
      <Container>
        <h2 id="contact-details-heading" className="sr-only">
          Showroom contact details
        </h2>

        <ul className="grid gap-5 sm:grid-cols-3">
          {CHANNELS.map((channel, index) => (
            <Reveal as="li" key={channel.title} y={24} delay={stagger(index, 110)}>
              <a
                href={channel.href}
                target={channel.external ? '_blank' : undefined}
                rel={channel.external ? 'noopener noreferrer' : undefined}
                className="group flex h-full flex-col rounded-panel border border-line bg-surface p-7 hover-lift hover:border-brass hover:shadow-panel"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-brass-tint transition-colors duration-400 group-hover:bg-brass">
                  <channel.icon
                    aria-hidden="true"
                    className="h-5 w-5 text-brass-deep transition-colors duration-400 group-hover:text-ink"
                    strokeWidth={1.5}
                  />
                </span>
                <h3 className="mt-5 text-[0.8125rem] font-bold uppercase tracking-[0.1em] text-brass-deep">
                  {channel.title}
                </h3>
                <p className="mt-2 text-card text-ink">{channel.body}</p>
                <p className="mt-2 text-[0.875rem] leading-[1.6]">{channel.hint}</p>
              </a>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal y={26}>
            <h3 className="text-heading">Come and see it in person</h3>
            <p className="mt-4 max-w-[46ch] text-lede">
              Walk in whenever it suits you. Weekday mornings are the quietest if you
              want unhurried time with a consultant and a floor plan on the table.
            </p>

            <ul className="mt-9 space-y-6">
              <DetailRow icon={MapPin} title="Showroom">
                <address className="not-italic">{fullAddress}</address>
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

              <DetailRow icon={Phone} title="Phone and WhatsApp">
                <a
                  href={telUrl}
                  className="link-underline font-semibold text-ink transition-colors hover:text-brass-deep"
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
                  className="link-underline font-semibold text-ink transition-colors hover:text-brass-deep"
                >
                  Message on WhatsApp
                </a>
              </DetailRow>
            </ul>
          </Reveal>

          <Reveal y={30} delay={140} scale={0.98}>
            <div className="relative overflow-hidden rounded-panel border border-line">
              <iframe
                src={mapEmbedUrl}
                title={`Map showing ${site.name} at ${fullAddress}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[340px] w-full border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 lg:h-[460px]"
              />
              <a
                href={mapLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 inline-flex h-11 items-center rounded-full bg-surface px-5 text-[0.875rem] font-semibold text-ink shadow-panel transition-transform duration-400 ease-spring hover:scale-105"
              >
                Open in Maps
              </a>
            </div>
          </Reveal>
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
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-surface-alt">
        <Icon aria-hidden="true" className="h-5 w-5 text-brass" strokeWidth={1.5} />
      </span>
      <div>
        <h4 className="text-[0.875rem] font-bold uppercase tracking-[0.1em] text-ink">{title}</h4>
        <div className="mt-1.5 text-[0.9375rem] leading-[1.7]">{children}</div>
      </div>
    </li>
  );
}
