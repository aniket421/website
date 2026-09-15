import type { Metadata } from 'next';
import { LocalBusinessJsonLd } from '@/components/LocalBusinessJsonLd';
import { Hero } from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';
import { BrandMarquee } from '@/components/sections/BrandMarquee';
import { ShowroomVideo } from '@/components/sections/ShowroomVideo';
import { CategoryRail } from '@/components/sections/CategoryRail';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
import { Contact } from '@/components/sections/Contact';

/** Showroom edits appear within five minutes without a redeploy. */
export const revalidate = 300;

export const metadata: Metadata = {
  /*
   * Spelled out in full: a title.template on the root layout applies to child
   * segments, not to the page sharing that segment, so the homepage would
   * otherwise ship without the showroom's name in the tab or the SERP.
   *
   * TODO: add public/assets/og-image.jpg (1200x630) and reference it under
   * openGraph.images once the showroom photography is supplied.
   */
  title: 'Elegance Bath Decor — Tile and Bathware Showroom in Ghaziabad',
  description:
    'Designer tiles, wall and floor tiles, sanitaryware, faucets, wash basins, large slabs and bathroom accessories from nine premium brands. Visit the Elegance Bath Decor showroom in Nehru Nagar, Ghaziabad.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Elegance Bath Decor — Tile and Bathware Showroom in Ghaziabad',
    description:
      'Nine premium brands on one floor in Ghaziabad. Designer tiles, sanitaryware, faucets, wash basins and large-format slabs, in stock since 2009.',
    siteName: 'Elegance Bath Decor',
    locale: 'en_IN',
  },
};

export default function HomePage() {
  return (
    <>
      <LocalBusinessJsonLd />
      <Hero />
      <Stats />
      <BrandMarquee />
      <ShowroomVideo />
      <CategoryRail />
      <WhyChooseUs />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
