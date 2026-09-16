import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/layout/PageHero';
import { fullAddress, mailtoUrl, site, telUrl } from '@/lib/data/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Elegance Bath Decor handles the details you share through an enquiry, a phone call or a WhatsApp message.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        lede="What we collect when you send an enquiry, what we do with it, and who else ever sees it."
        crumbs={[{ label: 'Privacy Policy', href: '/privacy-policy' }]}
      />

      <Container className="max-w-measure py-section-sm lg:py-section">
        <div className="space-y-6 text-copy">
        <p>
          {site.name} collects only what it needs to answer your enquiry: your
          name, phone number and, if you choose to share them, your email
          address, city, the brand and category you are interested in, your
          message and any reference image you upload.
        </p>
        <p>
          We use those details to reply to you, to prepare a quotation and to
          arrange delivery. We do not sell them, and we do not pass them to
          anyone outside the showroom except where a manufacturer or a
          transporter needs them to fulfil your order.
        </p>
        <p>
          Enquiry records are kept while your project is active and for a
          reasonable period afterwards so we can help with warranty claims and
          repeat orders. You can ask us to correct or delete your details at any
          time.
        </p>
        <p>
          To make a request, or to ask anything about this policy, call{' '}
          <a href={telUrl} className="font-semibold text-ink underline decoration-brass underline-offset-4">
            {site.phone.display}
          </a>
          , email{' '}
          <a href={mailtoUrl} className="font-semibold text-ink underline decoration-brass underline-offset-4">
            {site.email}
          </a>{' '}
          or visit us at {fullAddress}.
        </p>
        </div>
      </Container>
    </>
  );
}
