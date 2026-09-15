import { Hero } from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';
import { BrandMarquee } from '@/components/sections/BrandMarquee';
import { ShowroomVideo } from '@/components/sections/ShowroomVideo';
import { CategoryRail } from '@/components/sections/CategoryRail';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
import { Contact } from '@/components/sections/Contact';

export default function HomePage() {
  return (
    <>
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
