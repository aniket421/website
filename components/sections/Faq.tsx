import { getFaqs } from '@/lib/queries/catalogue';
import { FaqAccordion } from '@/components/sections/FaqAccordion';

export async function Faq() {
  const faqs = await getFaqs();
  if (faqs.length === 0) return null;

  return <FaqAccordion faqs={faqs} />;
}
