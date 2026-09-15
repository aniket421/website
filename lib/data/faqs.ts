import { fullAddress, site } from './site';

export type Faq = { question: string; answer: string };

export const faqs: Faq[] = [
  {
    question: 'Do you deliver to my home or site?',
    answer:
      'Yes. We deliver across Ghaziabad, Noida, Delhi and the wider NCR, and we arrange transport further afield in Uttar Pradesh on request. Delivery is scheduled once your order is confirmed, and the driver calls ahead so someone can check the count off against the invoice at the gate.',
  },
  {
    question: 'Can I visit the showroom without an appointment?',
    answer: `Walk in whenever it suits you — we are open ${site.hours[0].time} Monday to Saturday and ${site.hours[1].time} on Sunday at ${fullAddress}. Weekday mornings are the quietest if you want unhurried time with a consultant. For a full bathroom or a large project, a call ahead means we can have the relevant ranges pulled out before you arrive.`,
  },
  {
    question: 'Is design consultation included?',
    answer:
      'It is, at no charge. Bring your floor plan, a rough budget and any references you have saved, and our team will work through tile sizes, layout, grout lines and fitting finishes with you. We will also tell you where a cheaper range does the same job — that conversation is part of the service, not an upsell.',
  },
  {
    question: 'Which brands do you carry?',
    answer:
      'Nine on the floor: Kajaria, AGL, Sunheart Ceramik, Lioli Ceramica, Simero, Lavis Ceramic, Mozart, Ivash and Massimo. All stock is sourced directly from the manufacturers, so warranty and batch documentation come with the order. If you have seen a range elsewhere that we do not stock, ask — we can usually source it.',
  },
  {
    question: 'Do you offer bulk pricing for contractors and architects?',
    answer:
      'Yes. We work with contractors, architects and interior designers on project rates, and the discount scales with volume rather than being a fixed slab. Send your BOQ or area schedule through the enquiry form and we will come back with a written quotation, typically within 24 hours.',
  },
];
