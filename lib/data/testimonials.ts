export type Testimonial = {
  quote: string;
  name: string;
  city: string;
  /** Out of five. Rendered as filled stars — do not round these up. */
  rating: 4 | 5;
  role: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'We had been to four showrooms before this one and left every time with a folder of catalogues and no decision. Here the slabs were up on the wall, lit properly, and we picked our bathroom in a single afternoon.',
    name: 'Ritu Malhotra',
    city: 'Indirapuram, Ghaziabad',
    rating: 5,
    role: 'Homeowner',
  },
  {
    quote:
      'I specify for eight to ten residential projects a year and the stock position here is genuinely reliable. When they say a range is available in 1200x2400, it is on the floor, not on order from Morbi.',
    name: 'Arjun Sethi',
    city: 'Sector 62, Noida',
    rating: 5,
    role: 'Architect',
  },
  {
    quote:
      'Third time buying from Elegance, once for our flat and twice for my brother. Delivery to the site took a day longer than promised, but they called ahead both times and the count was exact.',
    name: 'Praveen Kumar',
    city: 'Vaishali, Ghaziabad',
    rating: 4,
    role: 'Repeat customer',
  },
  {
    quote:
      'They sat with my client for two hours over grout colour without once trying to push a more expensive range. That patience is why I keep bringing people here.',
    name: 'Neha Bhardwaj',
    city: 'Raj Nagar Extension, Ghaziabad',
    rating: 5,
    role: 'Interior designer',
  },
];
