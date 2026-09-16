import { getFaqs } from '@/lib/queries/catalogue';
import { safeQuery } from '@/lib/queries/safe';
import { FaqAccordion } from '@/components/sections/FaqAccordion';

export async function Faq() {
  const faqs = await safeQuery('faqs', () => getFaqs(), []);
  if (faqs.length === 0) return null;

  return <FaqAccordion faqs={faqs} />;
}
