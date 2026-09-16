import type { MetadataRoute } from 'next';
import { getGalleryImages, getProductSlugs } from '@/lib/queries/catalogue';
import { safeQuery } from '@/lib/queries/safe';
import { site } from '@/lib/data/site';

export const revalidate = 3600;

/**
 * Only the pages that actually exist.
 *
 * Product detail pages are now real routes, so they are listed — but from the
 * database, never from a hardcoded list, or the sitemap drifts into 404s the
 * first time a range is retired. /enquiry is listed; the admin is not, and the
 * catalogue's filtered variants are not either — they are the same page with
 * different query strings, and every one of them canonicalises to /products.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [slugs, gallery] = await Promise.all([
    safeQuery('sitemapProducts', () => getProductSlugs(), []),
    safeQuery('sitemapGallery', () => getGalleryImages(), []),
  ]);

  const pages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${site.url}/products`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${site.url}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${site.url}/enquiry`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // An empty gallery page is not worth a crawl budget.
  if (gallery.length > 0) {
    pages.push({
      url: `${site.url}/gallery`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const slug of slugs) {
    pages.push({
      url: `${site.url}/products/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  pages.push(
    {
      url: `${site.url}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    { url: `${site.url}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  );

  return pages;
}
