/**
 * The credibility band under the hero.
 *
 * Held as numbers rather than strings so the counter can animate to them and
 * the digits can be grouped the way the showroom's customers read them —
 * 1,00,000 rather than 100,000.
 */
export const stats = [
  { value: 5000, suffix: '+', label: 'Products Available' },
  { value: 15, suffix: '+', label: 'Years of Trust' },
  { value: 100000, suffix: '+', label: 'Happy Customers' },
] as const;
