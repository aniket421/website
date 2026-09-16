import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { PageHero } from '@/components/layout/PageHero';
import { mailtoUrl, site, telUrl } from '@/lib/data/site';

export const metadata: Metadata = {
  title: 'Terms',
  description:
    'The terms covering quotations, orders, delivery and returns at the Elegance Bath Decor showroom in Ghaziabad.',
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms"
        lede="How quotations, orders, delivery and returns work at the showroom."
        crumbs={[{ label: 'Terms', href: '/terms' }]}
      />

      <Container className="max-w-measure py-section-sm lg:py-section">
        <div className="space-y-6 text-copy">
        <p>
          This website describes the ranges carried at the {site.name} showroom.
          It is not a shop: nothing here is an offer to sell, and prices,
          availability and specifications are confirmed on a written quotation.
        </p>
        <p>
          Quotations hold for the period stated on them. Tile is sold by the box
          and rounded up to whole boxes, and we recommend ordering a wastage
          allowance on top of your measured area — our team will advise the
          figure for your layout.
        </p>
        <p>
          Shade and calibration vary between production batches. We supply a
          single batch wherever stock allows and will tell you in advance when a
          split batch is unavoidable.
        </p>
        <p>
          Check your delivery against the invoice before the vehicle leaves.
          Breakages and shortages reported at the point of delivery are replaced
          free of charge. Unopened, undamaged boxes in current ranges may be
          returned within seven days of delivery with the invoice; cut, laid or
          specially sourced material cannot be returned.
        </p>
        <p>
          Manufacturer warranties pass to you with the goods and we will help you
          make a claim. For anything else, call{' '}
          <a href={telUrl} className="font-semibold text-ink underline decoration-brass underline-offset-4">
            {site.phone.display}
          </a>{' '}
          or email{' '}
          <a href={mailtoUrl} className="font-semibold text-ink underline decoration-brass underline-offset-4">
            {site.email}
          </a>
          .
        </p>
        </div>
      </Container>
    </>
  );
}
