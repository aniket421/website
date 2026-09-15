import type { MetadataRoute } from 'next';
import { site } from '@/lib/data/site';

export const revalidate = 3600;

/**
 * Only the pages that actually exist.
 *
 * The catalogue is served through /api/products for client-side filtering;
 * BACKEND.md §4 specifies no public product detail page, so listing
 * /products/<slug> here would publish a sitemap full of 404s. Add those entries
 * in the same commit that adds the pages, not before.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: site.url, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/privacy-policy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${site.url}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
