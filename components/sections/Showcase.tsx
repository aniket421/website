import { getFeaturedProducts } from '@/lib/queries/catalogue';
import { safeQuery } from '@/lib/queries/safe';
import { ShowcaseClient } from '@/components/sections/ShowcaseClient';

/**
 * Renders nothing at all when the showroom has not uploaded photographed stock
 * yet — an empty 4K stage would be worse than no section.
 */
export async function Showcase() {
  const products = await safeQuery('featuredProducts', () => getFeaturedProducts(5), []);
  if (products.length === 0) return null;

  return <ShowcaseClient products={products} />;
}
