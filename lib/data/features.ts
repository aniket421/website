import {
  BadgeCheck,
  CalendarClock,
  Headset,
  Layers,
  PencilRuler,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: BadgeCheck,
    title: 'Authentic Products',
    description:
      'Every tile and fitting is sourced directly from the manufacturer, with the warranty and batch documentation to prove it.',
  },
  {
    icon: Layers,
    title: '9+ Premium Brands',
    description:
      'Kajaria, AGL, Lioli, Simero and more sit side by side on the floor, so you can compare finishes in the same light.',
  },
  {
    icon: PencilRuler,
    title: 'Design Consultation',
    description:
      'Bring your floor plan and our team will work through layouts, sizes and grout lines before you commit to an order.',
  },
  {
    icon: Headset,
    title: 'Dedicated Support',
    description:
      'One person stays with your project from first visit to final delivery, on call for site queries along the way.',
  },
  {
    icon: ShieldCheck,
    title: 'Durability and Quality',
    description:
      'Vitrified bodies, anti-skid ratings and PVD finishes are checked in stock, not just quoted from a catalogue.',
  },
  {
    icon: Sparkles,
    title: 'Wide Selection of Styles',
    description:
      'Marble, stone, terrazzo, concrete and wood-effect ranges, from quiet matte whites to book-matched statement slabs.',
  },
  {
    icon: CalendarClock,
    title: '15+ Years of Trust',
    description:
      'Serving Ghaziabad and the wider NCR since 2009, with families who now return for their second and third homes.',
  },
];
