/**
 * Showroom name, address and contact details. Every phone number, address and
 * opening hour on the site — header, footer, contact block, JSON-LD — reads
 * from here so there is exactly one place to change them.
 */

export const site = {
  name: 'Elegance Bath Decor',
  wordmark: { primary: 'Elegance', secondary: 'Bath Decor' },
  tagline: 'Premium multi-brand tile and bathware showroom',
  established: 2009,
  url: 'https://www.elegancebathdecor.com',

  phone: {
    display: '+91 98732 55836',
    dial: '+919873255836',
    whatsapp: '919873255836',
  },

  email: 'info@elegancebathdecor.com',

  address: {
    line1: 'II, 97A, Block F, Nehru Nagar II',
    line2: 'Nehru Nagar',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    postalCode: '201001',
    country: 'IN',
  },

  /**
   * TODO: confirm against the showroom's Google Business Profile pin before
   * launch — these are the Nehru Nagar II block centroid, accurate to ~150m.
   */
  geo: { latitude: 28.6608, longitude: 77.4308 },

  hours: [
    { label: 'Monday – Saturday', time: '10:00 AM – 8:00 PM' },
    { label: 'Sunday', time: '11:00 AM – 6:00 PM' },
  ],

  /** Machine-readable opening hours for LocalBusiness JSON-LD. */
  openingHoursSpec: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '20:00',
    },
    { days: ['Sunday'], opens: '11:00', closes: '18:00' },
  ],

  responsePromise: 'We reply to every enquiry within 24 hours.',
} as const;

export const fullAddress = [
  site.address.line1,
  site.address.line2,
  `${site.address.city}, ${site.address.state} ${site.address.postalCode}`,
].join(', ');

export const whatsappUrl = `https://wa.me/${site.phone.whatsapp}?text=${encodeURIComponent(
  "Hello Elegance Bath Decor, I'd like to ask about a product.",
)}`;

export const telUrl = `tel:${site.phone.dial}`;
export const mailtoUrl = `mailto:${site.email}`;

/** Keyless embed — no Maps API key required for the iframe or the deep link. */
export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  `${site.name}, ${fullAddress}`,
)}&output=embed`;

export const mapLinkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${site.name}, ${fullAddress}`,
)}`;
