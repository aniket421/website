import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Camera } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ShowroomVideo } from '@/components/sections/ShowroomVideo';
import { Reveal } from '@/components/motion/Reveal';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { getGalleryImages } from '@/lib/queries/catalogue';
import { safeQuery } from '@/lib/queries/safe';
import { enquiryHref } from '@/lib/data/nav';
import { fullAddress } from '@/lib/data/site';

/** Gallery edits appear within five minutes without a redeploy. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Showroom Gallery',
  description:
    'Walk the Elegance Bath Decor floor in Ghaziabad: designer tiles, large-format slabs, sanitaryware and faucets photographed on display, at full resolution.',
  alternates: { canonical: '/gallery' },
};

export default async function GalleryPage() {
  const images = await safeQuery('galleryImages', () => getGalleryImages(), []);

  return (
    <>
      <PageHero
        eyebrow="The Showroom"
        title="Walk the floor before you drive over"
        lede={`Ranges as they are displayed at ${fullAddress}. Open any frame full screen — these are the manufacturers' own photographs, at full resolution.`}
        crumbs={[{ label: 'Gallery', href: '/gallery' }]}
      />

      <Section aria-label="Showroom photographs">
        <Container>
          {images.length > 0 ? (
            <GalleryGrid images={images} />
          ) : (
            <Reveal className="mx-auto max-w-[52ch] rounded-panel border border-line bg-surface-alt p-10 text-center">
              <Camera aria-hidden="true" className="mx-auto h-11 w-11 text-brass" strokeWidth={1.25} />
              <h2 className="mt-5 text-heading">The floor is being photographed</h2>
              <p className="mt-4 text-copy">
                Photographs of the display floor are going up here as they are shot. Until
                then the real thing is open six days a week — and if you tell us what you
                are looking for, we will send pictures of the exact ranges.
              </p>
              <Link
                href={enquiryHref}
                className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-ink-soft px-6 text-[0.9375rem] font-semibold text-surface transition-colors duration-300 hover:bg-ink"
              >
                Ask for photographs
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </Reveal>
          )}
        </Container>
      </Section>

      <ShowroomVideo />
    </>
  );
}
