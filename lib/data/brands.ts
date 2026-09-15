/**
 * The nine partner brands stocked on the floor. Read by the marquee, the
 * footer and the enquiry form's brand select — this is the only list.
 */
export type Brand = {
  slug: string;
  name: string;
  /** Path to the supplied logo. Null renders the wordmark instead. */
  logo: string | null;
};

export const brands: Brand[] = [
  // TODO: supply logos as public/assets/brands/<slug>.svg — single colour,
  // 160x48 viewBox, transparent background. Until then each entry renders as
  // a set wordmark: nine identical placeholder blocks would defeat the point
  // of the roster.
  { slug: 'kajaria', name: 'Kajaria', logo: null },
  { slug: 'agl', name: 'AGL', logo: null },
  { slug: 'sunheart-ceramik', name: 'Sunheart Ceramik', logo: null },
  { slug: 'lioli-ceramica', name: 'Lioli Ceramica', logo: null },
  { slug: 'simero', name: 'Simero', logo: null },
  { slug: 'lavis-ceramic', name: 'Lavis Ceramic', logo: null },
  { slug: 'mozart', name: 'Mozart', logo: null },
  { slug: 'ivash', name: 'Ivash', logo: null },
  { slug: 'massimo', name: 'Massimo', logo: null },
];

export const brandNames = brands.map((brand) => brand.name);
