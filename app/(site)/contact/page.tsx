import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { ContactDetails } from '@/components/sections/ContactDetails';
import { Faq } from '@/components/sections/Faq';
import { LocalBusinessJsonLd } from '@/components/LocalBusinessJsonLd';
import { enquiryHref } from '@/lib/data/nav';
import { site } from '@/lib/data/site';

export const metadata: Metadata = {
  title: 'Contact the Showroom',
  description: `Visit, call or WhatsApp ${site.name} in Nehru Nagar, Ghaziabad. Showroom hours, directions and a map, plus a consultant on the floor six days a week.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <LocalBusinessJsonLd />

      <PageHero
        eyebrow="Get In Touch"
        title="Talk to someone on the floor"
        lede={`${site.responsePromise} Call, message or simply walk in — whichever you choose, the same team sees it through from the first question to the delivery note.`}
        crumbs={[{ label: 'Contact', href: '/contact' }]}
      >
        <Link
          href={enquiryHref}
          className="group inline-flex h-[3.25rem] items-center gap-2.5 rounded-full bg-brass px-7 text-copy font-semibold text-ink transition-[background-color,box-shadow] duration-300 hover:bg-brass-soft hover:shadow-brass"
        >
          Send a detailed enquiry
          <ArrowRight
            aria-hidden="true"
            className="h-[1.125rem] w-[1.125rem] transition-transform duration-400 ease-spring group-hover:translate-x-1"
          />
        </Link>
      </PageHero>

      <ContactDetails />
      <Faq />
    </>
  );
}
