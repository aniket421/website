import { getTestimonials } from '@/lib/queries/catalogue';
import { TestimonialsCarousel } from '@/components/sections/TestimonialsCarousel';

/** Server shell: fetches, then hands the carousel its data as props. */
export async function Testimonials() {
  const testimonials = await getTestimonials();
  if (testimonials.length === 0) return null;

  return <TestimonialsCarousel testimonials={testimonials} />;
}
